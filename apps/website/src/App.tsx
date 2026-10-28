import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Features } from "./pages/Features";
import { Privacy } from "./pages/Privacy";
import { Security } from "./pages/Security";
import { Download } from "./pages/Download";
import { Support } from "./pages/Support";
import { Releases } from "./pages/Releases";
import { Faq } from "./pages/Faq";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" style={{ minHeight: "60vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/security" element={<Security />} />
          <Route path="/download" element={<Download />} />
          <Route path="/support" element={<Support />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
