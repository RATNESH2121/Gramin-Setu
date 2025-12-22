import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import PartnersSection from '@/components/PartnersSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import ServicesSection from '@/components/ServicesSection';
import ImpactSection from '@/components/ImpactSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
const Index = () => {
    return (<div className="min-h-screen">
        <div className="dark">
            <Navbar />
        </div>
        <main>
            <div className="dark">
                <HeroSection />
            </div>
            <PartnersSection />
            <HowItWorksSection />
            <ServicesSection />
            <ImpactSection />
            <TestimonialsSection />
            <div className="dark">
                <CTASection />
            </div>
        </main>
        <div className="dark">
            <Footer />
        </div>
    </div>);
};
export default Index;
