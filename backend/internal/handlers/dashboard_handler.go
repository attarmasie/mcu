package handlers

import (
	"backend/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	service service.DashboardService
}

func NewDashboardHandler(service service.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}

func (h *DashboardHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.service.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to fetch dashboard stats",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": stats,
	})
}
