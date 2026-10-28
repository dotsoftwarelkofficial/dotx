import Hero from '../components/Hero';
import Philosophy from '../components/Philosophy';
import FeatureShowcase from '../components/FeatureShowcase';
import ProductDetails from '../components/ProductDetails';
import PrivacySection from '../components/PrivacySection';
import DownloadCTA from '../components/DownloadCTA';
import FAQ from '../components/FAQ';

export function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <FeatureShowcase />
      <ProductDetails />
      <PrivacySection />
      <FAQ />
      <DownloadCTA />
    </>
  );
}
