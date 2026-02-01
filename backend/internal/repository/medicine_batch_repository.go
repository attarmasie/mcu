package repository

import (
	"backend/internal/generated"
	"backend/internal/models"
	"context"
	"time"

	"gorm.io/gorm"
)

type MedicineBatchFilter struct {
	MedicineID string
	Search     string
	Status     string
	Expired    *bool
}

type MedicineBatchRepository interface {
	Create(ctx context.Context, batch *models.MedicineBatch) error
	FindByID(ctx context.Context, id generated.IdParam) (*models.MedicineBatch, error)
	FindAll(ctx context.Context, page, perPage int, filter MedicineBatchFilter) ([]models.MedicineBatch, int64, error)
	Update(ctx context.Context, batch *models.MedicineBatch) error
	Delete(ctx context.Context, id generated.IdParam) error
}

type medicineBatchRepository struct {
	db *gorm.DB
}

func NewMedicineBatchRepository(db *gorm.DB) MedicineBatchRepository {
	return &medicineBatchRepository{db: db}
}

func (r *medicineBatchRepository) Create(ctx context.Context, batch *models.MedicineBatch) error {
	return r.db.WithContext(ctx).Create(batch).Error
}

func (r *medicineBatchRepository) FindByID(ctx context.Context, id generated.IdParam) (*models.MedicineBatch, error) {
	var batch models.MedicineBatch
	err := r.db.WithContext(ctx).
		Preload("Medicine").
		First(&batch, id).Error

	if err != nil {
		return nil, err
	}
	return &batch, nil
}

func (r *medicineBatchRepository) FindAll(
	ctx context.Context,
	page, perPage int,
	filter MedicineBatchFilter,
) ([]models.MedicineBatch, int64, error) {

	var batches []models.MedicineBatch
	var total int64

	offset := (page - 1) * perPage

	query := r.db.WithContext(ctx).
		Model(&models.MedicineBatch{}).
		Preload("Medicine")

	if filter.MedicineID != "" {
		query = query.Where("medicine_id = ?", filter.MedicineID)
	}

	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("batch_number ILIKE ?", searchPattern)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.Expired != nil {
		if *filter.Expired {
			query = query.Where("expiration_date < ?", time.Now())
		} else {
			query = query.Where("expiration_date >= ?", time.Now())
		}
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("expiration_date ASC"). // FEFO
		Offset(offset).
		Limit(perPage).
		Find(&batches).Error

	return batches, total, err
}

func (r *medicineBatchRepository) Update(ctx context.Context, batch *models.MedicineBatch) error {
	return r.db.WithContext(ctx).Save(batch).Error
}

func (r *medicineBatchRepository) Delete(ctx context.Context, id generated.IdParam) error {
	return r.db.WithContext(ctx).Delete(&models.MedicineBatch{}, id).Error
}
