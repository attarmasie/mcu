package handlers

import (
	"backend/internal/generated"
	"backend/internal/handlers/mapper"
	"backend/internal/repository"
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MedicineHandler struct {
	service              service.MedicineService
	stockActivityService service.MedicineStockActivityService
}

func NewMedicineHandler(service service.MedicineService, stockActivityService service.MedicineStockActivityService) *MedicineHandler {
	return &MedicineHandler{
		service:              service,
		stockActivityService: stockActivityService,
	}
}

func (h *MedicineHandler) ListMedicines(c *gin.Context, params generated.ListMedicinesParams) {
	page := 1
	perPage := 10

	if params.Page != nil {
		page = *params.Page
	}
	if params.PerPage != nil {
		perPage = *params.PerPage
	}

	filter := repository.MedicineFilter{}

	if params.Search != nil {
		filter.Search = *params.Search
	}
	if params.DosageForm != nil {
		filter.DosageForm = string(*params.DosageForm)
	}
	if params.IsPrescriptionRequired != nil {
		filter.IsPrescriptionRequired = params.IsPrescriptionRequired
	}

	medicines, total, err :=
		h.service.ListMedicines(c.Request.Context(), page, perPage, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch medicines",
		})
		return
	}

	totalInt := int(total)

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedMedicines(medicines),
		"meta": generated.Meta{
			Page:    &page,
			PerPage: &perPage,
			Total:   &totalInt,
		},
	})
}

func (h *MedicineHandler) CreateMedicine(c *gin.Context) {
	var req generated.CreateMedicineRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	medicine := mapper.ToModelMedicine(req)

	if err := h.service.CreateMedicine(c.Request.Context(), medicine); err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to create medicine",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": mapper.ToGeneratedMedicine(medicine),
	})
}

func (h *MedicineHandler) GetMedicine(c *gin.Context, id generated.IdParam) {
	medicine, err := h.service.GetMedicine(c.Request.Context(), id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Medicine not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch medicine",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedMedicine(medicine),
	})
}

func (h *MedicineHandler) UpdateMedicine(c *gin.Context, id generated.IdParam) {
	var req generated.CreateMedicineRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	medicine := mapper.ToModelMedicine(req)

	if err := h.service.UpdateMedicine(c.Request.Context(), id, medicine); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Medicine not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to update medicine",
		})
		return
	}

	updated, _ := h.service.GetMedicine(c.Request.Context(), id)
	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedMedicine(updated),
	})
}

func (h *MedicineHandler) DeleteMedicine(c *gin.Context, id generated.IdParam) {
	if err := h.service.DeleteMedicine(c.Request.Context(), id); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Medicine not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to delete medicine",
		})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *MedicineHandler) ListMedicineStockActivities(c *gin.Context, id generated.IdParam, params generated.ListMedicineStockActivitiesParams) {
	page := 1
	perPage := 10
	if params.Page != nil {
		page = *params.Page
	}
	if params.PerPage != nil {
		perPage = *params.PerPage
	}

	filter := repository.MedicineStockActivityFilter{}
	if params.Source != nil {
		filter.Source = string(*params.Source)
	}

	_, err := h.service.GetMedicine(c.Request.Context(), id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{Message: "Medicine not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{Message: "Failed to fetch medicine"})
		return
	}

	activities, total, err := h.stockActivityService.ListByMedicineID(c.Request.Context(), id, page, perPage, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch stock activities",
		})
		return
	}

	totalInt := int(total)
	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedMedicineStockActivities(activities),
		"meta": generated.Meta{
			Page:    &page,
			PerPage: &perPage,
			Total:   &totalInt,
		},
	})
}
