package app

import (
	"backend/internal/cache"
	"backend/internal/handlers"
	"backend/internal/repository"
	"backend/internal/service"

	"gorm.io/gorm"
)

type Container struct {
	UserHandler          *handlers.UserHandler
	PatientHandler       *handlers.PatientHandler
	AuthHandler          *handlers.AuthHandler
	MedicineHandler      *handlers.MedicineHandler
	MedicineBatchHandler *handlers.MedicineBatchHandler
}

func NewContainer(db *gorm.DB, cache cache.Cache) *Container {
	// repositories
	userRepo := repository.NewUserRepository(db)
	patientRepo := repository.NewPatientRepository(db)
	medicineRepo := repository.NewMedicineRepository(db)
	medicineBatchRepo := repository.NewMedicineBatchRepository(db)

	// services
	userService := service.NewUserService(userRepo, cache)
	patientService := service.NewPatientService(patientRepo, cache)
	authService := service.NewAuthService(userRepo)
	medicineService := service.NewMedicineService(medicineRepo, cache)
	medicineBatchService := service.NewMedicineBatchService(medicineBatchRepo, cache)

	// handlers
	userHandler := handlers.NewUserHandler(userService)
	patientHandler := handlers.NewPatientHandler(patientService)
	authHandler := handlers.NewAuthHandler(authService)
	medicineHandler := handlers.NewMedicineHandler(medicineService)
	medicineBatchHandler := handlers.NewMedicineBatchHandler(medicineBatchService)

	return &Container{
		UserHandler:          userHandler,
		PatientHandler:       patientHandler,
		AuthHandler:          authHandler,
		MedicineHandler:      medicineHandler,
		MedicineBatchHandler: medicineBatchHandler,
	}
}

func (c *Container) Handlers() *handlers.CombinedHandler {
	return &handlers.CombinedHandler{
		UserHandler:          c.UserHandler,
		PatientHandler:       c.PatientHandler,
		AuthHandler:          c.AuthHandler,
		MedicineHandler:      c.MedicineHandler,
		MedicineBatchHandler: c.MedicineBatchHandler,
	}
}
