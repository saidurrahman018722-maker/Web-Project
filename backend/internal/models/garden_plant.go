package models

import (
	"time"
)

type GardenPlant struct {
	ID                   string     `gorm:"primaryKey;size:64" json:"id"`
	DiagnosisID          *string    `gorm:"size:64" json:"diagnosis_id,omitempty"`
	CustomName           string     `gorm:"size:150;not null" json:"custom_name"`
	PlantType            string     `gorm:"size:100;not null" json:"plant_type"`
	WateringIntervalDays int        `gorm:"default:3" json:"watering_interval_days"`
	LastWateredAt        time.Time  `gorm:"not null" json:"last_watered_at"`
	NextWaterDue         time.Time  `gorm:"not null" json:"next_water_due"`
	Status               string     `gorm:"size:50;default:'active'" json:"status"` // active, archived, recovering
	Notes                string     `gorm:"type:text" json:"notes"`
	CreatedAt            time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	Diagnosis *Diagnosis `gorm:"foreignKey:DiagnosisID;references:ID;constraint:-" json:"diagnosis,omitempty"`
}

// IsOverdue checks if the plant currently requires watering
func (p *GardenPlant) IsOverdue() bool {
	return time.Now().After(p.NextWaterDue)
}

