import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import { GestorProvider } from "@/contexts/GestorContext";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const Login = lazyWithRetry(() => import("@/pages/Login"));
const SignUp = lazyWithRetry(() => import("@/pages/SignUp"));
const ForgotPassword = lazyWithRetry(() => import("@/pages/ForgotPassword"));
const AccountPage = lazyWithRetry(() => import("@/pages/account/AccountPage"));
const AccountTypeSelectionPage = lazyWithRetry(() => import("@/pages/account/AccountTypeSelectionPage"));
const BillingPage = lazyWithRetry(() => import("@/pages/account/BillingPage"));
const PlanSelectionPage = lazyWithRetry(() => import("@/pages/account/PlanSelectionPage"));
const EmbeddedCheckoutPage = lazyWithRetry(() => import("@/pages/account/EmbeddedCheckoutPage"));
const Dashboard = lazyWithRetry(() => import("@/pages/Dashboard"));
const NovoCliente = lazyWithRetry(() => import("@/pages/NovoCliente"));
const NovoGestor = lazyWithRetry(() => import("@/pages/NovoGestor"));
const Clientes = lazyWithRetry(() => import("@/pages/Clientes"));
const ClienteChecklist = lazyWithRetry(() => import("@/pages/ClienteChecklist"));
const DashboardGerencial = lazyWithRetry(() => import("@/pages/DashboardGerencial"));
const Historico = lazyWithRetry(() => import("@/pages/Historico"));
const TodosRelatorios = lazyWithRetry(() => import("@/pages/TodosRelatorios"));
const Relatorio = lazyWithRetry(() => import("@/pages/Relatorio"));
const NovoRelatorio = lazyWithRetry(() => import("@/pages/NovoRelatorio"));
const Gestores = lazyWithRetry(() => import("@/pages/Gestores"));
const GestorSettings = lazyWithRetry(() => import("@/pages/GestorSettings"));
const Controle = lazyWithRetry(() => import("@/pages/Controle"));
const RelatorioCliente = lazyWithRetry(() => import("@/pages/RelatorioCliente"));
const SelecionarCliente = lazyWithRetry(() => import("@/pages/SelecionarCliente"));
const Modelos = lazyWithRetry(() => import("@/pages/Modelos"));
const Conquistas = lazyWithRetry(() => import("@/pages/Conquistas"));
const Produtividade = lazyWithRetry(() => import("@/pages/Produtividade"));
const PrevisaoSaldo = lazyWithRetry(() => import("@/pages/PrevisaoSaldo"));
const Calendario = lazyWithRetry(() => import("@/pages/Calendario"));
const AgencySettings = lazyWithRetry(() => import("@/pages/AgencySettings"));
const InternalUtilities = lazyWithRetry(() => import("@/pages/InternalUtilities"));
const NotFound = lazyWithRetry(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const AuthenticatedRoutes = () => (
  <QueryClientProvider client={queryClient}>
    <GestorProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/welcome/account-type" element={<AccountTypeSelectionPage />} />
          <Route path="/account/billing" element={<BillingPage />} />
          <Route path="/account/plan" element={<PlanSelectionPage />} />
          <Route path="/account/checkout" element={<EmbeddedCheckoutPage />} />
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
      </TooltipProvider>
    </GestorProvider>
  </QueryClientProvider>
);

export default AuthenticatedRoutes;
