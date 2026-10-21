package config

import (
	"os"
	"testing"
)

func TestLoadConfig_Defaults(t *testing.T) {
	// Clear specific env vars
	os.Unsetenv("PORT")
	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("ML_SERVICE_URL")
	os.Unsetenv("UPLOAD_DIR")
	os.Unsetenv("REMINDER_INTERVAL_MINUTES")

	cfg := LoadConfig()

	if cfg.Port != "8080" {
		t.Errorf("Expected default Port 8080, got %s", cfg.Port)
	}

	if cfg.MLServiceURL != "http://localhost:5000" {
		t.Errorf("Expected default MLServiceURL http://localhost:5000, got %s", cfg.MLServiceURL)
	}

	if cfg.UploadDir != "./uploads" {
		t.Errorf("Expected default UploadDir ./uploads, got %s", cfg.UploadDir)
	}

	if cfg.ReminderIntervalMinute != 60 {
		t.Errorf("Expected default ReminderIntervalMinute 60, got %d", cfg.ReminderIntervalMinute)
	}
}

func TestLoadConfig_CustomEnv(t *testing.T) {
	os.Setenv("PORT", "9090")
	os.Setenv("ML_SERVICE_URL", "http://ml-host:5000")
	os.Setenv("UPLOAD_DIR", "/var/uploads")
	os.Setenv("REMINDER_INTERVAL_MINUTES", "30")
	defer func() {
		os.Unsetenv("PORT")
		os.Unsetenv("ML_SERVICE_URL")
		os.Unsetenv("UPLOAD_DIR")
		os.Unsetenv("REMINDER_INTERVAL_MINUTES")
	}()

	cfg := LoadConfig()

	if cfg.Port != "9090" {
		t.Errorf("Expected Port 9090, got %s", cfg.Port)
	}
	if cfg.MLServiceURL != "http://ml-host:5000" {
		t.Errorf("Expected MLServiceURL http://ml-host:5000, got %s", cfg.MLServiceURL)
	}
	if cfg.UploadDir != "/var/uploads" {
		t.Errorf("Expected UploadDir /var/uploads, got %s", cfg.UploadDir)
	}
	if cfg.ReminderIntervalMinute != 30 {
		t.Errorf("Expected ReminderIntervalMinute 30, got %d", cfg.ReminderIntervalMinute)
	}
}
