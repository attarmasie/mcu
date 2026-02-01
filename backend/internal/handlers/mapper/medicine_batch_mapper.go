package mapper

import (
	"backend/internal/generated"
	"backend/internal/models"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

func ToGeneratedMedicineBatch(b *models.MedicineBatch) generated.MedicineBatch {
	medicineId, _ := uuid.Parse(b.MedicineID)
	return generated.MedicineBatch{
		Id:             openapi_types.UUID(b.ID),
		MedicineId:     openapi_types.UUID(medicineId),
		BatchNumber:    b.BatchNumber,
		ExpirationDate: openapi_types.Date{Time: b.ExpirationDate},
		Stock:          b.Quantity,
		Status:         generated.MedicineBatchStatus(b.Status),
		CreatedAt:      b.CreatedAt,
		UpdatedAt:      b.UpdatedAt,
	}
}

func ToGeneratedMedicineBatches(batches []models.MedicineBatch) []generated.MedicineBatch {
	result := make([]generated.MedicineBatch, len(batches))
	for i := range batches {
		result[i] = ToGeneratedMedicineBatch(&batches[i])
	}
	return result
}

func ToModelMedicineBatch(req generated.CreateMedicineBatchRequest) *models.MedicineBatch {
	return &models.MedicineBatch{
		MedicineID:     uuid.UUID(req.MedicineId).String(),
		BatchNumber:    req.BatchNumber,
		ExpirationDate: req.ExpirationDate.Time,
		Quantity:       req.Stock,
		Status:         "active",
	}
}
