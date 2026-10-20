package main

import (
	"fmt"
	"log"
	"net/http"
	"plantdoc-backend/internal/config"
	"plantdoc-backend/internal/database"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("==================================================")
	log.Println("     PlantDoc Server - Day 2: Database Layer      ")
	log.Println("==================================================")

	// Load environment configuration
	cfg := config.LoadConfig()

	// Initialize PostgreSQL Database & Run Auto-Migrations
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}

	r := gin.Default()

	// Enable CORS for frontend integration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Accept"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	r.Use(cors.New(corsConfig))

	// Health check endpoint with database connectivity check
	r.GET("/health", func(c *gin.Context) {
		sqlDB, err := db.DB()
		dbStatus := "connected"
		if err != nil || sqlDB.Ping() != nil {
			dbStatus = "disconnected"
		}

		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"database":  dbStatus,
			"timestamp": time.Now(),
		})
	})

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("PlantDoc server listening at http://localhost%s\n", serverAddr)
	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
