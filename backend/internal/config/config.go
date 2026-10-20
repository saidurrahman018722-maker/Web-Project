package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                   string
	DatabaseURL            string
	MLServiceURL           string
	UploadDir              string
	ReminderIntervalMinute int
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://neondb_owner:npg_ClwgUi5f3JHT@ep-round-sea-b7etzd45-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require"
	}

	mlURL := os.Getenv("ML_SERVICE_URL")
	if mlURL == "" {
		mlURL = "http://localhost:5000"
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	reminderInterval := 60
	if intervalStr := os.Getenv("REMINDER_INTERVAL_MINUTES"); intervalStr != "" {
		if val, err := strconv.Atoi(intervalStr); err == nil && val > 0 {
			reminderInterval = val
		}
	}

	return &Config{
		Port:                   port,
		DatabaseURL:            dbURL,
		MLServiceURL:           mlURL,
		UploadDir:              uploadDir,
		ReminderIntervalMinute: reminderInterval,
	}
}

