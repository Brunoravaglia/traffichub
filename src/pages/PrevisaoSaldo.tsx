import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import BalanceForecastChart from "@/components/BalanceForecastChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PrevisaoSaldo = () => {
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const [selectedGestor, setSelectedGestor] = useState<string>(gestor?.id || "all");

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
    <div className="min-h-full bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-1">
              <Flame className="w-7 h-7 text-orange-500" />
              Previsão de Saldo
            </h1>
            <p className="text-muted-foreground text-sm">
              Visualize quando os saldos dos clientes vão acabar
            </p>
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
        </motion.div>

        <BalanceForecastChart gestorFilter={selectedGestor} />
      </div>
    </div>
  );
};

export default PrevisaoSaldo;
