import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './i18n/context';
import { translations } from './i18n/translations';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Academy from './pages/Academy';
import Formulas from './pages/Formulas';
import MathEditor from './pages/MathEditor';
import Calculator from './pages/Calculator';
import Visualization from './pages/Visualization';
import PhysicsLab from './pages/PhysicsLab';
import CryptoLab from './pages/CryptoLab';
import QuantumLab from './pages/QuantumLab';
import AIAssistant from './pages/AIAssistant';
import Research from './pages/Research';
import Challenges from './pages/Challenges';
import Foundations from './pages/Foundations';
import './styles/index.css';

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider translations={translations}>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/formulas" element={<Formulas />} />
              <Route path="/editor" element={<MathEditor />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/graphs" element={<Visualization />} />
              <Route path="/physics" element={<PhysicsLab />} />
              <Route path="/crypto" element={<CryptoLab />} />
              <Route path="/quantum" element={<QuantumLab />} />
              <Route path="/ai" element={<AIAssistant />} />
              <Route path="/research" element={<Research />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/foundations" element={<Foundations />} />
            </Routes>
          </main>
        </div>
      </I18nProvider>
    </BrowserRouter>
  );
}
