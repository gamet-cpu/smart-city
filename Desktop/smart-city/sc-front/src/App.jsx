import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { translations } from './i18n/translations';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import TransportPage from './pages/TransportPage';
import EcologyPage from './pages/EcologyPage';
import SafetyPage from './pages/SafetyPage';
import UtilitiesPage from './pages/UtilitiesPage';

export default function App() {
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchAiData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze');
      if (response.ok) {
        const data = await response.json();
        setAiData(data);
      }
    } catch (err) {
      console.warn("Python backend offline");
    }
  };

  useEffect(() => {
    fetchAiData();
    const interval = setInterval(fetchAiData, 10000);
    return () => clearInterval(interval);
  }, []);

  const t = translations[lang];
  if (!t) return null;

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Overview t={t} aiData={aiData} />} />
            <Route path="/transport" element={<TransportPage t={t} />} />
            <Route path="/ecology" element={<EcologyPage t={t} />} />
            <Route path="/safety" element={<SafetyPage t={t} />} />
            <Route path="/utilities" element={<UtilitiesPage t={t} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}