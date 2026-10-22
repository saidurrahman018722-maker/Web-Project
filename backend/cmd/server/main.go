package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"plantdoc-backend/internal/config"
	"plantdoc-backend/internal/database"
	"plantdoc-backend/internal/handlers"
	"plantdoc-backend/internal/services"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("==================================================")
	log.Println("     PlantDoc Server - Go (Gin) + ML Engine      ")
	log.Println("==================================================")

	cfg := config.LoadConfig()

	// Initialize Database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}

	// Initialize Services
	mlClient := services.NewMLClient(cfg.MLServiceURL)
	reminderWorker := services.NewReminderWorker(db, cfg.ReminderIntervalMinute)

	// Start Background Concurrency Worker
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	reminderWorker.Start(ctx)

	// Initialize Handlers
	diagnoseHandler := handlers.NewDiagnoseHandler(db, mlClient, cfg.UploadDir)
	gardenHandler := handlers.NewGardenHandler(db, reminderWorker)
	historyHandler := handlers.NewHistoryHandler(db, cfg.UploadDir)

	// Setup Router
	r := gin.Default()

	// Setup CORS for React frontend (Vite default: 5173, etc.)
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Serve uploaded images statically
	_ = os.MkdirAll(cfg.UploadDir, 0755)
	r.Static("/uploads", cfg.UploadDir)

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		mlHealthy, _ := mlClient.HealthCheck()
		c.JSON(http.StatusOK, gin.H{
			"status":     "healthy",
			"database":   "connected",
			"ml_service": mlHealthy,
			"timestamp":  time.Now(),
		})
	})

	// API Routes
	api := r.Group("/api")
	{
		// Diagnosis & Scanner
		api.POST("/diagnose", diagnoseHandler.DiagnoseLeaf)
		api.GET("/diagnose/:id", diagnoseHandler.GetDiagnosisByID)

		// My Garden & Care Tracker
		api.GET("/garden", gardenHandler.ListGardenPlants)
		api.POST("/garden", gardenHandler.AddPlantToGarden)
		api.POST("/garden/:id/water", gardenHandler.WaterPlant)
		api.DELETE("/garden/:id", gardenHandler.DeletePlant)
		api.GET("/garden/alerts", gardenHandler.GetAlerts)

		// History & Analytics
		api.GET("/history", historyHandler.GetHistory)
		api.DELETE("/history/:id", historyHandler.DeleteDiagnosis)
		api.GET("/stats", historyHandler.GetStats)

		// Remedies Encyclopedia
		api.GET("/remedies", historyHandler.ListRemedies)
		api.GET("/remedies/:raw_class", historyHandler.GetRemedyByClass)
	}

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	srv := &http.Server{
		Addr:    serverAddr,
		Handler: r,
	}

	// Graceful shutdown handling
	go func() {
		log.Printf("PlantDoc Go API server listening at http://localhost%s\n", serverAddr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down PlantDoc server gracefully...")
	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("PlantDoc server exited cleanly.")
}

