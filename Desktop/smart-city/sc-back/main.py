from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_almaty_metrics():

    aqi = random.randint(120, 190) 
    traffic = random.randint(4, 9)
    return {"aqi": aqi, "traffic": traffic}

@app.get("/api/analyze")
async def analyze():
    metrics = get_almaty_metrics()
    
    status = "Normal"
    if metrics["aqi"] > 150:
        status = "Critical"
        explanation = "Критическое загрязнение воздуха в нижней части города (ниже Райымбека)."
        action = "Рекомендовано перевести ТЭЦ-2 на газ и ограничить въезд грузовиков."
    elif metrics["traffic"] >= 8:
        status = "Warning"
        explanation = "Заторы на проспекте Аль-Фараби и Саина."
        action = "Активировать адаптивные светофоры, усилить работу метро."
    else:
        explanation = "Ситуация в городе стабильна."
        action = "Продолжать мониторинг."

    return {
        "metrics": metrics,
        "ai_report": {
            "status": status,
            "what_is_happening": explanation,
            "criticality": "Высокая" if status == "Critical" else "Средняя",
            "recommendation": action
        }
    }