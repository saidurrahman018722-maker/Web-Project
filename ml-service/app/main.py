from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.model import PlantClassifier
from app.class_names import CLASS_NAMES, parse_class_name

app = FastAPI(
    title="PlantDoc ML Inference Service",
    description="MobileNetV2-based crop disease classification API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = PlantClassifier()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "plantdoc-ml",
        "classes_count": len(CLASS_NAMES),
        "device": str(classifier.device)
    }

@app.get("/classes")
def list_classes():
    return [parse_class_name(c) for c in CLASS_NAMES]

@app.post("/predict")
async def predict_leaf(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    is_image = (
        (file.content_type and file.content_type.startswith("image/"))
        or filename.endswith((".jpg", ".jpeg", ".png", ".webp"))
    )
    if not is_image:
        raise HTTPException(status_code=400, detail="File uploaded must be an image (JPEG, PNG, etc.).")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    try:
        result = classifier.predict(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
