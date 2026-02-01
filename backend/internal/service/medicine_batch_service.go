package service

import (
	"backend/internal/cache"
	"backend/internal/generated"
	"backend/internal/models"
	"backend/internal/repository"
	"context"
	"fmt"
	"time"
)

type MedicineBatchService interface {
	CreateBatch(ctx context.Context, batch *models.MedicineBatch) error
	GetBatch(ctx context.Context, id generated.IdParam) (*models.MedicineBatch, error)
	ListBatches(ctx context.Context, page, perPage int, filter repository.MedicineBatchFilter) ([]models.MedicineBatch, int64, error)
	UpdateBatch(ctx context.Context, id generated.IdParam, batch *models.MedicineBatch) error
	DeleteBatch(ctx context.Context, id generated.IdParam) error
}

type medicineBatchService struct {
	repo  repository.MedicineBatchRepository
	cache cache.Cache
}

func NewMedicineBatchService(
	repo repository.MedicineBatchRepository,
	cache cache.Cache,
) MedicineBatchService {
	return &medicineBatchService{
		repo:  repo,
		cache: cache,
	}
}

func (s *medicineBatchService) CreateBatch(ctx context.Context, batch *models.MedicineBatch) error {
	// Auto set status berdasarkan expiration date
	if batch.ExpirationDate.Before(time.Now()) {
		batch.Status = "expired"
	} else {
		batch.Status = "active"
	}

	if err := s.repo.Create(ctx, batch); err != nil {
		return err
	}

	s.cache.DeletePattern(ctx, "medicine_batches:list:*")
	s.cache.DeletePattern(ctx, fmt.Sprintf("medicine:%s:batches:*", batch.MedicineID))

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

	if batch.ExpirationDate.Before(time.Now()) {
		batch.Status = "expired"
	}

	if err := s.repo.Update(ctx, batch); err != nil {
		return err
	}

	s.cache.Delete(ctx, fmt.Sprintf("medicine_batch:%s", id))
	s.cache.DeletePattern(ctx, "medicine_batches:list:*")
	return nil
}

func (s *medicineBatchService) DeleteBatch(ctx context.Context, id generated.IdParam) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	s.cache.Delete(ctx, fmt.Sprintf("medicine_batch:%s", id))
	s.cache.DeletePattern(ctx, "medicine_batches:list:*")
	return nil
}
