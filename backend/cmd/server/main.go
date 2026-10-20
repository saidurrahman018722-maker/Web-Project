package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("==================================================")
	log.Println("     PlantDoc Server - Day 1 Core Skeleton        ")
	log.Println("==================================================")

	r := gin.Default()

	// Enable CORS for upcoming frontend integration
	r.Use(cors.Default())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"message": "PlantDoc backend API server initialized",
		})
	})

	log.Println("PlantDoc server listening at http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
