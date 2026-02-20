import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Ghost, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: Usuário tentou acessar uma rota no multiverso:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0A0A0f] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 text-center px-4 max-w-2xl mx-auto"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl border border-primary/20 flex items-center justify-center backdrop-blur-sm"
        >
          <Ghost className="w-16 h-16 text-primary" />
        </motion.div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 mb-6 font-outfit tracking-tighter">
          404
        </h1>

        <h2 className="text-3xl font-bold text-white mb-4">
          Houston, temos um problema! 🚀
        </h2>

        <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Parece que você navegou longe demais no universo do tráfego.
          Esta página foi abduzida por aliens ou o estagiário deletou sem querer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto text-base h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_-5px_var(--primary)]"
          >
            <Home className="w-5 h-5 mr-2" />
            Me tire daqui
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto text-base h-12 px-8 rounded-full border-white/10 hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar com segurança
          </Button>
        </div>
      </motion.div>

      {/* Floating stars/particles effect */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.05 }} />
    </div>
  );
};

export default NotFound;
