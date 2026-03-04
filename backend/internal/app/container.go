package app

import (
	"backend/internal/cache"
	"backend/internal/handlers"
	"backend/internal/repository"
	"backend/internal/service"

	"gorm.io/gorm"
)

type Container struct {
	UserHandler           *handlers.UserHandler
	PatientHandler        *handlers.PatientHandler
	PatientCheckupHandler *handlers.PatientCheckupHandler
	AuthHandler           *handlers.AuthHandler
	MedicineHandler       *handlers.MedicineHandler
	MedicineBatchHandler  *handlers.MedicineBatchHandler
	DashboardHandler      *handlers.DashboardHandler
}

func NewContainer(db *gorm.DB, cache cache.Cache) *Container {
	// repositories
	userRepo := repository.NewUserRepository(db)
	patientRepo := repository.NewPatientRepository(db)
	patientCheckupRepo := repository.NewPatientCheckupRepository(db)
	medicineRepo := repository.NewMedicineRepository(db)
	medicineBatchRepo := repository.NewMedicineBatchRepository(db)
	medicineStockActivityRepo := repository.NewMedicineStockActivityRepository(db)
	dashboardRepo := repository.NewDashboardRepository(db)

	// services
	userService := service.NewUserService(userRepo, cache)
	patientService := service.NewPatientService(patientRepo, cache)
	medicineStockActivityService := service.NewMedicineStockActivityService(medicineStockActivityRepo, db)
	patientCheckupService := service.NewPatientCheckupService(patientCheckupRepo, cache, db, medicineStockActivityService)
	authService := service.NewAuthService(userRepo)
	medicineService := service.NewMedicineService(medicineRepo, cache)
	medicineBatchService := service.NewMedicineBatchService(medicineBatchRepo, cache, db, medicineStockActivityService)
	dashboardService := service.NewDashboardService(dashboardRepo)

	// handlers
	userHandler := handlers.NewUserHandler(userService)
	patientHandler := handlers.NewPatientHandler(patientService)
	patientCheckupHandler := handlers.NewPatientCheckupHandler(patientCheckupService)
	authHandler := handlers.NewAuthHandler(authService)
	medicineHandler := handlers.NewMedicineHandler(medicineService, medicineStockActivityService)
	medicineBatchHandler := handlers.NewMedicineBatchHandler(medicineBatchService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)

	return &Container{
		UserHandler:           userHandler,
		PatientHandler:        patientHandler,
		PatientCheckupHandler: patientCheckupHandler,
		AuthHandler:           authHandler,
		MedicineHandler:       medicineHandler,
		MedicineBatchHandler:  medicineBatchHandler,
		DashboardHandler:      dashboardHandler,
	}
}

func (c *Container) Handlers() *handlers.CombinedHandler {
	return &handlers.CombinedHandler{
		UserHandler:           c.UserHandler,
		PatientHandler:        c.PatientHandler,
		PatientCheckupHandler: c.PatientCheckupHandler,
		AuthHandler:           c.AuthHandler,
		MedicineHandler:       c.MedicineHandler,
		MedicineBatchHandler:  c.MedicineBatchHandler,
		DashboardHandler:      c.DashboardHandler,
	}
}
