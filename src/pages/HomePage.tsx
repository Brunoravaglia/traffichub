import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ShowcaseSection from "@/components/home/ShowcaseSection";
import PricingSection from "@/components/home/PricingSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import FooterSection from "@/components/home/FooterSection";
import SEOHead from "@/components/SEOHead";
import ParallaxTextScroll from "@/components/home/ParallaxText";

const HomePage = () => {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <SEOHead
                title="Vurp - Plataforma para Gestores de Tráfego Pago"
                description="Gerencie clientes, checklists, relatórios e produtividade em um só lugar. O sistema completo para gestores de tráfego pago organizarem e escalarem seus negócios."
                path="/"
            />
            <HomeNavbar />
            <HeroSection />
            <ParallaxTextScroll />
            <FeaturesSection />
            <ShowcaseSection />
            <PricingSection />
            <TestimonialsSection />
            <FAQSection />
            <FooterSection />
        </main>
    );
};

export default HomePage;
