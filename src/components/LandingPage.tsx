
import { LandingHeader } from './landing/Header';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { WhyChooseSection } from './landing/WhyChooseSection';
import { SaveTimeSection } from './landing/SaveTimeSection';
import { CallToAction } from './landing/CallToAction';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-6 px-4">
        <LandingHeader />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <SaveTimeSection />
        <CallToAction />
      </div>
    </div>
  );
};
