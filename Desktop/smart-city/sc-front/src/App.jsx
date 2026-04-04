import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { translations } from './i18n/translations';
import Navbar from './components/Navbar';
import AiChat from './components/AiChat';
import Overview from './pages/Overview';
import TransportPage from './pages/TransportPage';
import EcologyPage from './pages/EcologyPage';
import SafetyPage from './pages/SafetyPage';
import UtilitiesPage from './pages/UtilitiesPage';
import AkimatPage from './pages/AkimatPage';

export default function App() {
  const [lang, setLang] = useState('ru');
  const [theme, setTheme] = useState('light');
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchAiData = useCallback(() => {
    fetch('http://127.0.0.1:8001/api/analyze')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setAiData(data); })
      .catch(() => console.warn("Python backend offline"));
  }, []);

  useEffect(() => {
    fetchAiData();
    const interval = setInterval(fetchAiData, 10000);
    return () => clearInterval(interval);
  }, [fetchAiData]);

  const t = translations[lang];
  if (!t) return null;

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Overview t={t} aiData={aiData} theme={theme} />} />
            <Route path="/transport" element={<TransportPage t={t} />} />
            <Route path="/ecology" element={<EcologyPage t={t} />} />
            <Route path="/safety" element={<SafetyPage t={t} />} />
            <Route path="/utilities" element={<UtilitiesPage t={t} />} />
            <Route path="/akimat"    element={<AkimatPage t={t} />} />
          </Routes>
        </div>
        <AiChat />
      </div>
    </BrowserRouter>
  );
}