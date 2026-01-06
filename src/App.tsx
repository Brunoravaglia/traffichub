import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NovoCliente from "./pages/NovoCliente";
import NovoGestor from "./pages/NovoGestor";
import Clientes from "./pages/Clientes";
import ClienteChecklist from "./pages/ClienteChecklist";
import DashboardGerencial from "./pages/DashboardGerencial";
import Historico from "./pages/Historico";
import Relatorio from "./pages/Relatorio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/novo-cliente" element={<NovoCliente />} />
          <Route path="/novo-gestor" element={<NovoGestor />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/cliente/:id" element={<ClienteChecklist />} />
          <Route path="/cliente/:id/historico" element={<Historico />} />
          <Route path="/cliente/:id/relatorio/:data" element={<Relatorio />} />
          <Route path="/dashboard" element={<DashboardGerencial />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
