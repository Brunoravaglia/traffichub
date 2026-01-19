import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GestorProvider } from "./contexts/GestorContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GestorProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login page - no layout */}
            <Route path="/" element={<Index />} />
            
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </GestorProvider>
  </QueryClientProvider>
);

export default App;
