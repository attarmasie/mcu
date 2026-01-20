package app

import (
	"backend/internal/cache"
	"backend/internal/handlers"
	"backend/internal/repository"
	"backend/internal/service"

	"gorm.io/gorm"
)

type Container struct {
	UserHandler    *handlers.UserHandler
	PatientHandler *handlers.PatientHandler
	AuthHandler    *handlers.AuthHandler
}

func NewContainer(db *gorm.DB, cache cache.Cache) *Container {
	// repositories
	userRepo := repository.NewUserRepository(db)
	patientRepo := repository.NewPatientRepository(db)

	// services
	userService := service.NewUserService(userRepo, cache)
	patientService := service.NewPatientService(patientRepo, cache)
	authService := service.NewAuthService(userRepo)

	// handlers
	userHandler := handlers.NewUserHandler(userService)
	patientHandler := handlers.NewPatientHandler(patientService)
	authHandler := handlers.NewAuthHandler(authService)

	return &Container{
		UserHandler:    userHandler,
		PatientHandler: patientHandler,
		AuthHandler:    authHandler,
	}
}

func (c *Container) Handlers() *handlers.CombinedHandler {
	return &handlers.CombinedHandler{
		UserHandler:    c.UserHandler,
		PatientHandler: c.PatientHandler,
		AuthHandler:    c.AuthHandler,
	}
}
