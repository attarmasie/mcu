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

type PatientService interface {
	CreatePatient(ctx context.Context, patient *models.Patient) error
	GetPatient(ctx context.Context, id generated.IdParam) (*models.Patient, error)
	ListPatients(ctx context.Context, page, perPage int, filter repository.PatientFilter) ([]models.Patient, int64, error)
	UpdatePatient(ctx context.Context, id generated.IdParam, patient *models.Patient) error
	DeletePatient(ctx context.Context, id generated.IdParam) error
}

type patientService struct {
	repo  repository.PatientRepository
	cache cache.Cache
}

func NewPatientService(repo repository.PatientRepository, cache cache.Cache) PatientService {
	return &patientService{
		repo:  repo,
		cache: cache,
	}
}

func (s *patientService) CreatePatient(ctx context.Context, patient *models.Patient) error {
	if err := s.repo.Create(ctx, patient); err != nil {
		return err
	}

	// Invalidate patients list cache
	s.cache.DeletePattern(ctx, "patients:list:*")

	return nil
}

func (s *patientService) GetPatient(ctx context.Context, id generated.IdParam) (*models.Patient, error) {
	cacheKey := fmt.Sprintf("patient:%s", id)

	// Try to get from cache
	var patient models.Patient
	if err := s.cache.Get(ctx, cacheKey, &patient); err == nil {
		return &patient, nil
	}

	// Get from database
	patientFromDB, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Set cache
	s.cache.Set(ctx, cacheKey, patientFromDB, 5*time.Minute)

	return patientFromDB, nil
}

func (s *patientService) ListPatients(ctx context.Context, page, perPage int, filter repository.PatientFilter) ([]models.Patient, int64, error) {
	cacheKey := fmt.Sprintf("patients:list:%d:%d:%s:%s:%s", page, perPage, filter.Search, filter.Gender, filter.PatientType)

	// Try to get from cache
	var result struct {
		Patients []models.Patient
		Total    int64
	}
	if err := s.cache.Get(ctx, cacheKey, &result); err == nil {
		return result.Patients, result.Total, nil
	}

	// Get from database
	patients, total, err := s.repo.FindAll(ctx, page, perPage, filter)
	if err != nil {
		return nil, 0, err
	}

	// Set cache
	result = struct {
		Patients []models.Patient
		Total    int64
	}{patients, total}
	s.cache.Set(ctx, cacheKey, result, 2*time.Minute)

	return patients, total, nil
}

func (s *patientService) UpdatePatient(ctx context.Context, id generated.IdParam, patient *models.Patient) error {
	existing, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	patient.ID = existing.ID
	patient.CreatedAt = existing.CreatedAt

	if err := s.repo.Update(ctx, patient); err != nil {
		return err
	}

	// Invalidate cache
	s.cache.Delete(ctx, fmt.Sprintf("patient:%s", id))
	s.cache.DeletePattern(ctx, "patients:list:*")

	return nil
}

func (s *patientService) DeletePatient(ctx context.Context, id generated.IdParam) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Invalidate cache
	s.cache.Delete(ctx, fmt.Sprintf("patient:%s", id))
	s.cache.DeletePattern(ctx, "patients:list:*")

	return nil
}
