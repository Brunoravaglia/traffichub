import { Route, Routes } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import HomePage from "@/pages/HomePage";

const PricingPage = lazyWithRetry(() => import("@/pages/public/PricingPage"));
const FeaturesPage = lazyWithRetry(() => import("@/pages/public/FeaturesPage"));
const SupportPage = lazyWithRetry(() => import("@/pages/public/SupportPage"));
const FAQPage = lazyWithRetry(() => import("@/pages/public/FAQPage"));
const TermsPage = lazyWithRetry(() => import("@/pages/public/TermsPage"));
const PrivacyPage = lazyWithRetry(() => import("@/pages/public/PrivacyPage"));
const BlogPage = lazyWithRetry(() => import("@/pages/public/BlogPage"));
const BlogPostPage = lazyWithRetry(() => import("@/pages/public/BlogPostPage"));
const AboutPage = lazyWithRetry(() => import("@/pages/public/AboutPage"));
const LGPDPage = lazyWithRetry(() => import("@/pages/public/LGPDPage"));
const AffiliatePage = lazyWithRetry(() => import("@/pages/public/AffiliatePage"));
const UtilitiesPage = lazyWithRetry(() => import("@/pages/public/UtilitiesPage"));
const ROASCalcPage = lazyWithRetry(() => import("@/pages/calculators/ROASCalcPage"));
const ROICalcPage = lazyWithRetry(() => import("@/pages/calculators/ROICalcPage"));
const CPMCalcPage = lazyWithRetry(() => import("@/pages/calculators/CPMCalcPage"));
const CPACalcPage = lazyWithRetry(() => import("@/pages/calculators/CPACalcPage"));
const CPCCalcPage = lazyWithRetry(() => import("@/pages/calculators/CPCCalcPage"));
const CTRCalcPage = lazyWithRetry(() => import("@/pages/calculators/CTRCalcPage"));
const CPLCalcPage = lazyWithRetry(() => import("@/pages/calculators/CPLCalcPage"));
const LTVCalcPage = lazyWithRetry(() => import("@/pages/calculators/LTVCalcPage"));
const CACCalcPage = lazyWithRetry(() => import("@/pages/calculators/CACCalcPage"));
const MarkupCalcPage = lazyWithRetry(() => import("@/pages/calculators/MarkupCalcPage"));
const SimuladorMetaPage = lazyWithRetry(() => import("@/pages/calculators/SimuladorMetaPage"));
const SimuladorFunilPage = lazyWithRetry(() => import("@/pages/calculators/SimuladorFunilPage"));
const GeradorUTMPage = lazyWithRetry(() => import("@/pages/calculators/GeradorUTMPage"));
const GeradorHeadlinesPage = lazyWithRetry(() => import("@/pages/calculators/GeradorHeadlinesPage"));
const DiagnosticoMarketingPage = lazyWithRetry(() => import("@/pages/calculators/DiagnosticoMarketingPage"));
const ScoreDigitalPage = lazyWithRetry(() => import("@/pages/calculators/ScoreDigitalPage"));
const ChangelogPage = lazyWithRetry(() => import("@/pages/public/ChangelogPage"));
const ValidarRelatorio = lazyWithRetry(() => import("@/pages/public/ValidarRelatorio"));
const NotFound = lazyWithRetry(() => import("@/pages/NotFound"));

const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/support" element={<SupportPage />} />
    <Route path="/faq" element={<FAQPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/blog/:slug" element={<BlogPostPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/lgpd" element={<LGPDPage />} />
    <Route path="/afiliados" element={<AffiliatePage />} />
    <Route path="/utilidades" element={<UtilitiesPage />} />
    <Route path="/utilidades/roas" element={<ROASCalcPage />} />
    <Route path="/utilidades/roi" element={<ROICalcPage />} />
    <Route path="/utilidades/cpm" element={<CPMCalcPage />} />
    <Route path="/utilidades/cpa" element={<CPACalcPage />} />
    <Route path="/utilidades/cpc" element={<CPCCalcPage />} />
    <Route path="/utilidades/ctr" element={<CTRCalcPage />} />
    <Route path="/utilidades/cpl" element={<CPLCalcPage />} />
    <Route path="/utilidades/ltv" element={<LTVCalcPage />} />
    <Route path="/utilidades/cac" element={<CACCalcPage />} />
    <Route path="/utilidades/markup" element={<MarkupCalcPage />} />
    <Route path="/utilidades/simulador-meta" element={<SimuladorMetaPage />} />
    <Route path="/utilidades/simulador-funil" element={<SimuladorFunilPage />} />
    <Route path="/utilidades/gerador-utm" element={<GeradorUTMPage />} />
    <Route path="/utilidades/gerador-headlines" element={<GeradorHeadlinesPage />} />
    <Route path="/utilidades/diagnostico-marketing" element={<DiagnosticoMarketingPage />} />
    <Route path="/utilidades/score-digital" element={<ScoreDigitalPage />} />
    <Route path="/changelog" element={<ChangelogPage />} />
    <Route path="/validar-relatorio" element={<ValidarRelatorio />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default PublicRoutes;
