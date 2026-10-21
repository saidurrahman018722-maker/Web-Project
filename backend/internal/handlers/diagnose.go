package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"plantdoc-backend/internal/models"
	"plantdoc-backend/internal/services"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DiagnoseHandler struct {
	db        *gorm.DB
	mlClient  *services.MLClient
	uploadDir string
}

func NewDiagnoseHandler(db *gorm.DB, mlClient *services.MLClient, uploadDir string) *DiagnoseHandler {
	_ = os.MkdirAll(uploadDir, 0755)
	return &DiagnoseHandler{
		db:        db,
		mlClient:  mlClient,
		uploadDir: uploadDir,
	}
}

func (h *DiagnoseHandler) DiagnoseLeaf(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		file, header, err = c.Request.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide an image file under 'image' or 'file' form field"})
			return
		}
	}
	defer file.Close()

	// Validate extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported file format. Please upload a JPEG, PNG, or WEBP image."})
		return
	}

	// Validate file size (< 15MB)
	if header.Size > 15*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file too large. Maximum size is 15 MB."})
		return
	}

	imageBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read image bytes"})
		return
	}

	// Generate unique filename and persist to local storage
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filePath := filepath.Join(h.uploadDir, filename)
	if err := os.WriteFile(filePath, imageBytes, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save uploaded image"})
		return
	}

	// Call ML Inference Microservice
	pred, err := h.mlClient.PredictLeaf(imageBytes, header.Filename)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": fmt.Sprintf("ML service error: %v", err)})
		return
	}

	// Query remedies from database
	var remedy models.Remedy
	h.db.Where("raw_class = ?", pred.RawClass).First(&remedy)

	// Save diagnosis record
	diagnosisID := uuid.New().String()
	record := models.Diagnosis{
		ID:          diagnosisID,
		ImagePath:   "/uploads/" + filename,
		PlantName:   pred.PlantName,
		DiseaseName: pred.DiseaseName,
		RawClass:    pred.RawClass,
		Confidence:  pred.Confidence,
		IsHealthy:   pred.IsHealthy,
		Notes:       c.PostForm("notes"),
	}

	if err := h.db.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to persist diagnosis record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"diagnosis_id":   record.ID,
		"image_url":      record.ImagePath,
		"plant_name":     record.PlantName,
		"disease_name":   record.DiseaseName,
		"raw_class":      record.RawClass,
		"confidence":     record.Confidence,
		"is_healthy":     record.IsHealthy,
		"remedy":         remedy,
		"top_candidates": pred.TopCandidates,
		"created_at":     record.CreatedAt,
	})
}

func (h *DiagnoseHandler) GetDiagnosisByID(c *gin.Context) {
	id := c.Param("id")
	var diagnosis models.Diagnosis
	if err := h.db.Preload("Remedy").First(&diagnosis, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Diagnosis record not found"})
		return
	}
	c.JSON(http.StatusOK, diagnosis)
}

