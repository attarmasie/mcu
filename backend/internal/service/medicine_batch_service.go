package service

import (
	"backend/internal/cache"
	"backend/internal/generated"
	"backend/internal/models"
	"backend/internal/repository"
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type MedicineBatchService interface {
	CreateBatch(ctx context.Context, batch *models.MedicineBatch) error
	GetBatch(ctx context.Context, id generated.IdParam) (*models.MedicineBatch, error)
	ListBatches(ctx context.Context, page, perPage int, filter repository.MedicineBatchFilter) ([]models.MedicineBatch, int64, error)
	UpdateBatch(ctx context.Context, id generated.IdParam, batch *models.MedicineBatch) error
	DeleteBatch(ctx context.Context, id generated.IdParam) error
}

type medicineBatchService struct {
	repo                 repository.MedicineBatchRepository
	cache                cache.Cache
	db                   *gorm.DB
	stockActivityService MedicineStockActivityService
}

func NewMedicineBatchService(
	repo repository.MedicineBatchRepository,
	cache cache.Cache,
	db *gorm.DB,
	stockActivityService MedicineStockActivityService,
) MedicineBatchService {
	return &medicineBatchService{
		repo:                 repo,
		cache:                cache,
		db:                   db,
		stockActivityService: stockActivityService,
	}
}

func (s *medicineBatchService) CreateBatch(ctx context.Context, batch *models.MedicineBatch) error {
	now := time.Now().UTC()
	if batch.ExpirationDate.Before(now) {
		batch.Status = "expired"
	} else if batch.Quantity <= 0 {
		batch.Status = "depleted"
	} else {
		batch.Status = "active"
	}

	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(batch).Error; err != nil {
			return err
		}

		before, after, err := recalculateMedicineStockTx(tx, batch.MedicineID)
		if err != nil {
			return err
		}

		note := "Batch created by admin"
		batchID := batch.ID.String()
		if err := s.stockActivityService.LogStockChange(ctx, tx, MedicineStockChangeInput{
			MedicineID:      batch.MedicineID,
			MedicineBatchID: &batchID,
			Source:          "admin",
			QuantityDelta:   after - before,
			StockBefore:     before,
			StockAfter:      after,
			Notes:           &note,
			CreatedByUserID: GetActorUserID(ctx),
		}); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	s.invalidateBatchCache(ctx, batch.MedicineID, batch.ID.String())
	return nil
}

func (s *medicineBatchService) GetBatch(ctx context.Context, id generated.IdParam) (*models.MedicineBatch, error) {
	cacheKey := fmt.Sprintf("medicine_batch:%s", id)

	var batch models.MedicineBatch
	if err := s.cache.Get(ctx, cacheKey, &batch); err == nil {
		return &batch, nil
	}

	batchFromDB, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	s.cache.Set(ctx, cacheKey, batchFromDB, 5*time.Minute)
	return batchFromDB, nil
}

func (s *medicineBatchService) ListBatches(
	ctx context.Context,
	page, perPage int,
	filter repository.MedicineBatchFilter,
) ([]models.MedicineBatch, int64, error) {

	expiredStr := "all"
	if filter.Expired != nil {
		if *filter.Expired {
			expiredStr = "true"
		} else {
			expiredStr = "false"
		}
	}

	cacheKey := fmt.Sprintf(
		"medicine_batches:list:%d:%d:%s:%s:%s",
		page,
		perPage,
		filter.MedicineID,
		filter.Status,
		expiredStr,
	)

	var result struct {
		Batches []models.MedicineBatch
		Total   int64
	}

	if err := s.cache.Get(ctx, cacheKey, &result); err == nil {
		return result.Batches, result.Total, nil
	}

	batches, total, err := s.repo.FindAll(ctx, page, perPage, filter)
	if err != nil {
		return nil, 0, err
	}

	result = struct {
		Batches []models.MedicineBatch
		Total   int64
	}{
		Batches: batches,
		Total:   total,
	}

	s.cache.Set(ctx, cacheKey, result, 2*time.Minute)
	return batches, total, nil
}

func (s *medicineBatchService) UpdateBatch(ctx context.Context, id generated.IdParam, batch *models.MedicineBatch) error {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	batch.ID = existing.ID
	batch.MedicineID = existing.MedicineID
	batch.CreatedAt = existing.CreatedAt

	if batch.ExpirationDate.Before(time.Now().UTC()) {
		batch.Status = "expired"
	} else if batch.Quantity <= 0 {
		batch.Status = "depleted"
	} else {
		batch.Status = "active"
	}

	oldQuantity := existing.Quantity
	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(batch).Error; err != nil {
			return err
		}

		before, after, err := recalculateMedicineStockTx(tx, batch.MedicineID)
		if err != nil {
			return err
		}

		note := "Batch updated by admin"
		delta := batch.Quantity - oldQuantity
		batchID := batch.ID.String()
		if err := s.stockActivityService.LogStockChange(ctx, tx, MedicineStockChangeInput{
			MedicineID:      batch.MedicineID,
			MedicineBatchID: &batchID,
			Source:          "admin",
			QuantityDelta:   delta,
			StockBefore:     before,
			StockAfter:      after,
			Notes:           &note,
			CreatedByUserID: GetActorUserID(ctx),
		}); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return err
	}

	s.invalidateBatchCache(ctx, batch.MedicineID, id.String())
	return nil
}

func (s *medicineBatchService) DeleteBatch(ctx context.Context, id generated.IdParam) error {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&models.MedicineBatch{}, id).Error; err != nil {
			return err
		}

		before, after, err := recalculateMedicineStockTx(tx, existing.MedicineID)
		if err != nil {
			return err
		}

		note := "Batch deleted by admin"
		batchID := existing.ID.String()
		if err := s.stockActivityService.LogStockChange(ctx, tx, MedicineStockChangeInput{
			MedicineID:      existing.MedicineID,
			MedicineBatchID: &batchID,
			Source:          "admin",
			QuantityDelta:   -existing.Quantity,
			StockBefore:     before,
			StockAfter:      after,
			Notes:           &note,
			CreatedByUserID: GetActorUserID(ctx),
		}); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	s.invalidateBatchCache(ctx, existing.MedicineID, id.String())
	return nil
}

func (s *medicineBatchService) invalidateBatchCache(ctx context.Context, medicineID, batchID string) {
	s.cache.Delete(ctx, fmt.Sprintf("medicine_batch:%s", batchID))
	s.cache.Delete(ctx, fmt.Sprintf("medicine:%s", medicineID))
	s.cache.DeletePattern(ctx, "medicine_batches:list:*")
	s.cache.DeletePattern(ctx, "medicines:list:*")
	s.cache.DeletePattern(ctx, fmt.Sprintf("medicine:%s:batches:*", medicineID))
}

func recalculateMedicineStockTx(tx *gorm.DB, medicineID string) (before int, after int, err error) {
	if err = tx.Model(&models.Medicine{}).
		Where("id = ?", medicineID).
		Select("current_stock").
		Scan(&before).Error; err != nil {
		return 0, 0, err
	}

	var total int64
	if err = tx.Model(&models.MedicineBatch{}).
		Where("medicine_id = ?", medicineID).
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&total).Error; err != nil {
		return 0, 0, err
	}
	after = int(total)

	if err = tx.Model(&models.Medicine{}).
		Where("id = ?", medicineID).
		Update("current_stock", after).Error; err != nil {
		return 0, 0, err
	}

	return before, after, nil
}
