package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"
)

type TopCandidate struct {
	RawClass    string  `json:"raw_class"`
	PlantName   string  `json:"plant_name"`
	DiseaseName string  `json:"disease_name"`
	IsHealthy   bool    `json:"is_healthy"`
	Confidence  float64 `json:"confidence"`
}

type PredictionResponse struct {
	RawClass      string         `json:"raw_class"`
	PlantName     string         `json:"plant_name"`
	DiseaseName   string         `json:"disease_name"`
	IsHealthy     bool           `json:"is_healthy"`
	Confidence    float64        `json:"confidence"`
	TopCandidates []TopCandidate `json:"top_candidates"`
}

type MLClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewMLClient(baseURL string) *MLClient {
	return &MLClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *MLClient) HealthCheck() (bool, error) {
	resp, err := c.httpClient.Get(fmt.Sprintf("%s/health", c.baseURL))
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK, nil
}

func (c *MLClient) PredictLeaf(imageBytes []byte, filename string) (*PredictionResponse, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	h := make(map[string][]string)
	h["Content-Disposition"] = []string{fmt.Sprintf(`form-data; name="file"; filename="%s"`, filepath.Base(filename))}
	contentType := "image/jpeg"
	lower := strings.ToLower(filename)
	if strings.HasSuffix(lower, ".png") {
		contentType = "image/png"
	} else if strings.HasSuffix(lower, ".webp") {
		contentType = "image/webp"
	}
	h["Content-Type"] = []string{contentType}

	part, err := writer.CreatePart(h)
	if err != nil {
		return nil, fmt.Errorf("failed to create multipart form file: %w", err)
	}

	if _, err := io.Copy(part, bytes.NewReader(imageBytes)); err != nil {
		return nil, fmt.Errorf("failed to copy image bytes to multipart: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close multipart writer: %w", err)
	}

	url := fmt.Sprintf("%s/predict", c.baseURL)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create prediction request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call ML inference service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ML service returned status %d: %s", resp.StatusCode, string(respBody))
	}

	var pred PredictionResponse
	if err := json.NewDecoder(resp.Body).Decode(&pred); err != nil {
		return nil, fmt.Errorf("failed to decode ML prediction response: %w", err)
	}

	return &pred, nil
}
