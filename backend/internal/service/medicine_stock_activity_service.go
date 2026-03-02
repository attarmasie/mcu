package service

import (
	"backend/internal/generated"
	"backend/internal/models"
	"backend/internal/repository"
	"context"
	"fmt"

	"gorm.io/gorm"
)

type MedicineStockChangeInput struct {
	MedicineID       string
	MedicineBatchID  *string
	PatientCheckupID *string
	Source           string
	QuantityDelta    int
	StockBefore      int
	StockAfter       int
	Notes            *string
	CreatedByUserID  *string
}

type MedicineStockActivityService interface {
	LogStockChange(ctx context.Context, tx *gorm.DB, input MedicineStockChangeInput) error
	ListByMedicineID(ctx context.Context, medicineID generated.IdParam, page, perPage int, filter repository.MedicineStockActivityFilter) ([]models.MedicineStockActivity, int64, error)
}

type medicineStockActivityService struct {
	repo repository.MedicineStockActivityRepository
	db   *gorm.DB
}

func NewMedicineStockActivityService(repo repository.MedicineStockActivityRepository, db *gorm.DB) MedicineStockActivityService {
	return &medicineStockActivityService{repo: repo, db: db}
}

func (s *medicineStockActivityService) LogStockChange(ctx context.Context, tx *gorm.DB, input MedicineStockChangeInput) error {
	if input.QuantityDelta == 0 {
		return nil
	}

	changeType := "increase"
	if input.QuantityDelta < 0 {
		changeType = "decrease"
	}

	activity := &models.MedicineStockActivity{
		MedicineID:       input.MedicineID,
		MedicineBatchID:  input.MedicineBatchID,
		PatientCheckupID: input.PatientCheckupID,
		ChangeType:       changeType,
		Source:           input.Source,
		QuantityDelta:    input.QuantityDelta,
		StockBefore:      input.StockBefore,
		StockAfter:       input.StockAfter,
		Notes:            input.Notes,
		CreatedByUserID:  input.CreatedByUserID,
	}

	writer := s.db.WithContext(ctx)
	if tx != nil {
		writer = tx.WithContext(ctx)
	}

	return writer.Create(activity).Error
}

func (s *medicineStockActivityService) ListByMedicineID(
	ctx context.Context,
	medicineID generated.IdParam,
	page, perPage int,
	filter repository.MedicineStockActivityFilter,
) ([]models.MedicineStockActivity, int64, error) {
	medicineUUID := medicineID.String()
	if medicineUUID == "" {
		return nil, 0, fmt.Errorf("medicine_id is required")
	}
	return s.repo.FindAllByMedicineID(ctx, medicineUUID, page, perPage, filter)
}
