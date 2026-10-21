package models

import (
	"testing"
	"time"
)

func TestGardenPlant_IsOverdue(t *testing.T) {
	now := time.Now()

	// Case 1: Plant whose next water due is in the future
	futurePlant := GardenPlant{
		ID:                   "test-1",
		CustomName:           "Basil",
		PlantType:            "Herb",
		WateringIntervalDays: 3,
		LastWateredAt:        now,
		NextWaterDue:         now.Add(24 * time.Hour),
		Status:               "active",
	}

	if futurePlant.IsOverdue() {
		t.Errorf("Expected plant with future watering date not to be overdue")
	}

	// Case 2: Plant whose next water due was 2 hours ago
	overduePlant := GardenPlant{
		ID:                   "test-2",
		CustomName:           "Fiddle Leaf Fig",
		PlantType:            "Houseplant",
		WateringIntervalDays: 7,
		LastWateredAt:        now.Add(-8 * 24 * time.Hour),
		NextWaterDue:         now.Add(-2 * time.Hour),
		Status:               "active",
	}

	if !overduePlant.IsOverdue() {
		t.Errorf("Expected plant with past watering date to be overdue")
	}
}
