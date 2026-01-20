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

type PatientHandler struct {
	service service.PatientService
}

func NewPatientHandler(service service.PatientService) *PatientHandler {
	return &PatientHandler{service: service}
}

func (h *PatientHandler) ListPatients(c *gin.Context, params generated.ListPatientsParams) {
	page := 1
	perPage := 10

	if params.Page != nil {
		page = *params.Page
	}
	if params.PerPage != nil {
		perPage = *params.PerPage
	}

	// Build filter from params
	filter := repository.PatientFilter{}
	if params.Search != nil {
		filter.Search = *params.Search
	}
	if params.Gender != nil {
		filter.Gender = string(*params.Gender)
	}
	if params.PatientType != nil {
		filter.PatientType = string(*params.PatientType)
	}

	patients, total, err := h.service.ListPatients(c.Request.Context(), page, perPage, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch patients",
		})
		return
	}

	totalInt := int(total)

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedPatients(patients),
		"meta": generated.Meta{
			Page:    &page,
			PerPage: &perPage,
			Total:   &totalInt,
		},
	})
}

func (h *PatientHandler) CreatePatient(c *gin.Context) {
	var req generated.CreatePatientRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	patient := mapper.ToModelPatient(req)

	if err := h.service.CreatePatient(c.Request.Context(), patient); err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to create patient",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": mapper.ToGeneratedPatient(patient),
	})
}

func (h *PatientHandler) GetPatient(c *gin.Context, id generated.IdParam) {
	patient, err := h.service.GetPatient(c.Request.Context(), id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Patient not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch patient",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedPatient(patient),
	})
}

func (h *PatientHandler) UpdatePatient(c *gin.Context, id generated.IdParam) {
	var req generated.CreatePatientRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	patient := mapper.ToModelPatient(req)

	if err := h.service.UpdatePatient(c.Request.Context(), id, patient); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Patient not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to update patient",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedPatient(patient),
	})
}

func (h *PatientHandler) DeletePatient(c *gin.Context, id generated.IdParam) {
	if err := h.service.DeletePatient(c.Request.Context(), id); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Patient not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to delete patient",
		})
		return
	}

	c.Status(http.StatusNoContent)
}
