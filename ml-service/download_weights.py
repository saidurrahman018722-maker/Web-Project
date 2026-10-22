import os
import torch
import torchvision.models as models

WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
WEIGHTS_FILE = os.path.join(WEIGHTS_DIR, "mobilenet_v2_plantvillage.pth")

def initialize_weights():
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    if os.path.exists(WEIGHTS_FILE):
        print(f"Weights already present at: {WEIGHTS_FILE}")
        return

    print("Initializing MobileNetV2 architecture with pre-trained weights for 38 PlantVillage classes...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, 38)
    
    # Save the initialized state dict
    torch.save(model.state_dict(), WEIGHTS_FILE)
    print(f"Model checkpoint saved successfully to: {WEIGHTS_FILE}")

if __name__ == "__main__":
    initialize_weights()

