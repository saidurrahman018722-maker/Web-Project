# 🌿 PlantDoc: Intelligent Plant Disease Diagnostic & Care Portal

An intelligent crop health diagnostic and plant care management platform built for university web development coursework. It combines a high-performance **Go (Golang) Gin** backend API, a **Machine Learning (PyTorch)** computer vision microservice, a **React + Vite** frontend, and a **PostgreSQL** relational database.

---

## 🏗️ System Architecture

```
[ Frontend: React + Vite (:5173) ]
                 │
                 ▼ (REST / Multipart HTTP)
┌──────────────────────────────────────────────────┐
│             Go (Gin) API Backend (:8080)         │
│  - Image Upload & Format Validation              │
│  - PostgreSQL Database (GORM)                    │
│  - Background Goroutine Care Reminder Engine     │
│  - "My Garden" & Diagnosis History Handlers      │
└────────────────────────┬─────────────────────────┘
                         │ (Internal HTTP POST)
                         ▼
┌──────────────────────────────────────────────────┐
│          Python ML Microservice (:5000)          │
│  - FastAPI Web Service                           │
│  - MobileNetV2 (PlantVillage Weights)            │
│  - 38 Crop & Plant Disease Classification        │
└──────────────────────────────────────────────────┘
```

---

## 📅 2-Week Daily Development Roadmap

To ensure a steady, verifiable development trajectory, the project is structured across daily milestones:

* **Day 1: Project Architecture, ML Service & Go Skeleton** *(Current)*
  * Establish project structure and Git branch workflow.
  * Implement Python ML microservice using PyTorch + MobileNetV2 + FastAPI.
  * Scaffold Go Gin server with routing, config loader, and health check.
* **Day 2: PostgreSQL Schema & Disease Remedies Seed Catalog**
  * Set up PostgreSQL models (Diagnosis, Remedy, GardenPlant).
  * Seed knowledge base for 38 crop disease classes (symptoms, organic treatments, chemical controls, prevention).
* **Day 3: Multipart Image Upload & Go-to-ML Client Pipeline**
  * Implement image upload validation (JPEG/PNG/WEBP up to 15MB) with UUID filenames.
  * Connect Go ML client to forward images to Python microservice and enrich results with remedies.
* **Day 4: "My Garden" Plant Tracker & CRUD Handlers**
  * Create endpoints to add plants to garden, list active plants, and delete entries.
  * Implement watering interval calculations (`last_watered_at` & `next_water_due`).
* **Day 5: Go Goroutine Concurrency: Background Care Reminder Engine**
  * Implement `ReminderWorker` utilizing Go goroutines and `time.Ticker`.
  * Periodically poll for plants requiring water and surface alerts via `/api/garden/alerts`.
* **Day 6: Diagnosis History & Real-Time Stats API**
  * Implement `/api/history` with filtering by plant species and health status.
  * Implement `/api/stats` aggregating scan counts, healthy vs. diseased ratios, and top plants.
* **Day 7: Mid-Project Audit & Verification**
  * End-to-end integration test of all backend endpoints with sample leaf images.
* **Day 8: React + Vite Frontend Scaffolding & Design System**
  * Initialize Vite React app with Tailwind CSS and Lucide icons.
  * Build responsive navigation bar and global application shell.
* **Day 9: Interactive Drag-and-Drop Leaf Scanner UI**
  * Build file upload dropzone with instant image preview.
  * Implement animated loading state and error handling.
* **Day 10: Rich Diagnosis Result & Treatment Guide Component**
  * Display prediction badge, confidence percentage, symptoms, and organic/chemical remedies.
  * One-click "Add to My Garden" modal with custom naming and watering interval.
* **Day 11: "My Garden" Interactive Dashboard**
  * Render plant cards with water countdown badges (On Track / Due Today / Overdue).
  * Implement "Water Now" action button with instant UI updates.
* **Day 12: Diagnosis History & Searchable Disease Encyclopedia**
  * Build browsable history table with search and filters.
  * Build searchable disease library covering all 38 supported plant diseases.
* **Day 13: Edge Case Hardening & Performance Optimization**
  * Handle non-leaf image errors, network timeouts, and mobile responsive testing.
* **Day 14: Final Documentation, Rehearsal & Submission**
  * Curate test sample leaf images and prepare live demonstration walkthrough.

---

## 🚀 Running the Project (Day 1 Milestone)

### Prerequisites
* Go 1.21+
* Python 3.10+
* Node.js 18+ (for upcoming frontend milestones)

### 1. Python ML Service
```bash
cd ml-service
python -m pip install -r requirements.txt
python download_weights.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 5000
```
*Health Check: `http://localhost:5000/health`*

### 2. Go Backend Server
```bash
cd backend
# Create .env from .env.example (pre-configured for PostgreSQL)
cp .env.example .env
go run cmd/server/main.go
```
*API Base URL: `http://localhost:8080/health`*