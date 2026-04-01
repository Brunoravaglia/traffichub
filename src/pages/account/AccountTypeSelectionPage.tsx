import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGestor } from "@/contexts/GestorContext";
import VCDLogo from "@/components/VCDLogo";
import { toast } from "@/hooks/use-toast";

const accountTypes = [
  {
    id: "solo" as const,
    title: "Sou gestor solo",
    description: "Quero operar sozinho, com uma jornada mais enxuta e foco em clientes, relatorios e rotina.",
    icon: Briefcase,
    badge: "Conta individual",
  },
  {
    id: "agency_owner" as const,
    title: "Tenho agencia",
    description: "Quero organizar equipe, padronizar entrega e usar o Vurp como central da operacao.",
    icon: Building2,
    badge: "Conta de agencia",
  },
];

const AccountTypeSelectionPage = () => {
  const navigate = useNavigate();
  const { gestor, isLoggedIn, isAuthLoading, setAccountType } = useGestor();
  const [selectedType, setSelectedType] = useState<"solo" | "agency_owner" | null>(gestor?.account_type ?? null);
  const [saving, setSaving] = useState(false);

  if (!isAuthLoading && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthLoading && gestor?.account_type) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleContinue = async () => {
    if (!selectedType) {
      toast({
        title: "Escolha seu perfil",
        description: "Selecione como voce vai usar o Vurp para continuar.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const result = await setAccountType(selectedType);
    setSaving(false);

    if (!result.success) {
      toast({
        title: "Nao foi possivel salvar seu perfil",
        description: result.error ?? "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Perfil configurado",
      description: selectedType === "solo"
        ? "Vamos te levar para a jornada individual."
        : "Vamos te levar para a jornada de agencia.",
    });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#06110c] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(137,240,91,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(30,64,43,0.42),transparent_32%),#06110c]" />
      <div className="absolute inset-0 opacity-[0.07] [background-size:52px_52px] [background-image:linear-gradient(to_right,#89f05b22_1px,transparent_1px),linear-gradient(to_bottom,#89f05b22_1px,transparent_1px)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-[#0c1812]/85 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.45)] p-6 sm:p-10"
        >
          <div className="mb-10">
            <VCDLogo size="md" showText />
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#89f05b]">Primeira decisao da conta</p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-bold text-white leading-tight">
              Como voce vai usar o Vurp?
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-[#a6b5ae]">
              Isso define seu onboarding, seu menu e as areas que vao aparecer daqui pra frente.
              A ideia e te mostrar so o que faz sentido para sua operacao.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {accountTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`text-left rounded-[28px] border p-6 transition-all duration-200 ${
                    isSelected
                      ? "border-[#89f05b]/40 bg-[#112317] shadow-[0_0_0_1px_rgba(137,240,91,0.12)]"
                      : "border-white/8 bg-white/[0.02] hover:border-white/16 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isSelected ? "bg-[#89f05b]/15 text-[#89f05b]" : "bg-white/[0.05] text-white"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                      isSelected ? "text-[#89f05b]" : "text-[#8ea097]"
                    }`}>
                      {type.badge}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3">{type.title}</h2>
                  <p className="text-sm leading-7 text-[#a6b5ae]">{type.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-[#7e9188]">
              Se voce escolher a opcao errada agora, depois a gente pode ajustar na evolucao da conta.
            </p>
            <Button
              onClick={handleContinue}
              disabled={saving}
              className="h-12 px-6 rounded-full bg-[#89f05b] hover:bg-[#97f46f] text-[#0c1812] font-semibold"
            >
              {saving ? "Salvando..." : "Continuar"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountTypeSelectionPage;
