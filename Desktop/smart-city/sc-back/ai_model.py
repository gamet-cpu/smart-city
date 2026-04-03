import random

def analyze_city_data(aqi, traffic_level):

    if aqi > 150:
        status = "Critical"
        recommendation = "Зафиксирован опасный уровень смога. Рекомендуется ограничить движение дизельного транспорта в Алмалинском районе."
        criticality = "Высокая"
    elif traffic_level > 8:
        status = "Warning"
        recommendation = "Пробки 9 баллов. Рекомендуется увеличить частоту движения автобусов по линии BRT."
        criticality = "Средняя"
    else:
        status = "Normal"
        recommendation = "Показатели в норме. Вмешательство не требуется."
        criticality = "Низкая"
        
    return {
        "status": status,
        "criticality": criticality,
        "recommendation": recommendation,
        "what_happening": f"AQI: {aqi}, Пробки: {traffic_level} баллов"
    }