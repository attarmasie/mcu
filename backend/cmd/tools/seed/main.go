package main

import (
	"fmt"
	"log"
	"os"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"

	"github.com/google/uuid"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	dbConfig := database.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
		SSLMode:  cfg.Database.SSLMode,
	}

	db, err := database.NewPostgresDB(dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("🌱 Starting database seeding...")

	// Check if admin already exists
	var existingAdmin models.User
	result := db.Where("email = ?", "admin@mail.com").First(&existingAdmin)

	if result.Error == nil {
		log.Println("⚠️  Admin user already exists, skipping...")
		log.Printf("📧 Email: %s", existingAdmin.Email)
		log.Printf("👤 Name: %s", existingAdmin.Name)
		log.Printf("🔑 Role: %s", existingAdmin.Role)
		os.Exit(0)
	}

	// Create admin user
	admin := models.User{
		BaseUUID: models.BaseUUID{
			ID: uuid.New(),
		},
		Name:     "Administrator",
		Email:    "admin@mail.com",
		Role:     "admin",
		IsActive: true,
	}

	// Hash password
	if err := admin.HashPassword("mcuattarmasi"); err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Save to database
	if err := db.Create(&admin).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	log.Println("✅ Admin user created successfully!")
	log.Println("=" + fmt.Sprintf("%50s", "="))
	log.Printf("📧 Email:    %s", admin.Email)
	log.Printf("👤 Name:     %s", admin.Name)
	log.Printf("🔑 Role:     %s", admin.Role)
	log.Printf("🆔 ID:       %s", admin.ID)
	log.Printf("🔐 Password: mcuattarmasi")
	log.Println("=" + fmt.Sprintf("%50s", "="))
	log.Println("🎉 Seeding completed!")
}
