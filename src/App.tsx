import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GestorProvider } from "./contexts/GestorContext";
import AppLayout from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";

// Public pages
import HomePage from "./pages/HomePage";
import PricingPage from "./pages/public/PricingPage";
import FeaturesPage from "./pages/public/FeaturesPage";
import SupportPage from "./pages/public/SupportPage";
import FAQPage from "./pages/public/FAQPage";
import TermsPage from "./pages/public/TermsPage";
import PrivacyPage from "./pages/public/PrivacyPage";
import BlogPage from "./pages/public/BlogPage";
import BlogPostPage from "./pages/public/BlogPostPage";
import AboutPage from "./pages/public/AboutPage";
import LGPDPage from "./pages/public/LGPDPage";
import AffiliatePage from "./pages/public/AffiliatePage";
import UtilitiesPage from "./pages/public/UtilitiesPage";
import ROASCalcPage from "./pages/calculators/ROASCalcPage";
import ROICalcPage from "./pages/calculators/ROICalcPage";
import CPMCalcPage from "./pages/calculators/CPMCalcPage";
import CPACalcPage from "./pages/calculators/CPACalcPage";
import CPCCalcPage from "./pages/calculators/CPCCalcPage";
import CTRCalcPage from "./pages/calculators/CTRCalcPage";
import CPLCalcPage from "./pages/calculators/CPLCalcPage";
import LTVCalcPage from "./pages/calculators/LTVCalcPage";
import CACCalcPage from "./pages/calculators/CACCalcPage";
import MarkupCalcPage from "./pages/calculators/MarkupCalcPage";
import SimuladorMetaPage from "./pages/calculators/SimuladorMetaPage";
import SimuladorFunilPage from "./pages/calculators/SimuladorFunilPage";
import GeradorUTMPage from "./pages/calculators/GeradorUTMPage";
import GeradorHeadlinesPage from "./pages/calculators/GeradorHeadlinesPage";
import DiagnosticoMarketingPage from "./pages/calculators/DiagnosticoMarketingPage";
import ScoreDigitalPage from "./pages/calculators/ScoreDigitalPage";
import ChangelogPage from "./pages/public/ChangelogPage";
import ValidarRelatorio from "./pages/public/ValidarRelatorio";
import { ThemeProvider } from "./components/ThemeProvider";

// Auth pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

// Account pages
import AccountPage from "./pages/account/AccountPage";
import BillingPage from "./pages/account/BillingPage";
import PlanSelectionPage from "./pages/account/PlanSelectionPage";

// App pages
import Dashboard from "./pages/Dashboard";
import NovoCliente from "./pages/NovoCliente";
import NovoGestor from "./pages/NovoGestor";
import Clientes from "./pages/Clientes";
import ClienteChecklist from "./pages/ClienteChecklist";
import DashboardGerencial from "./pages/DashboardGerencial";
import Historico from "./pages/Historico";
import TodosRelatorios from "./pages/TodosRelatorios";
import Relatorio from "./pages/Relatorio";
import NovoRelatorio from "./pages/NovoRelatorio";
import Gestores from "./pages/Gestores";
import GestorSettings from "./pages/GestorSettings";
import Controle from "./pages/Controle";
import RelatorioCliente from "./pages/RelatorioCliente";
import SelecionarCliente from "./pages/SelecionarCliente";
import Modelos from "./pages/Modelos";
import Conquistas from "./pages/Conquistas";
import Produtividade from "./pages/Produtividade";
import PrevisaoSaldo from "./pages/PrevisaoSaldo";
import Calendario from "./pages/Calendario";
import AgencySettings from "./pages/AgencySettings";
import InternalUtilities from "./pages/InternalUtilities";
import NotFound from "./pages/NotFound";

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
          </BrowserRouter>
        </TooltipProvider>
      </GestorProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
