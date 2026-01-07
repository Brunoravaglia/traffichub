import { motion } from "framer-motion";
import { Plus, Users, BarChart3, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VCDLogo from "./VCDLogo";

const Dashboard = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <VCDLogo size="sm" />
          <div className="h-px flex-1 mx-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <span className="text-muted-foreground text-sm">Você Digital</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Checklist do Gestor de Tráfego
            </h1>
            <p className="text-xl text-muted-foreground">
              Controle profissional das contas de mídia paga
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Create Client Card */}
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/novo-cliente")}
              className="vcd-card-hover group text-left p-8"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    Criar novo cliente
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Cadastre um novo cliente e inicie o checklist
                  </p>
                </div>
              </div>
            </motion.button>

            {/* View Clients Card */}
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/clientes")}
              className="vcd-card-hover group text-left p-8"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    Ver clientes
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Acesse os checklists dos clientes existentes
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Dashboard Card */}
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="vcd-card-hover group text-left p-8"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <BarChart3 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    Dashboard Gerencial
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Visão executiva de gestores e pendências
                  </p>
                </div>
              </div>
            </motion.button>

            {/* New Gestor Card */}
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/novo-gestor")}
              className="vcd-card-hover group text-left p-8"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <UserPlus className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    Novo Gestor
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Cadastre um novo gestor de tráfego
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
