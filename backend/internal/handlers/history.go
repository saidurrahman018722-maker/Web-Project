package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"plantdoc-backend/internal/models"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HistoryHandler struct {
	db        *gorm.DB
	uploadDir string
}

func NewHistoryHandler(db *gorm.DB, uploadDir string) *HistoryHandler {
	return &HistoryHandler{
		db:        db,
		uploadDir: uploadDir,
	}
}

func (h *HistoryHandler) GetHistory(c *gin.Context) {
	plantFilter := c.Query("plant")
	healthFilter := c.Query("is_healthy")

	query := h.db.Model(&models.Diagnosis{}).Preload("Remedy").Order("created_at desc")

	if plantFilter != "" {
		query = query.Where("LOWER(plant_name) LIKE ?", "%"+strings.ToLower(plantFilter)+"%")
	}
	if healthFilter != "" {
		if healthFilter == "true" {
			query = query.Where("is_healthy = ?", true)
		} else if healthFilter == "false" {
			query = query.Where("is_healthy = ?", false)
		}
	}

	var diagnoses []models.Diagnosis
	if err := query.Find(&diagnoses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch diagnosis history"})
		return
	}

	c.JSON(http.StatusOK, diagnoses)
}

func (h *HistoryHandler) DeleteDiagnosis(c *gin.Context) {
	id := c.Param("id")
	var record models.Diagnosis
	if err := h.db.First(&record, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Diagnosis not found"})
		return
	}

	// Delete image file from disk if exists
	filename := filepath.Base(record.ImagePath)
	filePath := filepath.Join(h.uploadDir, filename)
	_ = os.Remove(filePath)

	if err := h.db.Delete(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Diagnosis deleted successfully"})
}

func (h *HistoryHandler) GetStats(c *gin.Context) {
	var totalScans int64
	var healthyCount int64
	var diseasedCount int64
	var totalGardenPlants int64

	h.db.Model(&models.Diagnosis{}).Count(&totalScans)
	h.db.Model(&models.Diagnosis{}).Where("is_healthy = ?", true).Count(&healthyCount)
	h.db.Model(&models.Diagnosis{}).Where("is_healthy = ?", false).Count(&diseasedCount)
	h.db.Model(&models.GardenPlant{}).Count(&totalGardenPlants)

	// Top diagnosed plants
	type TopPlant struct {
		PlantName string `json:"plant_name"`
		Count     int64  `json:"count"`
	}
	var topPlants []TopPlant
	h.db.Model(&models.Diagnosis{}).
		Select("plant_name, count(*) as count").
		Group("plant_name").
		Order("count desc").
		Limit(5).
		Scan(&topPlants)

	c.JSON(http.StatusOK, gin.H{
		"total_scans":         totalScans,
		"healthy_count":       healthyCount,
		"diseased_count":      diseasedCount,
		"total_garden_plants": totalGardenPlants,
		"top_plants":          topPlants,
	})
}

func (h *HistoryHandler) ListRemedies(c *gin.Context) {
	search := c.Query("search")
	query := h.db.Model(&models.Remedy{}).Order("plant_name asc, disease_name asc")

	if search != "" {
		s := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(plant_name) LIKE ? OR LOWER(disease_name) LIKE ? OR LOWER(symptoms) LIKE ?", s, s, s)
	}

	var remedies []models.Remedy
	if err := query.Find(&remedies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch disease remedies"})
		return
	}

	c.JSON(http.StatusOK, remedies)
}

func (h *HistoryHandler) GetRemedyByClass(c *gin.Context) {
	rawClass := c.Param("raw_class")
	var remedy models.Remedy
	if err := h.db.First(&remedy, "raw_class = ?", rawClass).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Remedy not found"})
		return
	}
	c.JSON(http.StatusOK, remedy)
}

