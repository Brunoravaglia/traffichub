import { motion } from "framer-motion";
import { User, Mail, CreditCard, Shield, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const accountLinks = [
    {
        icon: CreditCard,
        title: "Faturamento e Assinatura",
        description: "Gerencie seu plano, pagamentos e faturas",
        to: "/account/billing",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        icon: Shield,
        title: "Trocar de Plano",
        description: "Upgrade, downgrade ou compare planos",
        to: "/account/plan",
        color: "text-primary",
        bg: "bg-primary/10",
    },
];

const AccountPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-bold text-foreground mb-1">Minha Conta</h1>
                <p className="text-sm text-muted-foreground">Gerencie seu perfil, plano e configurações.</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border/50 bg-card/30 p-6"
            >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Dados do Perfil
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
                        <Input defaultValue="Gestor Vurp" className="bg-card/60 border-border/50" />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                        <Input defaultValue="gestor@agencia.com" disabled className="bg-card/40 border-border/30 text-muted-foreground" />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                        Salvar Alterações
                    </Button>
                </div>
            </motion.div>

            {/* Quick Links */}
            <div className="space-y-3">
                {accountLinks.map((link, i) => (
                    <motion.div
                        key={link.to}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                    >
                        <Link
                            to={link.to}
                            className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/30 p-5 hover:bg-card/50 hover:border-primary/20 transition-all group"
                        >
                            <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center`}>
                                <link.icon className={`w-5 h-5 ${link.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{link.title}</p>
                                <p className="text-xs text-muted-foreground">{link.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Danger zone */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
            >
                <h3 className="text-sm font-semibold text-red-400 mb-3">Zona de Risco</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-foreground">Encerrar sessão</p>
                        <p className="text-xs text-muted-foreground">Sair da sua conta neste dispositivo</p>
                    </div>
                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => navigate("/login")}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

// Wrap with AppLayout for protected route
const AccountPageWithLayout = () => (
    <AppLayout>
        <AccountPage />
    </AppLayout>
);

export default AccountPageWithLayout;
