import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import Footer from './components/Footer';
import Announcement from './components/Announcement';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { Privacy } from './pages/Privacy';
import { Security } from './pages/Security';
import { Download } from './pages/Download';
import { Support } from './pages/Support';
import { Faq } from './pages/Faq';
import { NotFound } from './pages/NotFound';
import { About } from './pages/About';
import { Changelog } from './pages/Changelog';

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Announcement />
      <Header />
      <main id="main" style={{ minHeight: '60vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/security" element={<Security />} />
          <Route path="/download" element={<Download />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/about" element={<About />} />
          <Route path="/changelog" element={<Changelog />} />
          {/* Preserve legacy aliases — keep old links working */}
          <Route path="/releases" element={<Navigate to="/changelog" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
