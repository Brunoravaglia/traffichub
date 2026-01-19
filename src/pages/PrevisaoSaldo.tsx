import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import BalanceForecastChart from "@/components/BalanceForecastChart";

const PrevisaoSaldo = () => {
  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-1">
            <Flame className="w-7 h-7 text-orange-500" />
            Previsão de Saldo
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualize quando os saldos dos clientes vão acabar
          </p>
        </motion.div>

        <BalanceForecastChart />
      </div>
    </div>
  );
};

export default PrevisaoSaldo;
