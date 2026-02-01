package repository

import (
	"backend/internal/generated"
	"backend/internal/models"
	"context"

	"gorm.io/gorm"
)

type MedicineFilter struct {
	Search                 string
	DosageForm             string
	IsPrescriptionRequired *bool
	Status                 string
}

type MedicineRepository interface {
	Create(ctx context.Context, medicine *models.Medicine) error
	FindByID(ctx context.Context, id generated.IdParam) (*models.Medicine, error)
	FindAll(ctx context.Context, page, perPage int, filter MedicineFilter) ([]models.Medicine, int64, error)
	Update(ctx context.Context, medicine *models.Medicine) error
	Delete(ctx context.Context, id generated.IdParam) error
}

type medicineRepository struct {
	db *gorm.DB
}

func NewMedicineRepository(db *gorm.DB) MedicineRepository {
	return &medicineRepository{db: db}
}

func (r *medicineRepository) Create(ctx context.Context, medicine *models.Medicine) error {
	return r.db.WithContext(ctx).Create(medicine).Error
}

func (r *medicineRepository) FindByID(ctx context.Context, id generated.IdParam) (*models.Medicine, error) {
	var medicine models.Medicine
	err := r.db.WithContext(ctx).First(&medicine, id).Error
	if err != nil {
		return nil, err
	}
	return &medicine, nil
}

func (r *medicineRepository) FindAll(
	ctx context.Context,
	page, perPage int,
	filter MedicineFilter,
) ([]models.Medicine, int64, error) {

	var medicines []models.Medicine
	var total int64

	offset := (page - 1) * perPage

	query := r.db.WithContext(ctx).Model(&models.Medicine{})

	// Search by name / code
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where(
			"name ILIKE ? OR code ILIKE ?",
			searchPattern,
			searchPattern,
		)
	}

	if filter.DosageForm != "" {
		query = query.Where("dosage_form = ?", filter.DosageForm)
	}

	if filter.IsPrescriptionRequired != nil {
		query = query.Where("is_prescription_required = ?", *filter.IsPrescriptionRequired)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("name ASC").
		Offset(offset).
		Limit(perPage).
		Find(&medicines).Error

	return medicines, total, err
}

func (r *medicineRepository) Update(ctx context.Context, medicine *models.Medicine) error {
	return r.db.WithContext(ctx).Save(medicine).Error
}

func (r *medicineRepository) Delete(ctx context.Context, id generated.IdParam) error {
	return r.db.WithContext(ctx).Delete(&models.Medicine{}, id).Error
}
