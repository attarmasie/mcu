package handlers

import (
	"backend/internal/generated"
	"backend/internal/handlers/mapper"
	"backend/internal/repository"
	"backend/internal/service"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PatientCheckupHandler struct {
	service service.PatientCheckupService
}

func NewPatientCheckupHandler(service service.PatientCheckupService) *PatientCheckupHandler {
	return &PatientCheckupHandler{service: service}
}

func (h *PatientCheckupHandler) ListPatientCheckups(c *gin.Context, params generated.ListPatientCheckupsParams) {
	page := 1
	perPage := 10

	if params.Page != nil {
		page = *params.Page
	}
	if params.PerPage != nil {
		perPage = *params.PerPage
	}

	filter := repository.PatientCheckupFilter{}
	if params.Search != nil {
		filter.Search = *params.Search
	}
	if params.PatientId != nil {
		filter.PatientID = uuid.UUID(*params.PatientId).String()
	}
	if params.Status != nil {
		filter.Status = string(*params.Status)
	}
	if params.VisitDate != nil {
		t := params.VisitDate.Time
		filter.VisitDate = &t
	}
	if params.VisitDateFrom != nil {
		t := params.VisitDateFrom.Time
		filter.VisitDateFrom = &t
	}
	if params.VisitDateTo != nil {
		t := params.VisitDateTo.Time
		filter.VisitDateTo = &t
	}

	checkups, total, err := h.service.ListCheckups(c.Request.Context(), page, perPage, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch patient checkups",
		})
		return
	}

	totalInt := int(total)
	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedPatientCheckups(checkups),
		"meta": generated.Meta{
			Page:    &page,
			PerPage: &perPage,
			Total:   &totalInt,
		},
	})
}

func (h *PatientCheckupHandler) CreatePatientCheckup(c *gin.Context) {
	var req generated.CreatePatientCheckupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	checkup := mapper.ToModelCreatePatientCheckup(req)
	ctx := service.WithActorUserID(c.Request.Context(), c.GetString("user_id"))
	var patientUpdate *service.PatientClinicalUpdate
	if req.PatientAllergies != nil || req.PatientBloodType != nil {
		update := &service.PatientClinicalUpdate{
			Allergies: req.PatientAllergies,
		}
		if req.PatientBloodType != nil {
			bloodType := string(*req.PatientBloodType)
			update.BloodType = &bloodType
		}
		patientUpdate = update
	}

	if err := h.service.CreateCheckup(ctx, checkup, patientUpdate); err != nil {
		if strings.Contains(err.Error(), "insufficient stock") {
			c.JSON(http.StatusBadRequest, generated.Error{
				Message: err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to create patient checkup",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": mapper.ToGeneratedPatientCheckup(checkup),
	})
}

func (h *PatientCheckupHandler) GetPatientCheckup(c *gin.Context, id generated.IdParam) {
	checkup, err := h.service.GetCheckup(c.Request.Context(), id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Patient checkup not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to fetch patient checkup",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedPatientCheckup(checkup),
	})
}

func (h *PatientCheckupHandler) UpdatePatientCheckup(c *gin.Context, id generated.IdParam) {
	var req generated.UpdatePatientCheckupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, generated.Error{
			Message: "Invalid request body",
		})
		return
	}

	checkup := mapper.ToModelUpdatePatientCheckup(req)
	ctx := service.WithActorUserID(c.Request.Context(), c.GetString("user_id"))
	var patientUpdate *service.PatientClinicalUpdate
	if req.PatientAllergies != nil || req.PatientBloodType != nil {
		update := &service.PatientClinicalUpdate{
			Allergies: req.PatientAllergies,
		}
		if req.PatientBloodType != nil {
			bloodType := string(*req.PatientBloodType)
			update.BloodType = &bloodType
		}
		patientUpdate = update
	}

	if err := h.service.UpdateCheckup(ctx, id, checkup, patientUpdate); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Patient checkup not found",
			})
			return
		}
		if strings.Contains(err.Error(), "insufficient stock") {
			c.JSON(http.StatusBadRequest, generated.Error{
				Message: err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to update patient checkup",
		})
		return
	}

	updated, _ := h.service.GetCheckup(c.Request.Context(), id)
	c.JSON(http.StatusOK, gin.H{
		"data": mapper.ToGeneratedPatientCheckup(updated),
	})
}

func (h *PatientCheckupHandler) DeletePatientCheckup(c *gin.Context, id generated.IdParam) {
	if err := h.service.DeleteCheckup(c.Request.Context(), id); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, generated.Error{
				Message: "Patient checkup not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, generated.Error{
			Message: "Failed to delete patient checkup",
		})
		return
	}

	c.Status(http.StatusNoContent)
}
