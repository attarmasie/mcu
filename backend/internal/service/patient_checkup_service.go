package service

import (
	"backend/internal/cache"
	"backend/internal/generated"
	"backend/internal/models"
	"backend/internal/repository"
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type PatientCheckupService interface {
	CreateCheckup(ctx context.Context, checkup *models.PatientCheckup, patientUpdate *PatientClinicalUpdate) error
	GetCheckup(ctx context.Context, id generated.IdParam) (*models.PatientCheckup, error)
	ListCheckups(ctx context.Context, page, perPage int, filter repository.PatientCheckupFilter) ([]models.PatientCheckup, int64, error)
	UpdateCheckup(ctx context.Context, id generated.IdParam, checkup *models.PatientCheckup, patientUpdate *PatientClinicalUpdate) error
	DeleteCheckup(ctx context.Context, id generated.IdParam) error
}

type PatientClinicalUpdate struct {
	Allergies *string
	BloodType *string
}

type patientCheckupService struct {
	repo                 repository.PatientCheckupRepository
	cache                cache.Cache
	db                   *gorm.DB
	stockActivityService MedicineStockActivityService
}

func NewPatientCheckupService(
	repo repository.PatientCheckupRepository,
	cache cache.Cache,
	db *gorm.DB,
	stockActivityService MedicineStockActivityService,
) PatientCheckupService {
	return &patientCheckupService{
		repo:                 repo,
		cache:                cache,
		db:                   db,
		stockActivityService: stockActivityService,
	}
}

func (s *patientCheckupService) CreateCheckup(ctx context.Context, checkup *models.PatientCheckup, patientUpdate *PatientClinicalUpdate) error {
	if checkup.Status == "" {
		checkup.Status = "scheduled"
	}

	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(checkup).Error; err != nil {
			return err
		}

		if len(checkup.Medicines) > 0 {
			if err := s.adjustMedicineStockByPrescriptionDelta(ctx, tx, checkup.ID.String(), nil, checkup.Medicines); err != nil {
				return err
			}
		}

		if err := s.applyPatientClinicalUpdate(tx, checkup.PatientID, patientUpdate); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	s.cache.DeletePattern(ctx, "patient_checkups:list:*")
	if patientUpdate != nil {
		s.cache.Delete(ctx, fmt.Sprintf("patient:%s", checkup.PatientID))
		s.cache.DeletePattern(ctx, "patients:list:*")
	}
	return nil
}

func (s *patientCheckupService) GetCheckup(ctx context.Context, id generated.IdParam) (*models.PatientCheckup, error) {
	cacheKey := fmt.Sprintf("patient_checkup:%s", id)

	var checkup models.PatientCheckup
	if err := s.cache.Get(ctx, cacheKey, &checkup); err == nil {
		return &checkup, nil
	}

	checkupFromDB, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	s.cache.Set(ctx, cacheKey, checkupFromDB, 5*time.Minute)
	return checkupFromDB, nil
}

func (s *patientCheckupService) ListCheckups(ctx context.Context, page, perPage int, filter repository.PatientCheckupFilter) ([]models.PatientCheckup, int64, error) {
	visitDate := "none"
	if filter.VisitDate != nil {
		visitDate = filter.VisitDate.Format("2006-01-02")
	}

	visitDateFrom := "none"
	if filter.VisitDateFrom != nil {
		visitDateFrom = filter.VisitDateFrom.Format("2006-01-02")
	}

	visitDateTo := "none"
	if filter.VisitDateTo != nil {
		visitDateTo = filter.VisitDateTo.Format("2006-01-02")
	}

	cacheKey := fmt.Sprintf(
		"patient_checkups:list:%d:%d:%s:%s:%s:%s:%s:%s",
		page,
		perPage,
		filter.Search,
		filter.PatientID,
		filter.Status,
		visitDate,
		visitDateFrom,
		visitDateTo,
	)

	var result struct {
		Checkups []models.PatientCheckup
		Total    int64
	}
	if err := s.cache.Get(ctx, cacheKey, &result); err == nil {
		return result.Checkups, result.Total, nil
	}

	checkups, total, err := s.repo.FindAll(ctx, page, perPage, filter)
	if err != nil {
		return nil, 0, err
	}

	result = struct {
		Checkups []models.PatientCheckup
		Total    int64
	}{
		Checkups: checkups,
		Total:    total,
	}
	s.cache.Set(ctx, cacheKey, result, 2*time.Minute)

	return checkups, total, nil
}

func (s *patientCheckupService) UpdateCheckup(
	ctx context.Context,
	id generated.IdParam,
	checkup *models.PatientCheckup,
	patientUpdate *PatientClinicalUpdate,
) error {
	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var existing models.PatientCheckup
		if err := tx.First(&existing, id).Error; err != nil {
			return err
		}

		// Preserve immutable fields
		checkup.ID = existing.ID
		checkup.PatientID = existing.PatientID
		checkup.CreatedAt = existing.CreatedAt

		// If medicines are omitted in request, keep previous medicines as-is.
		if checkup.Medicines == nil {
			checkup.Medicines = existing.Medicines
		}

		if err := s.adjustMedicineStockByPrescriptionDelta(ctx, tx, existing.ID.String(), existing.Medicines, checkup.Medicines); err != nil {
			return err
		}

		if err := s.applyPatientClinicalUpdate(tx, existing.PatientID, patientUpdate); err != nil {
			return err
		}

		if err := tx.Save(checkup).Error; err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	s.cache.Delete(ctx, fmt.Sprintf("patient_checkup:%s", id))
	s.cache.DeletePattern(ctx, "patient_checkups:list:*")
	s.cache.Delete(ctx, fmt.Sprintf("patient:%s", checkup.PatientID))
	s.cache.DeletePattern(ctx, "patients:list:*")
	return nil
}

func (s *patientCheckupService) DeleteCheckup(ctx context.Context, id generated.IdParam) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	s.cache.Delete(ctx, fmt.Sprintf("patient_checkup:%s", id))
	s.cache.DeletePattern(ctx, "patient_checkups:list:*")
	return nil
}

func (s *patientCheckupService) adjustMedicineStockByPrescriptionDelta(
	ctx context.Context,
	tx *gorm.DB,
	patientCheckupID string,
	oldMeds, newMeds []models.PatientCheckupMedicine,
) error {
	oldMap := make(map[string]int)
	newMap := make(map[string]int)

	for _, m := range oldMeds {
		if m.Quantity > 0 {
			oldMap[m.MedicineID] += m.Quantity
		}
	}
	for _, m := range newMeds {
		if m.Quantity > 0 {
			newMap[m.MedicineID] += m.Quantity
		}
	}

	medicineIDs := make(map[string]struct{})
	for id := range oldMap {
		medicineIDs[id] = struct{}{}
	}
	for id := range newMap {
		medicineIDs[id] = struct{}{}
	}

	for medicineID := range medicineIDs {
		delta := newMap[medicineID] - oldMap[medicineID]
		if delta == 0 {
			continue
		}

		if delta > 0 {
			if err := s.consumeMedicineFromBatches(ctx, tx, patientCheckupID, medicineID, delta); err != nil {
				return err
			}
		} else {
			if err := s.returnMedicineToBatch(ctx, tx, patientCheckupID, medicineID, -delta); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *patientCheckupService) consumeMedicineFromBatches(
	ctx context.Context,
	tx *gorm.DB,
	patientCheckupID, medicineID string,
	qty int,
) error {
	remaining := qty
	today := time.Now().UTC().Format("2006-01-02")

	var batches []models.MedicineBatch
	if err := tx.
		Where("medicine_id = ? AND expiration_date >= ? AND quantity > 0", medicineID, today).
		Order("expiration_date ASC").
		Find(&batches).Error; err != nil {
		return err
	}

	checkupIDPtr := ptrString(patientCheckupID)
	for i := range batches {
		if remaining == 0 {
			break
		}
		take := min(remaining, batches[i].Quantity)
		if take == 0 {
			continue
		}

		batches[i].Quantity -= take
		remaining -= take

		if batches[i].ExpirationDate.Before(time.Now().UTC()) {
			batches[i].Status = "expired"
		} else if batches[i].Quantity == 0 {
			batches[i].Status = "depleted"
		} else {
			batches[i].Status = "active"
		}

		if err := tx.Save(&batches[i]).Error; err != nil {
			return err
		}

		beforeStock, afterStock, err := s.recalculateMedicineStock(tx, medicineID)
		if err != nil {
			return err
		}
		note := fmt.Sprintf("Dispensed from patient checkup %s", patientCheckupID)
		batchID := batches[i].ID.String()
		if err := s.stockActivityService.LogStockChange(ctx, tx, MedicineStockChangeInput{
			MedicineID:       medicineID,
			MedicineBatchID:  &batchID,
			PatientCheckupID: checkupIDPtr,
			Source:           "patient_checkup",
			QuantityDelta:    -take,
			StockBefore:      beforeStock,
			StockAfter:       afterStock,
			Notes:            &note,
			CreatedByUserID:  GetActorUserID(ctx),
		}); err != nil {
			return err
		}
	}

	if remaining > 0 {
		return fmt.Errorf("insufficient stock for medicine_id=%s", medicineID)
	}

	return nil
}

func (s *patientCheckupService) returnMedicineToBatch(
	ctx context.Context,
	tx *gorm.DB,
	patientCheckupID, medicineID string,
	qty int,
) error {
	var batch models.MedicineBatch
	if err := tx.
		Where("medicine_id = ?", medicineID).
		Order("expiration_date ASC").
		First(&batch).Error; err != nil {
		return err
	}

	batch.Quantity += qty
	if batch.ExpirationDate.Before(time.Now().UTC()) {
		batch.Status = "expired"
	} else if batch.Status == "depleted" {
		batch.Status = "active"
	}
	if err := tx.Save(&batch).Error; err != nil {
		return err
	}

	beforeStock, afterStock, err := s.recalculateMedicineStock(tx, medicineID)
	if err != nil {
		return err
	}

	checkupIDPtr := ptrString(patientCheckupID)
	note := fmt.Sprintf("Prescription adjustment from patient checkup %s", patientCheckupID)
	batchID := batch.ID.String()
	return s.stockActivityService.LogStockChange(ctx, tx, MedicineStockChangeInput{
		MedicineID:       medicineID,
		MedicineBatchID:  &batchID,
		PatientCheckupID: checkupIDPtr,
		Source:           "patient_checkup",
		QuantityDelta:    qty,
		StockBefore:      beforeStock,
		StockAfter:       afterStock,
		Notes:            &note,
		CreatedByUserID:  GetActorUserID(ctx),
	})
}

func (s *patientCheckupService) recalculateMedicineStock(tx *gorm.DB, medicineID string) (int, int, error) {
	var before int
	if err := tx.
		Model(&models.Medicine{}).
		Where("id = ?", medicineID).
		Select("current_stock").
		Scan(&before).Error; err != nil {
		return 0, 0, err
	}

	var total int64
	if err := tx.
		Model(&models.MedicineBatch{}).
		Where("medicine_id = ?", medicineID).
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&total).Error; err != nil {
		return 0, 0, err
	}
	after := int(total)

	if err := tx.Model(&models.Medicine{}).
		Where("id = ?", medicineID).
		Update("current_stock", after).Error; err != nil {
		return 0, 0, err
	}

	return before, after, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func ptrString(v string) *string {
	if v == "" {
		return nil
	}
	return &v
}

func (s *patientCheckupService) applyPatientClinicalUpdate(tx *gorm.DB, patientID string, update *PatientClinicalUpdate) error {
	if update == nil {
		return nil
	}

	patch := map[string]any{}
	if update.Allergies != nil {
		patch["allergies"] = *update.Allergies
	}
	if update.BloodType != nil {
		patch["blood_type"] = *update.BloodType
	}
	if len(patch) == 0 {
		return nil
	}

	return tx.Model(&models.Patient{}).Where("id = ?", patientID).Updates(patch).Error
}
