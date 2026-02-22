import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GestorProvider } from "./contexts/GestorContext";
import AppLayout from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";

// Public pages
const HomePage = lazy(() => import("./pages/HomePage"));
const PricingPage = lazy(() => import("./pages/public/PricingPage"));
const FeaturesPage = lazy(() => import("./pages/public/FeaturesPage"));
const SupportPage = lazy(() => import("./pages/public/SupportPage"));
const FAQPage = lazy(() => import("./pages/public/FAQPage"));
const TermsPage = lazy(() => import("./pages/public/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/public/PrivacyPage"));
const BlogPage = lazy(() => import("./pages/public/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/public/BlogPostPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const LGPDPage = lazy(() => import("./pages/public/LGPDPage"));
const AffiliatePage = lazy(() => import("./pages/public/AffiliatePage"));
const UtilitiesPage = lazy(() => import("./pages/public/UtilitiesPage"));
const ROASCalcPage = lazy(() => import("./pages/calculators/ROASCalcPage"));
const ROICalcPage = lazy(() => import("./pages/calculators/ROICalcPage"));
const CPMCalcPage = lazy(() => import("./pages/calculators/CPMCalcPage"));
const CPACalcPage = lazy(() => import("./pages/calculators/CPACalcPage"));
const CPCCalcPage = lazy(() => import("./pages/calculators/CPCCalcPage"));
const CTRCalcPage = lazy(() => import("./pages/calculators/CTRCalcPage"));
const CPLCalcPage = lazy(() => import("./pages/calculators/CPLCalcPage"));
const LTVCalcPage = lazy(() => import("./pages/calculators/LTVCalcPage"));
const CACCalcPage = lazy(() => import("./pages/calculators/CACCalcPage"));
const MarkupCalcPage = lazy(() => import("./pages/calculators/MarkupCalcPage"));
const SimuladorMetaPage = lazy(() => import("./pages/calculators/SimuladorMetaPage"));
const SimuladorFunilPage = lazy(() => import("./pages/calculators/SimuladorFunilPage"));
const GeradorUTMPage = lazy(() => import("./pages/calculators/GeradorUTMPage"));
const GeradorHeadlinesPage = lazy(() => import("./pages/calculators/GeradorHeadlinesPage"));
const DiagnosticoMarketingPage = lazy(() => import("./pages/calculators/DiagnosticoMarketingPage"));
const ScoreDigitalPage = lazy(() => import("./pages/calculators/ScoreDigitalPage"));
const ChangelogPage = lazy(() => import("./pages/public/ChangelogPage"));
const ValidarRelatorio = lazy(() => import("./pages/public/ValidarRelatorio"));
import { ThemeProvider } from "./components/ThemeProvider";

// Auth pages
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// Account pages
const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const BillingPage = lazy(() => import("./pages/account/BillingPage"));
const PlanSelectionPage = lazy(() => import("./pages/account/PlanSelectionPage"));

// App pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NovoCliente = lazy(() => import("./pages/NovoCliente"));
const NovoGestor = lazy(() => import("./pages/NovoGestor"));
const Clientes = lazy(() => import("./pages/Clientes"));
const ClienteChecklist = lazy(() => import("./pages/ClienteChecklist"));
const DashboardGerencial = lazy(() => import("./pages/DashboardGerencial"));
const Historico = lazy(() => import("./pages/Historico"));
const TodosRelatorios = lazy(() => import("./pages/TodosRelatorios"));
const Relatorio = lazy(() => import("./pages/Relatorio"));
const NovoRelatorio = lazy(() => import("./pages/NovoRelatorio"));
const Gestores = lazy(() => import("./pages/Gestores"));
const GestorSettings = lazy(() => import("./pages/GestorSettings"));
const Controle = lazy(() => import("./pages/Controle"));
const RelatorioCliente = lazy(() => import("./pages/RelatorioCliente"));
const SelecionarCliente = lazy(() => import("./pages/SelecionarCliente"));
const Modelos = lazy(() => import("./pages/Modelos"));
const Conquistas = lazy(() => import("./pages/Conquistas"));
const Produtividade = lazy(() => import("./pages/Produtividade"));
const PrevisaoSaldo = lazy(() => import("./pages/PrevisaoSaldo"));
const Calendario = lazy(() => import("./pages/Calendario"));
const AgencySettings = lazy(() => import("./pages/AgencySettings"));
const InternalUtilities = lazy(() => import("./pages/InternalUtilities"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <GestorProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center gap-4"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>}>
              <Routes>
                {/* Public pages */}
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

                {/* Auth pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Account pages (protected, wrapped in AppLayout internally) */}
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/billing" element={<BillingPage />} />
                <Route path="/account/plan" element={<PlanSelectionPage />} />

                {/* Protected routes with layout */}
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/novo-cliente" element={<AppLayout><NovoCliente /></AppLayout>} />
                <Route path="/novo-gestor" element={<AppLayout><NovoGestor /></AppLayout>} />
                <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
                <Route path="/cliente/:id" element={<AppLayout><ClienteChecklist /></AppLayout>} />
                <Route path="/cliente/:id/historico" element={<AppLayout><Historico /></AppLayout>} />
                <Route path="/historico" element={<AppLayout><TodosRelatorios /></AppLayout>} />
                <Route path="/cliente/:id/relatorio/:data" element={<AppLayout><Relatorio /></AppLayout>} />
                <Route path="/cliente/:id/novo-relatorio" element={<AppLayout><NovoRelatorio /></AppLayout>} />
                <Route path="/cliente/:id/enviar-relatorio" element={<AppLayout><RelatorioCliente /></AppLayout>} />
                <Route path="/gestores" element={<AppLayout><Gestores /></AppLayout>} />
                <Route path="/configuracoes" element={<AppLayout><GestorSettings /></AppLayout>} />
                <Route path="/gerencial" element={<AppLayout><DashboardGerencial /></AppLayout>} />
                <Route path="/controle" element={<AppLayout><Controle /></AppLayout>} />
                <Route path="/relatorio-cliente" element={<AppLayout><SelecionarCliente /></AppLayout>} />
                <Route path="/modelos" element={<AppLayout><Modelos /></AppLayout>} />
                <Route path="/conquistas" element={<AppLayout><Conquistas /></AppLayout>} />
                <Route path="/produtividade" element={<AppLayout><Produtividade /></AppLayout>} />
                <Route path="/previsao-saldo" element={<AppLayout><PrevisaoSaldo /></AppLayout>} />
                <Route path="/calendario" element={<AppLayout><Calendario /></AppLayout>} />
                <Route path="/agencia/configuracoes" element={<AppLayout><AgencySettings /></AppLayout>} />
                <Route path="/ferramentas" element={<AppLayout><InternalUtilities /></AppLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </GestorProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
