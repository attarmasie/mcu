package handlers

import (
	"backend/internal/generated"
	"backend/internal/handlers/mapper"
	"backend/internal/repository"
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MedicineBatchHandler struct {
	service service.MedicineBatchService
}

func NewMedicineBatchHandler(service service.MedicineBatchService) *MedicineBatchHandler {
	return &MedicineBatchHandler{service: service}
}

func (h *MedicineBatchHandler) ListMedicineBatches(
	c *gin.Context,
	params generated.ListMedicineBatchesParams,
) {
	page := 1
	perPage := 10

	if params.Page != nil {
		page = *params.Page
	}
	if params.PerPage != nil {
		perPage = *params.PerPage
	}

	filter := repository.MedicineBatchFilter{}
	if params.MedicineId != nil {
		filter.MedicineID = uuid.UUID(*params.MedicineId).String()
	}

	batches, total, err :=
		h.service.ListBatches(c.Request.Context(), page, perPage, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch medicine batches",
		})
		return
	}

	totalInt := int(total)

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedMedicineBatches(batches),
		"meta": generated.Meta{
			Page:    &page,
			PerPage: &perPage,
			Total:   &totalInt,
		},
	})
}

func (h *MedicineBatchHandler) CreateMedicineBatch(c *gin.Context) {
	var req generated.CreateMedicineBatchRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	batch := mapper.ToModelMedicineBatch(req)
	ctx := service.WithActorUserID(c.Request.Context(), c.GetString("user_id"))

	if err := h.service.CreateBatch(ctx, batch); err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to create medicine batch",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": mapper.ToGeneratedMedicineBatch(batch),
	})
}

func (h *MedicineBatchHandler) GetMedicineBatch(c *gin.Context, id generated.IdParam) {
	batch, err := h.service.GetBatch(c.Request.Context(), id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Batch not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch batch",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedMedicineBatch(batch),
	})
}

func (h *MedicineBatchHandler) UpdateMedicineBatch(c *gin.Context, id generated.IdParam) {
	var req generated.UpdateMedicineBatchRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	batch := mapper.ToModelMedicineBatchUpdate(req)
	ctx := service.WithActorUserID(c.Request.Context(), c.GetString("user_id"))

	if err := h.service.UpdateBatch(ctx, id, batch); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Batch not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to update batch",
		})
		return
	}

	updated, _ := h.service.GetBatch(c.Request.Context(), id)
	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedMedicineBatch(updated),
	})
}

func (h *MedicineBatchHandler) DeleteMedicineBatch(
	c *gin.Context,
	id generated.IdParam,
) {
	ctx := service.WithActorUserID(c.Request.Context(), c.GetString("user_id"))
	if err := h.service.DeleteBatch(ctx, id); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Batch not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to delete batch",
		})
		return
	}

	c.Status(http.StatusNoContent)
}
