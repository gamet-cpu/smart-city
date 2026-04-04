# Smart Almaty Management Dashboard 🏙️

### Описание
Панель управления городом для поддержки принятия решений (Decision Support System). 
Фокус: Экология и Транспорт Алматы.

### AI Функционал
1. **Детекция аномалий:** Скрипт на Python анализирует входящие KPI и классифицирует их по уровню угрозы.
2. **Генерация рекомендаций:** Система выдает готовые управленческие решения на основе текущих данных.

### Технологии
- **Frontend:** React (Vite) + Recharts + Lucide Icons
- **Backend:** FastAPI (Python)
- **Data Source:** Имитация датчиков на основе исторических данных Kaggle.

### Инструкция по запуску
Запуск
Терминал 1 (backend):


cd Desktop/smart-city/sc-back
pip install python-dotenv httpx fastapi uvicorn
uvicorn main:app --reload --port 8001
Терминал 2 (frontend):


cd Desktop/smart-city/sc-front
npm run dev