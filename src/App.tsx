import Navbar from './components/Navbar';
import Preloader from './components/Preloader';
import WalkthroughExperience from './components/WalkthroughExperience';
import FounderSection from './components/FounderSection';
import VisitSection from './components/VisitSection';
import ServicesSection from './components/ServicesSection';
import GallerySection from './components/GallerySection';
import TeamSection from './components/TeamSection';
import ReviewsSection from './components/ReviewsSection';
import BookingSection from './components/BookingSection';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import MobileCta from './components/MobileCta';
import { SoundBridge } from './components/SoundToggle';
import LegalDialog from './components/LegalDialog';

export default function App() {
  return (
    <>
      <Preloader />
      <a
        href="#hizmetler"
        className="sr-only z-[70] bg-ivory px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Tura geçmeden içeriğe atla
      </a>
      <Navbar />
      <main>
        <WalkthroughExperience />
        <FounderSection />
        <VisitSection />
        <ServicesSection />
        <TeamSection />
        <GallerySection />
        <ReviewsSection />
        <BookingSection />
      </main>
      <Footer />
      <MobileCta />
      <Cursor />
      <SoundBridge />
      <LegalDialog />
    </>
  );
}
