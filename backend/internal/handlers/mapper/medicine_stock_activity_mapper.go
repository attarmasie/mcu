package mapper

import (
	"backend/internal/generated"
	"backend/internal/models"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

func ToGeneratedMedicineStockActivity(a *models.MedicineStockActivity) generated.MedicineStockActivity {
	medicineID, _ := uuid.Parse(a.MedicineID)
	result := generated.MedicineStockActivity{
		Id:              openapi_types.UUID(a.ID),
		MedicineId:      openapi_types.UUID(medicineID),
		ChangeType:      generated.MedicineStockActivityChangeType(a.ChangeType),
		Source:          generated.MedicineStockActivitySource(a.Source),
		QuantityDelta:   a.QuantityDelta,
		StockBefore:     a.StockBefore,
		StockAfter:      a.StockAfter,
		Notes:           a.Notes,
		CreatedAt:       a.CreatedAt,
		CreatedByUserId: nil,
	}

	if a.MedicineBatchID != nil {
		if parsed, err := uuid.Parse(*a.MedicineBatchID); err == nil {
			batchID := openapi_types.UUID(parsed)
			result.MedicineBatchId = &batchID
		}
	}
	if a.PatientCheckupID != nil {
		if parsed, err := uuid.Parse(*a.PatientCheckupID); err == nil {
			checkupID := openapi_types.UUID(parsed)
			result.PatientCheckupId = &checkupID
		}
	}
	if a.CreatedByUserID != nil {
		if parsed, err := uuid.Parse(*a.CreatedByUserID); err == nil {
			userID := openapi_types.UUID(parsed)
			result.CreatedByUserId = &userID
		}
	}

	return result
}

func ToGeneratedMedicineStockActivities(activities []models.MedicineStockActivity) []generated.MedicineStockActivity {
	result := make([]generated.MedicineStockActivity, len(activities))
	for i := range activities {
		result[i] = ToGeneratedMedicineStockActivity(&activities[i])
	}
	return result
}
