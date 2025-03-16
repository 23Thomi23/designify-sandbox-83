
import { Header } from '@/components/videopropiedad/Header';
import { WelcomeSection } from '@/components/videopropiedad/WelcomeSection';
import { ProjectsSection } from '@/components/videopropiedad/ProjectsSection';
import { AboutUsSection } from '@/components/videopropiedad/AboutUsSection';
import { ProcessSection } from '@/components/videopropiedad/ProcessSection';
import { BeforeAfterSection } from '@/components/videopropiedad/BeforeAfterSection';
import { StatsSection } from '@/components/videopropiedad/StatsSection';
import { ContactSection } from '@/components/videopropiedad/ContactSection';
import { Footer } from '@/components/videopropiedad/Footer';

export const VideoPropiedad = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto">
        <Header />
        <WelcomeSection />
        <ProjectsSection />
        <BeforeAfterSection />
        <AboutUsSection />
        <ProcessSection />
        <StatsSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
};

export default VideoPropiedad;
