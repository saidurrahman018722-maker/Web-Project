import pytest
from app.class_names import parse_class_name, CLASS_NAMES
from app.model import PlantClassifier
from PIL import Image
import io

def test_class_names_count():
    assert len(CLASS_NAMES) == 38

def test_parse_class_name_healthy():
    parsed = parse_class_name("Tomato___healthy")
    assert parsed["plant_name"] == "Tomato"
    assert parsed["disease_name"] == "Healthy"
    assert parsed["is_healthy"] is True

def test_parse_class_name_disease():
    parsed = parse_class_name("Apple___Cedar_apple_rust")
    assert parsed["plant_name"] == "Apple"
    assert parsed["disease_name"] == "Cedar apple rust"
    assert parsed["is_healthy"] is False

def test_inference_pipeline():
    classifier = PlantClassifier()
    img = Image.new('RGB', (224, 224), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    
    result = classifier.predict(buf.getvalue())
    assert "raw_class" in result
    assert "plant_name" in result
    assert "disease_name" in result
    assert "confidence" in result
    assert "top_candidates" in result
    assert len(result["top_candidates"]) == 3
    assert result["confidence"] > 0
