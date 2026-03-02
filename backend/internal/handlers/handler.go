package handlers

import (
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type CombinedHandler struct {
	*UserHandler
	*PatientHandler
	*PatientCheckupHandler
	*AuthHandler
	*MedicineHandler
	*MedicineBatchHandler
}

func NewCombinedHandler(
	userService service.UserService,
	patientService service.PatientService,
	patientCheckupService service.PatientCheckupService,
	authService service.AuthService,
	medicineService service.MedicineService,
	medicineBatchService service.MedicineBatchService,
	medicineStockActivityService service.MedicineStockActivityService,
) *CombinedHandler {
	return &CombinedHandler{
		UserHandler:           NewUserHandler(userService),
		PatientHandler:        NewPatientHandler(patientService),
		PatientCheckupHandler: NewPatientCheckupHandler(patientCheckupService),
		AuthHandler:           NewAuthHandler(authService),
		MedicineHandler:       NewMedicineHandler(medicineService, medicineStockActivityService),
		MedicineBatchHandler:  NewMedicineBatchHandler(medicineBatchService),
	}
}

// Helper method to get user context from middleware
func GetUserContext(c *gin.Context) (userID, email, role string) {
	if uid, exists := c.Get("user_id"); exists {
		userID = uid.(string)
	}
	if em, exists := c.Get("email"); exists {
		email = em.(string)
	}
	if r, exists := c.Get("role"); exists {
		role = r.(string)
	}
	return
}

// Helper method to check if user is authenticated
func IsAuthenticated(c *gin.Context) bool {
	_, exists := c.Get("user_id")
	return exists
}

// Helper method to check if user has specific role
func HasRole(c *gin.Context, requiredRole string) bool {
	if role, exists := c.Get("role"); exists {
		return role.(string) == requiredRole
	}
	return false
}
