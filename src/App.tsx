import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import NovoCliente from "./pages/NovoCliente";
import NovoGestor from "./pages/NovoGestor";
import Clientes from "./pages/Clientes";
import ClienteChecklist from "./pages/ClienteChecklist";
import DashboardGerencial from "./pages/DashboardGerencial";
import Historico from "./pages/Historico";
import Relatorio from "./pages/Relatorio";
import NovoRelatorio from "./pages/NovoRelatorio";
import Gestores from "./pages/Gestores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Index /></AppLayout>} />
          <Route path="/novo-cliente" element={<AppLayout><NovoCliente /></AppLayout>} />
          <Route path="/novo-gestor" element={<AppLayout><NovoGestor /></AppLayout>} />
          <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
          <Route path="/cliente/:id" element={<AppLayout><ClienteChecklist /></AppLayout>} />
          <Route path="/cliente/:id/historico" element={<AppLayout><Historico /></AppLayout>} />
          <Route path="/cliente/:id/relatorio/:data" element={<AppLayout><Relatorio /></AppLayout>} />
          <Route path="/cliente/:id/novo-relatorio" element={<AppLayout><NovoRelatorio /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><DashboardGerencial /></AppLayout>} />
          <Route path="/gestores" element={<AppLayout><Gestores /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
