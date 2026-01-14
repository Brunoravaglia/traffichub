import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, DollarSign } from "lucide-react";
import ClientTrackingTable from "@/components/ClientTrackingTable";

const Controle = () => {
  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Controle de Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie tracking, saldos e integrações de todos os clientes
          </p>
        </motion.div>

        <Tabs defaultValue="tracking" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="tracking" className="gap-2">
              <Database className="w-4 h-4" />
              Tracking & Integrações
            </TabsTrigger>
            <TabsTrigger value="saldo" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Saldos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracking">
            <ClientTrackingTable />
          </TabsContent>

          <TabsContent value="saldo">
            <ClientTrackingTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Controle;
