package services

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMLClient_HealthCheck(t *testing.T) {
	// Mock ML service HTTP server
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/health" {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"status":"healthy","classes_count":38}`))
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer mockServer.Close()

	client := NewMLClient(mockServer.URL)
	healthy, err := client.HealthCheck()
	if err != nil {
		t.Fatalf("Unexpected error in HealthCheck: %v", err)
	}
	if !healthy {
		t.Errorf("Expected health status true, got false")
	}
}

func TestMLClient_PredictLeaf_MockResponse(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/predict" && r.Method == http.MethodPost {
			resp := PredictionResponse{
				RawClass:    "Tomato___Late_blight",
				PlantName:   "Tomato",
				DiseaseName: "Late Blight",
				IsHealthy:   false,
				Confidence:  0.9654,
				TopCandidates: []TopCandidate{
					{
						RawClass:    "Tomato___Late_blight",
						PlantName:   "Tomato",
						DiseaseName: "Late Blight",
						IsHealthy:   false,
						Confidence:  0.9654,
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(resp)
			return
		}
		w.WriteHeader(http.StatusBadRequest)
	}))
	defer mockServer.Close()

	client := NewMLClient(mockServer.URL)
	dummyImageBytes := []byte("fake-image-bytes")

	pred, err := client.PredictLeaf(dummyImageBytes, "test.jpg")
	if err != nil {
		t.Fatalf("Unexpected error calling PredictLeaf: %v", err)
	}

	if pred.PlantName != "Tomato" {
		t.Errorf("Expected PlantName Tomato, got %s", pred.PlantName)
	}
	if pred.DiseaseName != "Late Blight" {
		t.Errorf("Expected DiseaseName Late Blight, got %s", pred.DiseaseName)
	}
	if pred.IsHealthy {
		t.Errorf("Expected IsHealthy false, got true")
	}
	if pred.Confidence != 0.9654 {
		t.Errorf("Expected Confidence 0.9654, got %f", pred.Confidence)
	}
}
