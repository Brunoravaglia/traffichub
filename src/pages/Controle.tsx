import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, DollarSign, BarChart3, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import ClientTrackingTable from "@/components/ClientTrackingTable";
import ControleDashboard from "@/components/ControleDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Controle = () => {
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const [selectedGestor, setSelectedGestor] = useState<string>("all");

  const { data: gestores } = useQuery({
    queryKey: ["gestores-filter", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data } = await supabase
        .from("gestores")
        .select("id, nome")
        .eq("agencia_id", agencyId)
        .order("nome");
      return data || [];
    },
    enabled: !!agencyId,
  });

  return (
    <div className="min-h-screen bg-background pt-6 px-6 overflow-y-auto flex flex-col pb-20">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Controle de Clientes
                </h1>
                <p className="text-muted-foreground">
                  Gerencie tracking, saldos e integrações de todos os clientes
                </p>
              </div>
            </div>

            <Select value={selectedGestor} onValueChange={setSelectedGestor}>
              <SelectTrigger className="w-48 bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por gestor" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos os gestores</SelectItem>
                {gestores?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Dashboard Visual */}
        <ControleDashboard gestorFilter={selectedGestor} />

        {/* Tabs with Table */}
        <Tabs defaultValue="tracking" className="w-full mt-6">
          <TabsList className="mb-0">
            <TabsTrigger value="tracking" className="gap-2">
              <Database className="w-4 h-4" />
              Tracking & Integrações
            </TabsTrigger>
            <TabsTrigger value="saldo" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Saldos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="mt-4">
            <ClientTrackingTable gestorFilter={selectedGestor} />
          </TabsContent>

          <TabsContent value="saldo" className="mt-4">
            <ClientTrackingTable gestorFilter={selectedGestor} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Controle;
