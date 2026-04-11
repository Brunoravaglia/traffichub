import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ShowcaseSection from "@/components/home/ShowcaseSection";
import PricingSection from "@/components/home/PricingSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import FooterSection from "@/components/home/FooterSection";
import SEOHead from "@/components/SEOHead";

const BELOW_THE_FOLD_STYLE = {
    contentVisibility: "auto" as const,
    containIntrinsicSize: "900px",
};

const HomePage = () => {
    const homeJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Vurp",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
            "Plataforma para gestores de tráfego pago organizarem Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads e Shopee Ads, transformarem em dashboard personalizado e exportarem relatórios profissionais em PDF e link.",
        featureList: [
            "Importação de dados Google Ads",
            "Importação de dados Meta Ads",
            "Importação de dados TikTok Ads",
            "Importação de dados LinkedIn Ads",
            "Importação de dados Shopee Ads",
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
                description="Organize Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads e Shopee Ads, transforme em dashboard profissional e envie relatórios prontos em PDF e link. Plataforma completa para gestores de tráfego pago."
                keywords="google ads dashboard, meta ads dashboard, tiktok ads dashboard, linkedin ads dashboard, shopee ads dashboard, relatório tráfego pago, dashboard para agência, gestor de tráfego, relatório pdf marketing, automação de relatório, vurp"
                path="/"
                jsonLd={homeJsonLd}
            />
            <HomeNavbar />
            <HeroSection />
            <div style={BELOW_THE_FOLD_STYLE}>
                <FeaturesSection />
            </div>
            <div style={BELOW_THE_FOLD_STYLE}>
                <ShowcaseSection />
            </div>
            <div style={BELOW_THE_FOLD_STYLE}>
                <PricingSection />
            </div>
            <div style={BELOW_THE_FOLD_STYLE}>
                <TestimonialsSection />
            </div>
            <div style={BELOW_THE_FOLD_STYLE}>
                <FAQSection />
            </div>
            <div style={BELOW_THE_FOLD_STYLE}>
                <FooterSection />
            </div>
        </main>
    );
};

export default HomePage;
