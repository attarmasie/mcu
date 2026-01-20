package repository

import (
	"backend/internal/generated"
	"backend/internal/models"
	"context"

	"gorm.io/gorm"
)

type PatientFilter struct {
	Search      string
	Gender      string
	PatientType string
}

type PatientRepository interface {
	Create(ctx context.Context, patient *models.Patient) error
	FindByID(ctx context.Context, id generated.IdParam) (*models.Patient, error)
	FindAll(ctx context.Context, page, perPage int, filter PatientFilter) ([]models.Patient, int64, error)
	Update(ctx context.Context, patient *models.Patient) error
	Delete(ctx context.Context, id generated.IdParam) error
}

type patientRepository struct {
	db *gorm.DB
}

func NewPatientRepository(db *gorm.DB) PatientRepository {
	return &patientRepository{db: db}
}

func (r *patientRepository) Create(ctx context.Context, patient *models.Patient) error {
	return r.db.WithContext(ctx).Create(patient).Error
}

func (r *patientRepository) FindByID(ctx context.Context, id generated.IdParam) (*models.Patient, error) {
	var patient models.Patient
	err := r.db.WithContext(ctx).First(&patient, id).Error
	if err != nil {
		return nil, err
	}
	return &patient, nil
}

func (r *patientRepository) FindAll(ctx context.Context, page, perPage int, filter PatientFilter) ([]models.Patient, int64, error) {
	var patients []models.Patient
	var total int64

	offset := (page - 1) * perPage

	query := r.db.WithContext(ctx).Model(&models.Patient{})

	// Apply search filter (search across multiple columns)
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where(
			"full_name ILIKE ? OR phone_number ILIKE ? OR email ILIKE ? OR medical_record_number ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	// Apply gender filter
	if filter.Gender != "" {
		query = query.Where("gender = ?", filter.Gender)
	}

	// Apply patient type filter
	if filter.PatientType != "" {
		query = query.Where("patient_type = ?", filter.PatientType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Offset(offset).
		Limit(perPage).
		Find(&patients).Error
	return patients, total, err
}

func (r *patientRepository) Update(ctx context.Context, patient *models.Patient) error {
	return r.db.WithContext(ctx).Save(patient).Error
}

func (r *patientRepository) Delete(ctx context.Context, id generated.IdParam) error {
	return r.db.WithContext(ctx).Delete(&models.Patient{}, id).Error
}
