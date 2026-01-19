import { motion } from "framer-motion";
import { Calendar, DollarSign } from "lucide-react";
import RechargeCalendarComponent from "@/components/RechargeCalendar";
import RechargeList from "@/components/RechargeList";

const Recargas = () => {
  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-primary" />
            Calendário de Recargas
          </h1>
          <p className="text-muted-foreground">
            Visualize todas as recargas programadas dos seus clientes
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <RechargeCalendarComponent />
          </div>

          {/* Sidebar - Next Recharges */}
          <div className="lg:col-span-1">
            <RechargeList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recargas;
