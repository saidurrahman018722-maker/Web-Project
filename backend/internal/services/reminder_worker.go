package services

import (
	"context"
	"log"
	"plantdoc-backend/internal/models"
	"sync"
	"time"

	"gorm.io/gorm"
)

type PlantAlert struct {
	PlantID     string    `json:"plant_id"`
	CustomName  string    `json:"custom_name"`
	PlantType   string    `json:"plant_type"`
	NextWaterAt time.Time `json:"next_water_at"`
	IsOverdue   bool      `json:"is_overdue"`
	MinutesLate int       `json:"minutes_late"`
}

type ReminderWorker struct {
	db       *gorm.DB
	interval time.Duration
	mu       sync.RWMutex
	alerts   []PlantAlert
}

func NewReminderWorker(db *gorm.DB, intervalMinutes int) *ReminderWorker {
	if intervalMinutes <= 0 {
		intervalMinutes = 60
	}
	return &ReminderWorker{
		db:       db,
		interval: time.Duration(intervalMinutes) * time.Minute,
		alerts:   make([]PlantAlert, 0),
	}
}

// Start launches the background goroutine monitoring care schedules
func (w *ReminderWorker) Start(ctx context.Context) {
	log.Printf("[ReminderWorker] Starting background care reminder engine (interval: %v)...", w.interval)

	// Run initial check immediately
	w.checkReminders()

	go func() {
		ticker := time.NewTicker(w.interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				log.Println("[ReminderWorker] Stopping background care reminder engine.")
				return
			case <-ticker.C:
				w.checkReminders()
			}
		}
	}()
}

func (w *ReminderWorker) checkReminders() {
	var overduePlants []models.GardenPlant
	now := time.Now()

	// Find plants whose next water due is in the past or within the next 2 hours
	lookahead := now.Add(2 * time.Hour)
	err := w.db.Where("status = ? AND next_water_due <= ?", "active", lookahead).Find(&overduePlants).Error
	if err != nil {
		log.Printf("[ReminderWorker] Error polling garden plants: %v", err)
		return
	}

	newAlerts := make([]PlantAlert, 0, len(overduePlants))
	for _, p := range overduePlants {
		isOverdue := now.After(p.NextWaterDue)
		minutesLate := 0
		if isOverdue {
			minutesLate = int(now.Sub(p.NextWaterDue).Minutes())
		}

		newAlerts = append(newAlerts, PlantAlert{
			PlantID:     p.ID,
			CustomName:  p.CustomName,
			PlantType:   p.PlantType,
			NextWaterAt: p.NextWaterDue,
			IsOverdue:   isOverdue,
			MinutesLate: minutesLate,
		})
	}

	w.mu.Lock()
	w.alerts = newAlerts
	w.mu.Unlock()

	if len(newAlerts) > 0 {
		log.Printf("[ReminderWorker] Found %d plants requiring watering attention.", len(newAlerts))
	}
}

// GetActiveAlerts returns thread-safe list of active plant care alerts
func (w *ReminderWorker) GetActiveAlerts() []PlantAlert {
	w.mu.RLock()
	defer w.mu.RUnlock()
	copied := make([]PlantAlert, len(w.alerts))
	copy(copied, w.alerts)
	return copied
}

// TriggerCheck allows manual re-check (e.g. after user waters a plant)
func (w *ReminderWorker) TriggerCheck() {
	go w.checkReminders()
}

