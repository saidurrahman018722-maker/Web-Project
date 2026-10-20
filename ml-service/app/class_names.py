"""
PlantVillage 38-class mapping with human-friendly plant names, disease labels, and health indicators.
"""

CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

def parse_class_name(raw_class: str) -> dict:
    parts = raw_class.split("___")
    raw_plant = parts[0]
    raw_disease = parts[1] if len(parts) > 1 else "Unknown"

    plant_map = {
        "Apple": "Apple",
        "Blueberry": "Blueberry",
        "Cherry_(including_sour)": "Cherry",
        "Corn_(maize)": "Corn (Maize)",
        "Grape": "Grape",
        "Orange": "Orange",
        "Peach": "Peach",
        "Pepper,_bell": "Bell Pepper",
        "Potato": "Potato",
        "Raspberry": "Raspberry",
        "Soybean": "Soybean",
        "Squash": "Squash",
        "Strawberry": "Strawberry",
        "Tomato": "Tomato"
    }

    plant_name = plant_map.get(raw_plant, raw_plant.replace("_", " "))
    is_healthy = "healthy" in raw_disease.lower()
    disease_name = "Healthy" if is_healthy else raw_disease.replace("_", " ").strip()

    return {
        "raw_class": raw_class,
        "plant_name": plant_name,
        "disease_name": disease_name,
        "is_healthy": is_healthy
    }

