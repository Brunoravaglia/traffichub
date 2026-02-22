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
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Vurp",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
            "Plataforma para gestores de tráfego pago importarem dados do Google Ads e Meta Ads, transformarem em dashboard personalizado e exportarem relatórios profissionais em PDF e link.",
        featureList: [
            "Importação de dados Google Ads",
            "Importação de dados Meta Ads",
            "Transformação automática de dashboard",
            "Relatórios profissionais em PDF e link",
            "Resumo com IA para envio ao cliente",
            "Checklist por cliente",
            "Calendário e produtividade",
            "Gestão multi-gestor",
        ],
    };

    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <SEOHead
                title="Vurp - Plataforma para Gestores de Tráfego Pago"
                description="Importe Google Ads e Meta Ads, transforme em dashboard profissional e envie relatórios prontos em PDF e link. Plataforma completa para gestores de tráfego pago."
                keywords="google ads dashboard, meta ads dashboard, relatório tráfego pago, dashboard para agência, gestor de tráfego, relatório pdf marketing, automação de relatório, vurp"
                path="/"
                jsonLd={homeJsonLd}
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
