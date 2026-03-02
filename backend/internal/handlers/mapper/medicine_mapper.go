package mapper

import (
	"backend/internal/generated"
	"backend/internal/models"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

func ToGeneratedMedicine(m *models.Medicine) generated.Medicine {
	strength := ""
	if m.Strength != nil {
		strength = *m.Strength
	}

	return generated.Medicine{
		Id:                     openapi_types.UUID(m.ID),
		Name:                   m.Name,
		Code:                   m.Code,
		CurrentStock:           m.CurrentStock,
		MinimumStock:           m.MinimumStock,
		DosageForm:             generated.MedicineDosageForm(m.DosageForm),
		Strength:               strength,
		IsPrescriptionRequired: m.IsPrescriptionRequired,
		Notes:                  m.Notes,
		Status:                 generated.MedicineStatus(m.Status),
		CreatedAt:              m.CreatedAt,
		UpdatedAt:              m.UpdatedAt,
	}
}

func ToGeneratedMedicines(medicines []models.Medicine) []generated.Medicine {
	result := make([]generated.Medicine, len(medicines))
	for i := range medicines {
		result[i] = ToGeneratedMedicine(&medicines[i])
	}
	return result
}

func ToModelMedicine(req generated.CreateMedicineRequest) *models.Medicine {
	return &models.Medicine{
		Name:                   req.Name,
		Code:                   req.Code,
		MinimumStock:           req.MinimumStock,
		DosageForm:             string(req.DosageForm),
		Strength:               &req.Strength,
		IsPrescriptionRequired: req.IsPrescriptionRequired,
		Unit:                   string(req.DosageForm),
		Notes:                  req.Notes,
		Status:                 "active",
	}
}
