package handlers

import (
	"net/http"
	"plantdoc-backend/internal/models"
	"plantdoc-backend/internal/services"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GardenHandler struct {
	db             *gorm.DB
	reminderWorker *services.ReminderWorker
}

func NewGardenHandler(db *gorm.DB, reminderWorker *services.ReminderWorker) *GardenHandler {
	return &GardenHandler{
		db:             db,
		reminderWorker: reminderWorker,
	}
}

type AddPlantInput struct {
	DiagnosisID          *string `json:"diagnosis_id"`
	CustomName           string  `json:"custom_name" binding:"required"`
	PlantType            string  `json:"plant_type" binding:"required"`
	WateringIntervalDays int     `json:"watering_interval_days"`
	Notes                string  `json:"notes"`
}

func (h *GardenHandler) ListGardenPlants(c *gin.Context) {
	var plants []models.GardenPlant
	if err := h.db.Preload("Diagnosis").Order("created_at desc").Find(&plants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch garden plants"})
		return
	}
	c.JSON(http.StatusOK, plants)
}

func (h *GardenHandler) AddPlantToGarden(c *gin.Context) {
	var input AddPlantInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	interval := input.WateringIntervalDays
	if interval <= 0 {
		interval = 3
	}

	now := time.Now()
	plant := models.GardenPlant{
		ID:                   uuid.New().String(),
		DiagnosisID:          input.DiagnosisID,
		CustomName:           input.CustomName,
		PlantType:            input.PlantType,
		WateringIntervalDays: interval,
		LastWateredAt:        now,
		NextWaterDue:         now.AddDate(0, 0, interval),
		Status:               "active",
		Notes:                input.Notes,
	}

	if err := h.db.Create(&plant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add plant to garden"})
		return
	}

	h.reminderWorker.TriggerCheck()
	c.JSON(http.StatusCreated, plant)
}

func (h *GardenHandler) WaterPlant(c *gin.Context) {
	id := c.Param("id")
	var plant models.GardenPlant
	if err := h.db.First(&plant, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found in garden"})
		return
	}

	now := time.Now()
	plant.LastWateredAt = now
	plant.NextWaterDue = now.AddDate(0, 0, plant.WateringIntervalDays)

	if err := h.db.Save(&plant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update watering status"})
		return
	}

	h.reminderWorker.TriggerCheck()
	c.JSON(http.StatusOK, gin.H{
		"message":         "Plant watered successfully",
		"last_watered_at": plant.LastWateredAt,
		"next_water_due":  plant.NextWaterDue,
	})
}

func (h *GardenHandler) DeletePlant(c *gin.Context) {
	id := c.Param("id")
	if err := h.db.Delete(&models.GardenPlant{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove plant from garden"})
		return
	}
	h.reminderWorker.TriggerCheck()
	c.JSON(http.StatusOK, gin.H{"message": "Plant removed from garden"})
}

func (h *GardenHandler) GetAlerts(c *gin.Context) {
	alerts := h.reminderWorker.GetActiveAlerts()
	c.JSON(http.StatusOK, gin.H{
		"alerts": alerts,
		"count":  len(alerts),
	})
}

