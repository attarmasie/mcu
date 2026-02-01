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

type MedicineService interface {
	CreateMedicine(ctx context.Context, medicine *models.Medicine) error
	GetMedicine(ctx context.Context, id generated.IdParam) (*models.Medicine, error)
	ListMedicines(ctx context.Context, page, perPage int, filter repository.MedicineFilter) ([]models.Medicine, int64, error)
	UpdateMedicine(ctx context.Context, id generated.IdParam, medicine *models.Medicine) error
	DeleteMedicine(ctx context.Context, id generated.IdParam) error
}

type medicineService struct {
	repo  repository.MedicineRepository
	cache cache.Cache
}

func NewMedicineService(repo repository.MedicineRepository, cache cache.Cache) MedicineService {
	return &medicineService{
		repo:  repo,
		cache: cache,
	}
}

// helper untuk cache key
func boolPtrToString(b *bool) string {
	if b == nil {
		return "all"
	}
	if *b {
		return "true"
	}
	return "false"
}

func (s *medicineService) CreateMedicine(ctx context.Context, medicine *models.Medicine) error {
	if err := s.repo.Create(ctx, medicine); err != nil {
		return err
	}

	s.cache.DeletePattern(ctx, "medicines:list:*")
	return nil
}

func (s *medicineService) GetMedicine(ctx context.Context, id generated.IdParam) (*models.Medicine, error) {
	cacheKey := fmt.Sprintf("medicine:%s", id)

	var medicine models.Medicine
	if err := s.cache.Get(ctx, cacheKey, &medicine); err == nil {
		return &medicine, nil
	}

	medicineFromDB, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	s.cache.Set(ctx, cacheKey, medicineFromDB, 5*time.Minute)
	return medicineFromDB, nil
}

func (s *medicineService) ListMedicines(
	ctx context.Context,
	page, perPage int,
	filter repository.MedicineFilter,
) ([]models.Medicine, int64, error) {

	cacheKey := fmt.Sprintf(
		"medicines:list:%d:%d:%s:%s:%s:%s",
		page,
		perPage,
		filter.Search,
		filter.DosageForm,
		boolPtrToString(filter.IsPrescriptionRequired),
		filter.Status,
	)

	var result struct {
		Medicines []models.Medicine
		Total     int64
	}

	if err := s.cache.Get(ctx, cacheKey, &result); err == nil {
		return result.Medicines, result.Total, nil
	}

	medicines, total, err := s.repo.FindAll(ctx, page, perPage, filter)
	if err != nil {
		return nil, 0, err
	}

	result = struct {
		Medicines []models.Medicine
		Total     int64
	}{
		Medicines: medicines,
		Total:     total,
	}

	s.cache.Set(ctx, cacheKey, result, 2*time.Minute)
	return medicines, total, nil
}

func (s *medicineService) UpdateMedicine(ctx context.Context, id generated.IdParam, medicine *models.Medicine) error {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	medicine.ID = existing.ID
	medicine.CreatedAt = existing.CreatedAt

	if err := s.repo.Update(ctx, medicine); err != nil {
		return err
	}

	s.cache.Delete(ctx, fmt.Sprintf("medicine:%s", id))
	s.cache.DeletePattern(ctx, "medicines:list:*")
	return nil
}

func (s *medicineService) DeleteMedicine(ctx context.Context, id generated.IdParam) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	s.cache.Delete(ctx, fmt.Sprintf("medicine:%s", id))
	s.cache.DeletePattern(ctx, "medicines:list:*")
	return nil
}
