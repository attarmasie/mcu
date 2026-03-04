package service

import (
	"backend/internal/models"
	"backend/internal/repository"
	"context"
	"time"
)

type DashboardService interface {
	GetStats(ctx context.Context) (*models.DashboardStats, error)
}

type dashboardService struct {
	repo repository.DashboardRepository
}

func NewDashboardService(repo repository.DashboardRepository) DashboardService {
	return &dashboardService{repo: repo}
}

func (s *dashboardService) GetStats(ctx context.Context) (*models.DashboardStats, error) {
	stats := &models.DashboardStats{}

	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	weekStart := time.Date(now.Year(), now.Month(), now.Day()-(weekday-1), 0, 0, 0, 0, now.Location())

	var err error

	stats.TotalPatients, err = s.repo.CountPatients(ctx)
	if err != nil {
		return nil, err
	}

	stats.TotalMedicines, err = s.repo.CountActiveMedicines(ctx)
	if err != nil {
		return nil, err
	}

	stats.TotalCheckupsToday, err = s.repo.CountCheckupsSince(ctx, todayStart)
	if err != nil {
		return nil, err
	}

	stats.CheckupStatusToday, err = s.repo.GetCheckupStatusSummary(ctx, todayStart)
	if err != nil {
		return nil, err
	}

	stats.CheckupStatusWeek, err = s.repo.GetCheckupStatusSummary(ctx, weekStart)
	if err != nil {
		return nil, err
	}

	stats.LowStockMedicines, err = s.repo.FindLowStockMedicines(ctx, 10)
	if err != nil {
		return nil, err
	}

	stats.RecentCheckups, err = s.repo.FindRecentCheckups(ctx, 5)
	if err != nil {
		return nil, err
	}

	stats.PatientTypeSummary, err = s.repo.GetPatientTypeSummary(ctx)
	if err != nil {
		return nil, err
	}

	thirtyDaysLater := now.AddDate(0, 0, 30)
	stats.ExpiringBatches, err = s.repo.FindExpiringBatches(ctx, thirtyDaysLater, 10)
	if err != nil {
		return nil, err
	}

	return stats, nil
}
