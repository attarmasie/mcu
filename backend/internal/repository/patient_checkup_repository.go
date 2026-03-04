package repository

import (
	"backend/internal/generated"
	"backend/internal/models"
	"context"
	"time"

	"gorm.io/gorm"
)

type PatientCheckupFilter struct {
	Search        string
	PatientID     string
	Status        string
	VisitDate     *time.Time
	VisitDateFrom *time.Time
	VisitDateTo   *time.Time
}

type PatientCheckupRepository interface {
	Create(ctx context.Context, checkup *models.PatientCheckup) error
	FindByID(ctx context.Context, id generated.IdParam) (*models.PatientCheckup, error)
	FindAll(ctx context.Context, page, perPage int, filter PatientCheckupFilter) ([]models.PatientCheckup, int64, error)
	Update(ctx context.Context, checkup *models.PatientCheckup) error
	Delete(ctx context.Context, id generated.IdParam) error
}

type patientCheckupRepository struct {
	db *gorm.DB
}

func NewPatientCheckupRepository(db *gorm.DB) PatientCheckupRepository {
	return &patientCheckupRepository{db: db}
}

func (r *patientCheckupRepository) Create(ctx context.Context, checkup *models.PatientCheckup) error {
	return r.db.WithContext(ctx).Create(checkup).Error
}

func (r *patientCheckupRepository) FindByID(ctx context.Context, id generated.IdParam) (*models.PatientCheckup, error) {
	var checkup models.PatientCheckup
	err := r.db.WithContext(ctx).First(&checkup, id).Error
	if err != nil {
		return nil, err
	}
	return &checkup, nil
}

func (r *patientCheckupRepository) FindAll(ctx context.Context, page, perPage int, filter PatientCheckupFilter) ([]models.PatientCheckup, int64, error) {
	var checkups []models.PatientCheckup
	var total int64

	offset := (page - 1) * perPage
	query := r.db.WithContext(ctx).Model(&models.PatientCheckup{})

	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where(
			"chief_complaint ILIKE ? OR diagnosis ILIKE ? OR notes ILIKE ? OR doctor_name ILIKE ? OR CAST(symptoms AS TEXT) ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	if filter.PatientID != "" {
		query = query.Where("patient_id = ?", filter.PatientID)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.VisitDate != nil {
		query = query.Where("DATE(visit_date) = ?", filter.VisitDate.Format("2006-01-02"))
	}

	if filter.VisitDateFrom != nil {
		query = query.Where("DATE(visit_date) >= ?", filter.VisitDateFrom.Format("2006-01-02"))
	}

	if filter.VisitDateTo != nil {
		query = query.Where("DATE(visit_date) <= ?", filter.VisitDateTo.Format("2006-01-02"))
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("visit_date DESC, created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&checkups).Error

	return checkups, total, err
}

func (r *patientCheckupRepository) Update(ctx context.Context, checkup *models.PatientCheckup) error {
	return r.db.WithContext(ctx).Save(checkup).Error
}

func (r *patientCheckupRepository) Delete(ctx context.Context, id generated.IdParam) error {
	return r.db.WithContext(ctx).Delete(&models.PatientCheckup{}, id).Error
}
