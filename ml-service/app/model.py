import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from app.class_names import CLASS_NAMES, parse_class_name

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "..", "weights", "mobilenet_v2_plantvillage.pth")

class PlantClassifier:
    def __init__(self, weights_path: str = WEIGHTS_PATH):
        self.device = DEVICE
        self.num_classes = len(CLASS_NAMES)
        self.model = self._build_model()
        self.weights_path = weights_path
        self._load_weights()
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def _build_model(self) -> nn.Module:
        model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        # Replace the final classification head for our 38 PlantVillage classes
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, self.num_classes)
        return model

    def _load_weights(self):
        if os.path.exists(self.weights_path):
            print(f"Loading weights from {self.weights_path}...")
            state_dict = torch.load(self.weights_path, map_location=self.device)
            self.model.load_state_dict(state_dict)
            print("Model weights loaded successfully.")
        else:
            print(f"No custom weights found at {self.weights_path}. Running with pre-trained feature extractor.")

    def predict(self, image_bytes: bytes) -> dict:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

        # Top 1 prediction
        top1_prob, top1_idx = torch.topk(probabilities, 1)
        top1_class = CLASS_NAMES[top1_idx[0].item()]
        top1_info = parse_class_name(top1_class)

        # Top 3 predictions for richer UI feedback
        top3_prob, top3_idx = torch.topk(probabilities, min(3, len(CLASS_NAMES)))
        top3 = []
        for prob, idx in zip(top3_prob, top3_idx):
            raw = CLASS_NAMES[idx.item()]
            info = parse_class_name(raw)
            top3.append({
                "raw_class": raw,
                "plant_name": info["plant_name"],
                "disease_name": info["disease_name"],
                "is_healthy": info["is_healthy"],
                "confidence": round(prob.item(), 4)
            })

        return {
            "raw_class": top1_class,
            "plant_name": top1_info["plant_name"],
            "disease_name": top1_info["disease_name"],
            "is_healthy": top1_info["is_healthy"],
            "confidence": round(top1_prob[0].item(), 4),
            "top_candidates": top3
        }

