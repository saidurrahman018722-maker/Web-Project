package database

import (
	"fmt"
	"log"
	"plantdoc-backend/internal/config"
	"plantdoc-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB(cfg *config.Config) (*gorm.DB, error) {
	log.Println("Connecting to PostgreSQL database...")
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	log.Println("Running database migrations...")
	err = db.AutoMigrate(
		&models.Remedy{},
		&models.Diagnosis{},
		&models.GardenPlant{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to run database auto-migrations: %w", err)
	}

	// Seed knowledgebase if needed
	if err := SeedRemedies(db); err != nil {
		log.Printf("Warning: failed to seed remedies: %v", err)
	}

	log.Println("Database connection and schema migrations completed successfully.")
	return db, nil
}

