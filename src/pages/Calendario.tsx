import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, StickyNote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGestor } from "@/contexts/GestorContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RechargeCalendarComponent from "@/components/RechargeCalendar";
import RechargeList from "@/components/RechargeList";
import CalendarNotes from "@/components/CalendarNotes";

const Calendario = () => {
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const [selectedGestor, setSelectedGestor] = useState<string>(gestor?.id || "all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch all gestores for filter
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-1">
                <Calendar className="w-7 h-7 text-primary" />
                Calendário
              </h1>
              <p className="text-muted-foreground text-sm">
                Visualize recargas e notas do seu calendário
              </p>
            </div>

            {/* Gestor Filter */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedGestor} onValueChange={setSelectedGestor}>
                <SelectTrigger className="w-48 bg-secondary border-border">
                  <SelectValue placeholder="Filtrar por gestor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos os gestores</SelectItem>
                  {gestores?.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.nome}
                      {g.id === gestor?.id && " (você)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <RechargeCalendarComponent 
              gestorFilter={selectedGestor} 
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Sidebar - Tabs for Recharges and Notes */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="recargas" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger value="recargas" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Recargas
                </TabsTrigger>
                <TabsTrigger value="notas" className="gap-2">
                  <StickyNote className="w-4 h-4" />
                  Notas
                </TabsTrigger>
              </TabsList>
              <TabsContent value="recargas" className="mt-4">
                <RechargeList gestorFilter={selectedGestor} />
              </TabsContent>
              <TabsContent value="notas" className="mt-4">
                <div className="vcd-card p-4">
                  <CalendarNotes 
                    selectedDate={selectedDate} 
                    gestorFilter={selectedGestor}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
