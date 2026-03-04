package repository

import (
	"backend/internal/models"
	"context"
	"time"

	"gorm.io/gorm"
)

type DashboardRepository interface {
	CountPatients(ctx context.Context) (int64, error)
	CountActiveMedicines(ctx context.Context) (int64, error)
	CountCheckupsSince(ctx context.Context, since time.Time) (int64, error)
	FindLowStockMedicines(ctx context.Context, limit int) ([]models.LowStockMedicine, error)
	FindRecentCheckups(ctx context.Context, limit int) ([]models.RecentCheckup, error)
	GetCheckupStatusSummary(ctx context.Context, since time.Time) (models.CheckupStatusSummary, error)
	GetPatientTypeSummary(ctx context.Context) ([]models.PatientTypeStat, error)
	FindExpiringBatches(ctx context.Context, before time.Time, limit int) ([]models.ExpiringBatch, error)
}

type dashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) DashboardRepository {
	return &dashboardRepository{db: db}
}

func (r *dashboardRepository) CountPatients(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Table("patients").Where("deleted_at IS NULL").Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountActiveMedicines(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Table("medicines").Where("deleted_at IS NULL AND status = 'active'").Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountCheckupsSince(ctx context.Context, since time.Time) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Table("patient_checkups").
		Where("deleted_at IS NULL AND visit_date >= ?", since).
		Count(&count).Error
	return count, err
}

func (r *dashboardRepository) FindLowStockMedicines(ctx context.Context, limit int) ([]models.LowStockMedicine, error) {
	var medicines []models.LowStockMedicine
	err := r.db.WithContext(ctx).Table("medicines").
		Select("id, name, code, current_stock, minimum_stock").
		Where("deleted_at IS NULL AND status = 'active' AND current_stock <= minimum_stock").
		Order("current_stock ASC").
		Limit(limit).
		Scan(&medicines).Error
	return medicines, err
}

func (r *dashboardRepository) FindRecentCheckups(ctx context.Context, limit int) ([]models.RecentCheckup, error) {
	var checkups []models.RecentCheckup
	err := r.db.WithContext(ctx).Table("patient_checkups").
		Select("patient_checkups.id, patients.full_name as patient_name, patient_checkups.chief_complaint, patient_checkups.status, patient_checkups.visit_date, patient_checkups.doctor_name").
		Joins("LEFT JOIN patients ON patients.id = patient_checkups.patient_id").
		Where("patient_checkups.deleted_at IS NULL").
		Order("patient_checkups.visit_date DESC").
		Limit(limit).
		Scan(&checkups).Error
	return checkups, err
}

func (r *dashboardRepository) GetCheckupStatusSummary(ctx context.Context, since time.Time) (models.CheckupStatusSummary, error) {
	var rows []struct {
		Status string
		Count  int64
	}
	err := r.db.WithContext(ctx).Table("patient_checkups").
		Select("status, COUNT(*) as count").
		Where("deleted_at IS NULL AND visit_date >= ?", since).
		Group("status").
		Scan(&rows).Error

	var summary models.CheckupStatusSummary
	for _, row := range rows {
		switch row.Status {
		case "scheduled":
			summary.Scheduled = row.Count
		case "completed":
			summary.Completed = row.Count
		case "cancelled":
			summary.Cancelled = row.Count
		}
	}
	return summary, err
}

func (r *dashboardRepository) GetPatientTypeSummary(ctx context.Context) ([]models.PatientTypeStat, error) {
	var stats []models.PatientTypeStat
	err := r.db.WithContext(ctx).Table("patients").
		Select("patient_type, COUNT(*) as count").
		Where("deleted_at IS NULL").
		Group("patient_type").
		Scan(&stats).Error
	return stats, err
}

func (r *dashboardRepository) FindExpiringBatches(ctx context.Context, before time.Time, limit int) ([]models.ExpiringBatch, error) {
	var batches []models.ExpiringBatch
	err := r.db.WithContext(ctx).Table("medicine_batches").
		Select("medicine_batches.id, medicines.name as medicine_name, medicine_batches.batch_number, medicine_batches.expiration_date, medicine_batches.quantity").
		Joins("LEFT JOIN medicines ON medicines.id = medicine_batches.medicine_id").
		Where("medicine_batches.deleted_at IS NULL AND medicine_batches.status = 'active' AND medicine_batches.expiration_date <= ? AND medicine_batches.quantity > 0", before).
		Order("medicine_batches.expiration_date ASC").
		Limit(limit).
		Scan(&batches).Error
	return batches, err
}
