export const kpiData = {
  transport: { value: 72, status: "warning" },
  ecology:   { value: 58, status: "critical" },
  safety:    { value: 91, status: "normal" },
  utilities: { value: 84, status: "normal" },
  overall:   76,
};

export const trendData = [
  { time: "00:00", transport: 3, ecology: 1, safety: 0, utilities: 1 },
  { time: "02:00", transport: 2, ecology: 1, safety: 1, utilities: 2 },
  { time: "04:00", transport: 1, ecology: 2, safety: 0, utilities: 1 },
  { time: "06:00", transport: 4, ecology: 2, safety: 1, utilities: 2 },
  { time: "08:00", transport: 7, ecology: 3, safety: 2, utilities: 3 },
  { time: "10:00", transport: 6, ecology: 3, safety: 1, utilities: 2 },
  { time: "12:00", transport: 8, ecology: 4, safety: 2, utilities: 3 },
  { time: "14:00", transport: 5, ecology: 2, safety: 1, utilities: 3 },
  { time: "16:00", transport: 9, ecology: 3, safety: 2, utilities: 4 },
  { time: "18:00", transport: 11, ecology: 3, safety: 3, utilities: 3 },
  { time: "20:00", transport: 7, ecology: 2, safety: 2, utilities: 2 },
  { time: "22:00", transport: 5, ecology: 2, safety: 1, utilities: 1 },
];

export const trafficData = [
  { time: "00", cars: 1200 }, { time: "02", cars: 800 },
  { time: "04", cars: 600 },  { time: "06", cars: 2100 },
  { time: "08", cars: 8400 }, { time: "10", cars: 6200 },
  { time: "12", cars: 7100 }, { time: "14", cars: 5800 },
  { time: "16", cars: 9200 }, { time: "18", cars: 11400 },
  { time: "20", cars: 7600 }, { time: "22", cars: 4100 },
];

export const aqiTrendData = [
  { time: "00", aqi: 55 }, { time: "04", aqi: 48 },
  { time: "08", aqi: 72 }, { time: "10", aqi: 95 },
  { time: "12", aqi: 112 },{ time: "14", aqi: 128 },
  { time: "16", aqi: 143 },{ time: "18", aqi: 121 },
  { time: "20", aqi: 98 }, { time: "22", aqi: 87 },
];

export const budgetData = [
  { name: "Transport", value: 34, color: "#3B82F6", amount: "2.4B" },
  { name: "Ecology",   value: 18, color: "#10B981", amount: "1.3B" },
  { name: "Safety",    value: 27, color: "#F59E0B", amount: "1.9B" },
  { name: "Utilities", value: 21, color: "#8B5CF6", amount: "1.5B" },
];
