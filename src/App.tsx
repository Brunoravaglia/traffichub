import { lazy, Suspense, type ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GestorProvider } from "./contexts/GestorContext";
import AppLayout from "./components/AppLayout";
import AppErrorBoundary from "./components/AppErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

const CHUNK_IMPORT_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\w-]+ failed/i,
  /ChunkLoadError/i,
  /error loading dynamically imported module/i,
  /dynamically imported module/i,
  /Unable to preload CSS/i,
];

const LAZY_RETRY_KEY = "__vurp_lazy_retry__";

const getImportErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return "";
};

const isChunkImportError = (error: unknown) => {
  const message = getImportErrorMessage(error);
  return CHUNK_IMPORT_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

const lazyWithRetry = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) =>
  lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      if (typeof window !== "undefined" && isChunkImportError(error)) {
        const key = `${LAZY_RETRY_KEY}:${window.location.pathname}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          window.location.reload();
          return new Promise(() => {}) as Promise<{ default: T }>;
        }
        sessionStorage.removeItem(key);
      }
      throw error;
    }
  });

// Public pages
const HomePage = lazyWithRetry(() => import("./pages/HomePage"));
const PricingPage = lazyWithRetry(() => import("./pages/public/PricingPage"));
const FeaturesPage = lazyWithRetry(() => import("./pages/public/FeaturesPage"));
const SupportPage = lazyWithRetry(() => import("./pages/public/SupportPage"));
const FAQPage = lazyWithRetry(() => import("./pages/public/FAQPage"));
const TermsPage = lazyWithRetry(() => import("./pages/public/TermsPage"));
const PrivacyPage = lazyWithRetry(() => import("./pages/public/PrivacyPage"));
const BlogPage = lazyWithRetry(() => import("./pages/public/BlogPage"));
const BlogPostPage = lazyWithRetry(() => import("./pages/public/BlogPostPage"));
const AboutPage = lazyWithRetry(() => import("./pages/public/AboutPage"));
const LGPDPage = lazyWithRetry(() => import("./pages/public/LGPDPage"));
const AffiliatePage = lazyWithRetry(() => import("./pages/public/AffiliatePage"));
const UtilitiesPage = lazyWithRetry(() => import("./pages/public/UtilitiesPage"));
const ROASCalcPage = lazyWithRetry(() => import("./pages/calculators/ROASCalcPage"));
const ROICalcPage = lazyWithRetry(() => import("./pages/calculators/ROICalcPage"));
const CPMCalcPage = lazyWithRetry(() => import("./pages/calculators/CPMCalcPage"));
const CPACalcPage = lazyWithRetry(() => import("./pages/calculators/CPACalcPage"));
const CPCCalcPage = lazyWithRetry(() => import("./pages/calculators/CPCCalcPage"));
const CTRCalcPage = lazyWithRetry(() => import("./pages/calculators/CTRCalcPage"));
const CPLCalcPage = lazyWithRetry(() => import("./pages/calculators/CPLCalcPage"));
const LTVCalcPage = lazyWithRetry(() => import("./pages/calculators/LTVCalcPage"));
const CACCalcPage = lazyWithRetry(() => import("./pages/calculators/CACCalcPage"));
const MarkupCalcPage = lazyWithRetry(() => import("./pages/calculators/MarkupCalcPage"));
const SimuladorMetaPage = lazyWithRetry(() => import("./pages/calculators/SimuladorMetaPage"));
const SimuladorFunilPage = lazyWithRetry(() => import("./pages/calculators/SimuladorFunilPage"));
const GeradorUTMPage = lazyWithRetry(() => import("./pages/calculators/GeradorUTMPage"));
const GeradorHeadlinesPage = lazyWithRetry(() => import("./pages/calculators/GeradorHeadlinesPage"));
const DiagnosticoMarketingPage = lazyWithRetry(() => import("./pages/calculators/DiagnosticoMarketingPage"));
const ScoreDigitalPage = lazyWithRetry(() => import("./pages/calculators/ScoreDigitalPage"));
const ChangelogPage = lazyWithRetry(() => import("./pages/public/ChangelogPage"));
const ValidarRelatorio = lazyWithRetry(() => import("./pages/public/ValidarRelatorio"));
import { ThemeProvider } from "./components/ThemeProvider";

// Auth pages
const Login = lazyWithRetry(() => import("./pages/Login"));
const SignUp = lazyWithRetry(() => import("./pages/SignUp"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));

// Account pages
const AccountPage = lazyWithRetry(() => import("./pages/account/AccountPage"));
const BillingPage = lazyWithRetry(() => import("./pages/account/BillingPage"));
const PlanSelectionPage = lazyWithRetry(() => import("./pages/account/PlanSelectionPage"));
const EmbeddedCheckoutPage = lazyWithRetry(() => import("./pages/account/EmbeddedCheckoutPage"));

// App pages
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const NovoCliente = lazyWithRetry(() => import("./pages/NovoCliente"));
const NovoGestor = lazyWithRetry(() => import("./pages/NovoGestor"));
const Clientes = lazyWithRetry(() => import("./pages/Clientes"));
const ClienteChecklist = lazyWithRetry(() => import("./pages/ClienteChecklist"));
const DashboardGerencial = lazyWithRetry(() => import("./pages/DashboardGerencial"));
const Historico = lazyWithRetry(() => import("./pages/Historico"));
const TodosRelatorios = lazyWithRetry(() => import("./pages/TodosRelatorios"));
const Relatorio = lazyWithRetry(() => import("./pages/Relatorio"));
const NovoRelatorio = lazyWithRetry(() => import("./pages/NovoRelatorio"));
const Gestores = lazyWithRetry(() => import("./pages/Gestores"));
const GestorSettings = lazyWithRetry(() => import("./pages/GestorSettings"));
const Controle = lazyWithRetry(() => import("./pages/Controle"));
const RelatorioCliente = lazyWithRetry(() => import("./pages/RelatorioCliente"));
const SelecionarCliente = lazyWithRetry(() => import("./pages/SelecionarCliente"));
const Modelos = lazyWithRetry(() => import("./pages/Modelos"));
const Conquistas = lazyWithRetry(() => import("./pages/Conquistas"));
const Produtividade = lazyWithRetry(() => import("./pages/Produtividade"));
const PrevisaoSaldo = lazyWithRetry(() => import("./pages/PrevisaoSaldo"));
const Calendario = lazyWithRetry(() => import("./pages/Calendario"));
const AgencySettings = lazyWithRetry(() => import("./pages/AgencySettings"));
const InternalUtilities = lazyWithRetry(() => import("./pages/InternalUtilities"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

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
            <Suspense
              fallback={
                <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Carregando interface...</p>
                </div>
              }
            >
              <AppErrorBoundary>
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
                  <Route path="/account/checkout" element={<EmbeddedCheckoutPage />} />

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
              </AppErrorBoundary>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </GestorProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
