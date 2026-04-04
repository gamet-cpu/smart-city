import { useEffect, useRef, useState } from 'react';

const YANDEX_KEY = '64810918-17f8-4a1b-a90e-8f82a01d1914';

const LAYERS = [
  { id: 'traffic', label: '🚗 Пробки',    color: '#3B82F6' },
  { id: 'ecology', label: '🌿 Экология',  color: '#10B981' },
  { id: 'safety',  label: '🛡️ Безопасность', color: '#F59E0B' },
  { id: 'utility', label: '⚡ ЖКХ',       color: '#8B5CF6' },
];

const MARKERS = {
  traffic: [
    { lat: 43.262, lng: 76.945, label: 'ДТП · пр. Сарыарқа', color: '#EF4444', r: 300, icon: '🚗' },
    { lat: 43.255, lng: 76.920, label: 'Пробка · пр. Абая 91%', color: '#F59E0B', r: 400, icon: '⚠' },
    { lat: 43.240, lng: 76.900, label: 'Работы · пр. Достык', color: '#3B82F6', r: 200, icon: '🔧' },
    { lat: 43.248, lng: 76.960, label: 'Сарыарка 91% нагрузка', color: '#EF4444', r: 500, icon: '🚦' },
    { lat: 43.232, lng: 76.870, label: 'Поломка автобуса, маршрут 40', color: '#F59E0B', r: 150, icon: '🚌' },
  ],
  ecology: [
    { lat: 43.238, lng: 76.889, label: 'PM2.5 критично · Район 3 AQI 187', color: '#EF4444', r: 700, icon: '☁' },
    { lat: 43.250, lng: 76.940, label: 'AQI 87 · Алмалинский', color: '#F59E0B', r: 500, icon: '🌫' },
    { lat: 43.260, lng: 76.970, label: 'AQI 58 · Бостандык норма', color: '#10B981', r: 400, icon: '🌿' },
    { lat: 43.220, lng: 76.920, label: 'CO₂ повышен · Промзона', color: '#F59E0B', r: 600, icon: '🏭' },
    { lat: 43.245, lng: 76.855, label: 'AQI 35 · Наурызбай норма', color: '#10B981', r: 300, icon: '✅' },
  ],
  safety: [
    { lat: 43.262, lng: 76.945, label: 'ДТП · Сарыарка', color: '#EF4444', r: 200, icon: '🚨' },
    { lat: 43.250, lng: 76.890, label: 'Несанкц. доступ · Промзона', color: '#F59E0B', r: 150, icon: '⚠' },
    { lat: 43.235, lng: 76.910, label: 'Патруль · Алмалы', color: '#3B82F6', r: 300, icon: '👮' },
    { lat: 43.270, lng: 76.960, label: 'Камера 12 offline', color: '#F59E0B', r: 100, icon: '📷' },
    { lat: 43.225, lng: 76.935, label: 'Вандализм · Парк сектор 2', color: '#EF4444', r: 120, icon: '🔴' },
  ],
  utility: [
    { lat: 43.250, lng: 76.970, label: 'Работы · Водопровод №4', color: '#10B981', r: 200, icon: '💧' },
    { lat: 43.238, lng: 76.910, label: 'Подстанция 12 — обновление', color: '#F59E0B', r: 150, icon: '⚡' },
    { lat: 43.228, lng: 76.880, label: 'Газ 91% · Блок 7 работы', color: '#8B5CF6', r: 180, icon: '🔥' },
    { lat: 43.265, lng: 76.930, label: 'Отопление 88% · Алатауский', color: '#06B6D4', r: 250, icon: '🌡️' },
    { lat: 43.242, lng: 76.955, label: 'Интернет 99% · Бостандык', color: '#10B981', r: 100, icon: '📡' },
  ],
};

let ymapsLoaded = false;
let ymapsLoadPromise = null;

function loadYandexMaps() {
  if (ymapsLoaded) return Promise.resolve(window.ymaps);
  if (ymapsLoadPromise) return ymapsLoadPromise;

  ymapsLoadPromise = new Promise((resolve, reject) => {
    if (document.getElementById('ymaps-script')) {
      ymapsLoaded = true;
      resolve(window.ymaps);
      return;
    }
    const script = document.createElement('script');
    script.id = 'ymaps-script';
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${YANDEX_KEY}`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => {
        ymapsLoaded = true;
        resolve(window.ymaps);
      });
    };
    script.onerror = () => reject(new Error('Yandex Maps failed to load'));
    document.head.appendChild(script);
  });

  return ymapsLoadPromise;
}

export default function MapCard({ isDark }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const trafficRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('traffic');
  const [mapReady, setMapReady] = useState(false);

  // Init map once
  useEffect(() => {
    let destroyed = false;
    loadYandexMaps().then((ymaps) => {
      if (destroyed || !containerRef.current || mapRef.current) return;

      const map = new ymaps.Map(containerRef.current, {
        center: [43.248, 76.920],
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl'],
      });
      mapRef.current = map;

      // Traffic layer ON by default
      const trafficControl = new ymaps.control.TrafficControl({ state: { trafficShown: true } });
      map.controls.add(trafficControl);
      trafficRef.current = trafficControl;

      setMapReady(true);
    }).catch(() => {
      setMapReady(false);
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  // Switch layer — re-draw markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const ymaps = window.ymaps;
    const map = mapRef.current;

    // Remove old geoObjects except traffic layer
    map.geoObjects.removeAll();

    // Toggle traffic layer
    if (trafficRef.current) {
      if (activeLayer === 'traffic') {
        trafficRef.current.showTraffic();
      } else {
        trafficRef.current.hideTraffic();
      }
    }

    const markers = MARKERS[activeLayer] || [];
    markers.forEach((m) => {
      // Circle zone
      const circle = new ymaps.Circle(
        [[m.lat, m.lng], m.r],
        { hintContent: m.label, balloonContent: `<b>${m.icon} ${m.label}</b>` },
        { fillColor: m.color + '33', strokeColor: m.color, strokeWidth: 2, fillOpacity: 0.35 }
      );
      map.geoObjects.add(circle);

      // Placemark
      const placemark = new ymaps.Placemark(
        [m.lat, m.lng],
        { balloonContent: `<b>${m.icon} ${m.label}</b>`, hintContent: m.label },
        {
          preset: 'islands#circleIcon',
          iconColor: m.color,
        }
      );
      map.geoObjects.add(placemark);
    });
  }, [activeLayer, mapReady]);

  // Dark/light tile switch
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    // Yandex Maps doesn't easily support dark tiles — skip, use overlay
  }, [isDark, mapReady]);

  const layerInfo = {
    traffic: { title: 'Трафик Алматы', desc: 'Яндекс.Карты · Пробки в реальном времени' },
    ecology: { title: 'Карта экологии', desc: 'Зоны загрязнения воздуха · AQI по районам' },
    safety:  { title: 'Карта безопасности', desc: 'Инциденты, патрули, камеры наблюдения' },
    utility: { title: 'Карта ЖКХ', desc: 'Инфраструктура, работы, подстанции' },
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Layer tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: '8px 10px',
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        borderRadius: 'var(--radius) var(--radius) 0 0',
        flexWrap: 'wrap', flexShrink: 0,
      }}>
        {LAYERS.map(l => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            style={{
              padding: '5px 12px', borderRadius: 20, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: activeLayer === l.id ? l.color : 'var(--bg)',
              color: activeLayer === l.id ? '#fff' : 'var(--text-2)',
              transition: 'all .18s',
              boxShadow: activeLayer === l.id ? `0 2px 8px ${l.color}55` : 'none',
            }}
          >
            {l.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', alignSelf: 'center', paddingRight: 4 }}>
          {layerInfo[activeLayer]?.desc}
        </div>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        style={{ flex: 1, minHeight: 200, borderRadius: '0 0 var(--radius) var(--radius)' }}
      />

      {!mapReady && (
        <div style={{
          position: 'absolute', inset: 0, top: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0f1e 0%, #1a0f3e 100%)',
          borderRadius: '0 0 var(--radius) var(--radius)',
        }}>
          <div style={{ textAlign: 'center', color: '#6366f1' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Загрузка Яндекс.Карты...</div>
            <div style={{ fontSize: 11, color: '#5B578A', marginTop: 4 }}>Алматы, Казахстан</div>
          </div>
        </div>
      )}
    </div>
  );
}
