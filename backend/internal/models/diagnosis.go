package models

import (
	"time"
)

type Diagnosis struct {
	ID          string    `gorm:"primaryKey;size:64" json:"id"`
	ImagePath   string    `gorm:"size:512;not null" json:"image_path"`
	PlantName   string    `gorm:"size:100;not null" json:"plant_name"`
	DiseaseName string    `gorm:"size:255;not null" json:"disease_name"`
	RawClass    string    `gorm:"size:255;not null" json:"raw_class"`
	Confidence  float64   `gorm:"not null" json:"confidence"`
	IsHealthy   bool      `gorm:"not null" json:"is_healthy"`
	Notes       string    `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`

	Remedy *Remedy `gorm:"foreignKey:RawClass;references:RawClass;constraint:-" json:"remedy,omitempty"`
}

