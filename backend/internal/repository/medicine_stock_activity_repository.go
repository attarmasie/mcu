package repository

import (
	"backend/internal/models"
	"context"

	"gorm.io/gorm"
)

type MedicineStockActivityFilter struct {
	Source string
}

type MedicineStockActivityRepository interface {
	Create(ctx context.Context, activity *models.MedicineStockActivity) error
	FindAllByMedicineID(ctx context.Context, medicineID string, page, perPage int, filter MedicineStockActivityFilter) ([]models.MedicineStockActivity, int64, error)
}

type medicineStockActivityRepository struct {
	db *gorm.DB
}

func NewMedicineStockActivityRepository(db *gorm.DB) MedicineStockActivityRepository {
	return &medicineStockActivityRepository{db: db}
}

func (r *medicineStockActivityRepository) Create(ctx context.Context, activity *models.MedicineStockActivity) error {
	return r.db.WithContext(ctx).Create(activity).Error
}

func (r *medicineStockActivityRepository) FindAllByMedicineID(
	ctx context.Context,
	medicineID string,
	page, perPage int,
	filter MedicineStockActivityFilter,
) ([]models.MedicineStockActivity, int64, error) {
	var activities []models.MedicineStockActivity
	var total int64

	offset := (page - 1) * perPage
	query := r.db.WithContext(ctx).Model(&models.MedicineStockActivity{}).Where("medicine_id = ?", medicineID)

	if filter.Source != "" {
		query = query.Where("source = ?", filter.Source)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&activities).Error; err != nil {
		return nil, 0, err
	}

	return activities, total, nil
}
