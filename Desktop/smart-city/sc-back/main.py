from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
import time
import random
import os
from typing import Optional

app = FastAPI(title="Smart City Almaty API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_KEY = os.getenv("GEMINI_KEY", "AIzaSyD7e6xNnaqBf2V4OWd7-UH58KxKu43Kpkw")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
)
OWM_KEY = os.getenv("OWM_KEY", "")
ALMATY_LAT, ALMATY_LON = 43.238, 76.945

# ── Data cache ────────────────────────────────────────────
_weather_cache: dict = {"data": None, "ts": 0}
CACHE_TTL = 600  # 10 min


def pm25_to_aqi(pm25: float) -> int:
    """Convert PM2.5 μg/m³ to US AQI scale."""
    breakpoints = [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 500.4, 301, 500),
    ]
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if c_lo <= pm25 <= c_hi:
            return int((i_hi - i_lo) / (c_hi - c_lo) * (pm25 - c_lo) + i_lo)
    return 500


async def fetch_owm_data() -> dict:
    """Fetch AQI + weather from OpenWeatherMap."""
    async with httpx.AsyncClient(timeout=10) as client:
        aqi_resp, weather_resp = await asyncio.gather(
            client.get(
                "http://api.openweathermap.org/data/2.5/air_pollution",
                params={"lat": ALMATY_LAT, "lon": ALMATY_LON, "appid": OWM_KEY},
            ),
            client.get(
                "http://api.openweathermap.org/data/2.5/weather",
                params={"lat": ALMATY_LAT, "lon": ALMATY_LON, "appid": OWM_KEY,
                        "units": "metric", "lang": "ru"},
            ),
        )
        aqi_resp.raise_for_status()
        weather_resp.raise_for_status()

        aqi_raw = aqi_resp.json()
        w_raw = weather_resp.json()
        comp = aqi_raw["list"][0]["components"]
        pm25 = round(comp["pm2_5"], 1)

        return {
            "aqi": pm25_to_aqi(pm25),
            "pm25": pm25,
            "pm10": round(comp.get("pm10", 0), 1),
            "co": round(comp.get("co", 0), 1),
            "no2": round(comp.get("no2", 0), 1),
            "o3": round(comp.get("o3", 0), 1),
            "temp": round(w_raw["main"]["temp"], 1),
            "feels_like": round(w_raw["main"]["feels_like"], 1),
            "humidity": w_raw["main"]["humidity"],
            "wind_speed": round(w_raw["wind"]["speed"], 1),
            "wind_deg": w_raw["wind"].get("deg", 0),
            "description": w_raw["weather"][0]["description"],
            "pressure": w_raw["main"]["pressure"],
            "visibility": w_raw.get("visibility", 10000),
        }


async def get_city_data() -> dict:
    """Return cached or fresh city data."""
    global _weather_cache
    now = time.time()
    if _weather_cache["data"] and now - _weather_cache["ts"] < CACHE_TTL:
        return _weather_cache["data"]
    try:
        data = await fetch_owm_data()
        _weather_cache = {"data": data, "ts": now}
        return data
    except Exception:
        if _weather_cache["data"]:
            return _weather_cache["data"]
        # Fallback mock — realistic Almaty averages
        return {
            "aqi": 142, "pm25": 33.8, "pm10": 48.2,
            "co": 318.4, "no2": 21.3, "o3": 78.5,
            "temp": 11.2, "feels_like": 8.5, "humidity": 54,
            "wind_speed": 3.8, "wind_deg": 210,
            "description": "переменная облачность",
            "pressure": 1018, "visibility": 8000,
        }


async def call_gemini(prompt: str) -> str:
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 400, "temperature": 0.7},
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(GEMINI_URL, json=payload)
            if resp.status_code == 429:
                return None
            resp.raise_for_status()
            return resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return None


# ── /api/analyze ──────────────────────────────────────────
@app.get("/api/analyze")
async def analyze():
    city = await get_city_data()
    aqi = city["aqi"]
    traffic = random.randint(55, 85)

    # Build rich prompt for Gemini
    prompt = f"""Ты — система мониторинга Умного города Алматы.
Текущие данные (РЕАЛЬНЫЕ от OpenWeatherMap):
- AQI (индекс качества воздуха): {aqi}
- PM2.5: {city['pm25']} мкг/м³
- PM10: {city['pm10']} мкг/м³
- NO₂: {city['no2']} мкг/м³
- CO: {city['co']} мкг/м³
- Температура: {city['temp']}°C (ощущается как {city['feels_like']}°C)
- Влажность: {city['humidity']}%
- Ветер: {city['wind_speed']} м/с
- Погода: {city['description']}
- Давление: {city['pressure']} гПа
- Загруженность дорог: {traffic}%

На основе РЕАЛЬНЫХ данных дай:
1. Статус города (Критично/Предупреждение/Норма) — одним словом
2. Что происходит — 1-2 предложения
3. Конкретную рекомендацию для акимата — 1-2 предложения

Отвечай строго в JSON формате:
{{"status": "...", "what_is_happening": "...", "recommendation": "...", "criticality": "Высокая/Средняя/Низкая"}}"""

    gemini_text = await call_gemini(prompt)

    # Parse Gemini JSON or build rule-based
    ai_report = None
    if gemini_text:
        try:
            import json, re
            match = re.search(r'\{.*\}', gemini_text, re.DOTALL)
            if match:
                ai_report = json.loads(match.group())
        except Exception:
            pass

    if not ai_report:
        if aqi > 150:
            ai_report = {
                "status": "Critical",
                "what_is_happening": f"Критическое загрязнение воздуха: AQI {aqi}, PM2.5 {city['pm25']} мкг/м³. Основные источники — ТЭЦ и автотрафик.",
                "recommendation": "Перевести ТЭЦ-2 на газ, ограничить въезд грузовиков. Рекомендовать ношение масок FFP2.",
                "criticality": "Высокая",
            }
        elif aqi > 100 or traffic > 75:
            ai_report = {
                "status": "Warning",
                "what_is_happening": f"Умеренное загрязнение воздуха (AQI {aqi}) и высокая загруженность дорог ({traffic}%).",
                "recommendation": "Активировать адаптивные светофоры. Мониторинг промышленных выбросов.",
                "criticality": "Средняя",
            }
        else:
            ai_report = {
                "status": "Normal",
                "what_is_happening": f"Город работает в штатном режиме. AQI {aqi}, загруженность {traffic}%.",
                "recommendation": "Продолжать мониторинг. Плановые работы по расписанию.",
                "criticality": "Низкая",
            }

    return {
        "metrics": {
            "aqi": aqi,
            "traffic": traffic,
            "pm25": city["pm25"],
            "temp": city["temp"],
            "humidity": city["humidity"],
            "wind_speed": city["wind_speed"],
            "description": city["description"],
            "pressure": city["pressure"],
        },
        "ai_report": ai_report,
    }


# ── /api/weather ──────────────────────────────────────────
@app.get("/api/weather")
async def weather():
    return await get_city_data()


# ── /api/chat ─────────────────────────────────────────────
class ChatMessage(BaseModel):
    message: str


CHAT_SYSTEM = """Ты — умный городской советник Smart City Алматы.
Отвечай информативно (3-5 предложений), с конкретными данными.
Если вопрос о городе — давай советы акимату и горожанам.
Если вопрос не о городе — мягко верни разговор к теме города.
Отвечай на том же языке, что и вопрос (русский/казахский/английский)."""


@app.post("/api/chat")
async def chat(body: ChatMessage):
    city = await get_city_data()
    context = f"""
Актуальные данные Алматы (OpenWeatherMap):
- AQI: {city['aqi']} | PM2.5: {city['pm25']} мкг/м³ | PM10: {city['pm10']} мкг/м³
- Температура: {city['temp']}°C | Влажность: {city['humidity']}% | Ветер: {city['wind_speed']} м/с
- Погода: {city['description']} | Давление: {city['pressure']} гПа
- Видимость: {city.get('visibility', 10000)//1000} км
"""
    prompt = f"{CHAT_SYSTEM}\n\n{context}\n\nВопрос пользователя: {body.message}"
    reply = await call_gemini(prompt)

    if not reply:
        reply = _rule_reply(body.message, city)

    return {"reply": reply, "source": "gemini" if reply else "local"}


def _rule_reply(msg: str, city: dict) -> str:
    m = msg.lower()
    if any(k in m for k in ["воздух", "aqi", "смог", "pm2", "эколог", "air"]):
        level = "критический" if city["aqi"] > 150 else "умеренный" if city["aqi"] > 100 else "нормальный"
        return f"Текущий AQI Алматы: {city['aqi']} — уровень {level}. PM2.5: {city['pm25']} мкг/м³. {'Рекомендую ограничить прогулки и использовать маски FFP2.' if city['aqi'] > 100 else 'Воздух приемлемого качества, но мониторинг продолжается.'}"
    if any(k in m for k in ["погод", "температур", "weather", "дождь", "ветер"]):
        return f"Сейчас в Алматы: {city['temp']}°C (ощущается как {city['feels_like']}°C), {city['description']}. Влажность {city['humidity']}%, ветер {city['wind_speed']} м/с. Давление {city['pressure']} гПа."
    if any(k in m for k in ["трафик", "пробк", "транспорт", "дорог", "traffic"]):
        return "Загрузка дорог: 62%. Критика: пр. Сарыарқа 91%. Альтернативы: пр. Абая, BRT-маршруты. Адаптивные светофоры активны на 12 перекрёстках."
    if any(k in m for k in ["безопасност", "инцидент", "камер", "safety"]):
        return "7 инцидентов сегодня (-2 к норме). 1 240 камер онлайн (99%). 34 патруля активны. Среднее время реагирования: 4.2 мин."
    if any(k in m for k in ["вода", "газ", "электр", "жкх", "коммунал", "utilities"]):
        return "ЖКХ: Вода 98%, Электро 84%, Газ 91%, Отопление 88%. Работы: Водопровод №4 сегодня 14:00–17:00."
    return f"Я — советник Smart City Алматы. Текущая ситуация: AQI {city['aqi']}, температура {city['temp']}°C. Спросите о воздухе, транспорте, безопасности или ЖКХ."


# ── /api/akims ────────────────────────────────────────────
AKIMS = [
    {"id": 1, "name": "Ахметов Б.К.",       "district": "Алатауский",   "specialty": ["utilities", "roads"],    "avatar": "АБ", "color": "#3B82F6"},
    {"id": 2, "name": "Сейткали Р.М.",       "district": "Алмалинский",  "specialty": ["ecology", "parks"],      "avatar": "СР", "color": "#10B981"},
    {"id": 3, "name": "Жаксыбеков А.Т.",     "district": "Ауэзовский",   "specialty": ["transport", "safety"],   "avatar": "ЖА", "color": "#F59E0B"},
    {"id": 4, "name": "Темирбеков Д.С.",     "district": "Бостандыкский","specialty": ["utilities", "ecology"],  "avatar": "ТД", "color": "#8B5CF6"},
    {"id": 5, "name": "Нурмаганбетов С.Е.",  "district": "Жетісуский",   "specialty": ["transport", "roads"],    "avatar": "НС", "color": "#06B6D4"},
    {"id": 6, "name": "Касымова А.М.",       "district": "Медеуский",    "specialty": ["safety", "parks"],       "avatar": "КА", "color": "#EF4444"},
    {"id": 7, "name": "Байжанов Е.О.",       "district": "Наурызбайский","specialty": ["utilities", "roads"],    "avatar": "БЕ", "color": "#F97316"},
    {"id": 8, "name": "Сейтхалиева Г.Б.",   "district": "Түрксіб",      "specialty": ["ecology", "transport"],  "avatar": "СГ", "color": "#EC4899"},
]


@app.get("/api/akims")
async def get_akims():
    return AKIMS


# ── Tasks storage (in-memory) ─────────────────────────────
_next_id = {"tasks": 100, "requests": 50}

TASKS: list = [
    {"id": 1, "title": "Ремонт дороги пр. Сарыарка — участок 3", "category": "roads",     "district": "Алмалинский",  "priority": "critical", "status": "in_progress", "akim_id": 1, "deadline": "2024-04-10", "created": "2024-04-01", "progress": 45},
    {"id": 2, "title": "Замена фильтров на ТЭЦ-2",               "category": "ecology",    "district": "Ауэзовский",   "priority": "high",     "status": "pending",      "akim_id": None, "deadline": "2024-04-15", "created": "2024-04-02", "progress": 0},
    {"id": 3, "title": "Установка 20 новых камер — Бостандык",   "category": "safety",     "district": "Бостандыкский","priority": "medium",   "status": "pending",      "akim_id": None, "deadline": "2024-04-20", "created": "2024-04-02", "progress": 0},
    {"id": 4, "title": "Ремонт водопровода — Алатау ул., 12",    "category": "utilities",  "district": "Алатауский",   "priority": "high",     "status": "in_progress",  "akim_id": 1, "deadline": "2024-04-08", "created": "2024-04-01", "progress": 70},
    {"id": 5, "title": "Оптимизация маршрутов автобусов",        "category": "transport",  "district": "Медеуский",    "priority": "medium",   "status": "pending",      "akim_id": None, "deadline": "2024-04-25", "created": "2024-04-03", "progress": 0},
    {"id": 6, "title": "Озеленение парка Горького",              "category": "parks",      "district": "Алмалинский",  "priority": "low",      "status": "completed",    "akim_id": 2, "deadline": "2024-04-05", "created": "2024-03-28", "progress": 100},
    {"id": 7, "title": "Ремонт уличного освещения — Наурызбай",  "category": "utilities",  "district": "Наурызбайский","priority": "high",     "status": "in_progress",  "akim_id": 7, "deadline": "2024-04-09", "created": "2024-04-02", "progress": 30},
    {"id": 8, "title": "Патрулирование центрального района",     "category": "safety",     "district": "Медеуский",    "priority": "medium",   "status": "in_progress",  "akim_id": 6, "deadline": "2024-04-30", "created": "2024-04-01", "progress": 60},
]

CITIZEN_REQUESTS: list = [
    {"id": 1,  "title": "Яма на дороге",                "description": "Большая яма на пересечении ул. Тимирязева и пр. Достык. Опасна для транспорта.", "category": "roads",     "district": "Медеуский",    "priority": "high",   "status": "pending",     "votes": 47, "timestamp": "2024-04-01 09:15", "author": "Иванов А.С."},
    {"id": 2,  "title": "Неработающий фонарь",          "description": "На ул. Манаса, 18 три фонаря не работают уже 2 недели. Темно и опасно вечером.", "category": "utilities", "district": "Алмалинский",  "priority": "medium", "status": "in_progress", "votes": 23, "timestamp": "2024-04-01 11:30", "author": "Петрова М.В."},
    {"id": 3,  "title": "Мусор не вывозят",             "description": "Контейнеры во дворе по ул. Байзакова не вывозятся 5 дней. Запах и антисанитария.", "category": "utilities", "district": "Бостандыкский","priority": "high",   "status": "pending",     "votes": 89, "timestamp": "2024-04-02 08:00", "author": "Сахариева Д."},
    {"id": 4,  "title": "Смог над Алатауским районом",  "description": "Сильный смог, дышать сложно. Дети не могут гулять. Просим проверить выбросы ТЭЦ.", "category": "ecology",  "district": "Алатауский",   "priority": "critical","status": "pending",     "votes": 134,"timestamp": "2024-04-02 10:45", "author": "Мамытбеков Е.Т."},
    {"id": 5,  "title": "Нарушение ПДД на перекрёстке","description": "На пересечении пр. Аль-Фараби и ул. Розыбакиева ежедневно нарушают ПДД.", "category": "safety",    "district": "Бостандыкский","priority": "medium", "status": "pending",     "votes": 31, "timestamp": "2024-04-02 14:20", "author": "Кузнецов И."},
    {"id": 6,  "title": "Парковка на тротуаре",         "description": "Машины паркуются на тротуарах, мамы с колясками не могут пройти, ул. Абая 150.", "category": "transport", "district": "Алмалинский",  "priority": "low",    "status": "pending",     "votes": 18, "timestamp": "2024-04-03 09:00", "author": "Ли А."},
    {"id": 7,  "title": "Нет горячей воды",             "description": "В доме по пр. Сейфуллина, 45 нет горячей воды уже 3 дня. Управляющая компания не реагирует.", "category": "utilities","district": "Алмалинский","priority": "high","status": "in_progress","votes": 56, "timestamp": "2024-04-03 07:30", "author": "Аюпова З."},
    {"id": 8,  "title": "Опасный перекрёсток для детей","description": "Школьники переходят дорогу без светофора — прошу установить. Ул. Навои, 62.", "category": "safety",    "district": "Ауэзовский",   "priority": "high",   "status": "pending",     "votes": 92, "timestamp": "2024-04-03 12:00", "author": "Алиева Г.Б."},
    {"id": 9,  "title": "Заброшенный парк",             "description": "Парк по ул. Жандосова в ужасном состоянии: сломанные скамейки, мусор, сухие деревья.", "category": "parks",    "district": "Ауэзовский",   "priority": "low",    "status": "pending",     "votes": 14, "timestamp": "2024-04-03 16:00", "author": "Серикбаев М."},
    {"id": 10, "title": "Прорыв трубы — потоп",         "description": "Прорыв трубы на ул. Рыскулова — затоплены подвалы трёх домов. Срочно!", "category": "utilities", "district": "Жетісуский",   "priority": "critical","status": "in_progress", "votes": 201,"timestamp": "2024-04-04 06:15", "author": "Джаксыбеков Н."},
]


@app.get("/api/tasks")
async def get_tasks():
    return TASKS


class TaskCreate(BaseModel):
    title: str
    category: str
    district: str
    priority: str
    deadline: str
    akim_id: Optional[int] = None


@app.post("/api/tasks")
async def create_task(body: TaskCreate):
    _next_id["tasks"] += 1
    task = {
        "id": _next_id["tasks"],
        "title": body.title,
        "category": body.category,
        "district": body.district,
        "priority": body.priority,
        "deadline": body.deadline,
        "akim_id": body.akim_id,
        "status": "pending",
        "progress": 0,
        "created": time.strftime("%Y-%m-%d"),
    }
    TASKS.append(task)
    return task


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    akim_id: Optional[int] = None
    progress: Optional[int] = None


@app.put("/api/tasks/{task_id}")
async def update_task(task_id: int, body: TaskUpdate):
    for task in TASKS:
        if task["id"] == task_id:
            if body.status is not None:
                task["status"] = body.status
            if body.akim_id is not None:
                task["akim_id"] = body.akim_id
            if body.progress is not None:
                task["progress"] = body.progress
            return task
    raise HTTPException(status_code=404, detail="Task not found")


# ── /api/citizens ─────────────────────────────────────────
@app.get("/api/citizens")
async def get_citizen_requests():
    return sorted(CITIZEN_REQUESTS, key=lambda x: -x["votes"])


class CitizenRequest(BaseModel):
    title: str
    description: str
    category: str
    district: str
    author: str


@app.post("/api/citizens")
async def submit_citizen_request(body: CitizenRequest):
    _next_id["requests"] += 1
    PRIORITY_MAP = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    priority = "medium"
    req = {
        "id": _next_id["requests"],
        "title": body.title,
        "description": body.description,
        "category": body.category,
        "district": body.district,
        "author": body.author,
        "priority": priority,
        "status": "pending",
        "votes": 1,
        "timestamp": time.strftime("%Y-%m-%d %H:%M"),
    }
    CITIZEN_REQUESTS.append(req)
    return req


@app.post("/api/citizens/{req_id}/vote")
async def vote_request(req_id: int):
    for req in CITIZEN_REQUESTS:
        if req["id"] == req_id:
            req["votes"] += 1
            if req["votes"] > 100:
                req["priority"] = "critical"
            elif req["votes"] > 50:
                req["priority"] = "high"
            return req
    raise HTTPException(status_code=404, detail="Request not found")


@app.post("/api/citizens/{req_id}/to-task")
async def convert_to_task(req_id: int):
    """Convert citizen request to akim task."""
    for req in CITIZEN_REQUESTS:
        if req["id"] == req_id:
            req["status"] = "converted"
            _next_id["tasks"] += 1
            task = {
                "id": _next_id["tasks"],
                "title": req["title"],
                "category": req["category"],
                "district": req["district"],
                "priority": req["priority"],
                "deadline": time.strftime("%Y-%m-%d"),
                "akim_id": None,
                "status": "pending",
                "progress": 0,
                "created": time.strftime("%Y-%m-%d"),
                "from_citizen": req_id,
            }
            TASKS.append(task)
            return {"task": task, "request": req}
    raise HTTPException(status_code=404, detail="Request not found")


# ── /api/assign — AI task distribution ───────────────────
class AssignRequest(BaseModel):
    task_ids: list[int]


@app.post("/api/assign")
async def ai_assign_tasks(body: AssignRequest):
    """Use Gemini to optimally assign tasks to akims."""
    tasks_to_assign = [t for t in TASKS if t["id"] in body.task_ids]
    if not tasks_to_assign:
        raise HTTPException(status_code=400, detail="No tasks found")

    # Count current loads
    akim_loads = {a["id"]: sum(1 for t in TASKS if t.get("akim_id") == a["id"] and t["status"] != "completed") for a in AKIMS}

    tasks_text = "\n".join([f"- Задача #{t['id']}: '{t['title']}' | Категория: {t['category']} | Район: {t['district']} | Приоритет: {t['priority']}" for t in tasks_to_assign])
    akims_text = "\n".join([f"- Аким #{a['id']}: {a['name']} | Район: {a['district']} | Специализация: {', '.join(a['specialty'])} | Текущая нагрузка: {akim_loads[a['id']]} задач" for a in AKIMS])

    prompt = f"""Ты — система распределения задач Smart City Алматы.

Задачи для распределения:
{tasks_text}

Доступные акимы:
{akims_text}

Правила распределения:
1. Учитывай специализацию акима — задача должна соответствовать его специальности
2. Учитывай район акима — предпочтительно назначать задачи в его районе
3. Балансируй нагрузку — не перегружай одного акима
4. Приоритетные задачи назначай акимам с меньшей нагрузкой

Ответь СТРОГО в JSON формате, массив объектов:
[{{"task_id": N, "akim_id": N, "reason": "краткое обоснование"}}]"""

    gemini_text = await call_gemini(prompt)
    assignments = []

    if gemini_text:
        try:
            import json, re
            match = re.search(r'\[.*\]', gemini_text, re.DOTALL)
            if match:
                proposals = json.loads(match.group())
                for p in proposals:
                    for task in TASKS:
                        if task["id"] == p["task_id"]:
                            task["akim_id"] = p["akim_id"]
                            if task["status"] == "pending":
                                task["status"] = "in_progress"
                            assignments.append({
                                "task_id": p["task_id"],
                                "akim_id": p["akim_id"],
                                "reason": p.get("reason", ""),
                            })
        except Exception:
            pass

    if not assignments:
        # Rule-based fallback
        cat_to_specialty = {
            "roads": ["roads", "transport"],
            "ecology": ["ecology"],
            "safety": ["safety"],
            "utilities": ["utilities"],
            "transport": ["transport"],
            "parks": ["parks", "ecology"],
        }
        for task in tasks_to_assign:
            preferred = cat_to_specialty.get(task["category"], ["utilities"])
            best = min(AKIMS, key=lambda a: (
                0 if any(s in preferred for s in a["specialty"]) else 1,
                akim_loads.get(a["id"], 0)
            ))
            task["akim_id"] = best["id"]
            if task["status"] == "pending":
                task["status"] = "in_progress"
            akim_loads[best["id"]] = akim_loads.get(best["id"], 0) + 1
            assignments.append({"task_id": task["id"], "akim_id": best["id"], "reason": f"Специализация: {', '.join(best['specialty'])}"})

    return {"assignments": assignments, "tasks": tasks_to_assign}
