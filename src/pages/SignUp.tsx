import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import VCDLogo from "@/components/VCDLogo";
import { supabase } from "@/integrations/supabase/client";

const benefits = [
    "7 dias grátis, sem cartão de crédito",
    "Checklist, relatórios e calendário",
    "Cancele quando quiser",
];

const SignUp = () => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) {
            console.error("Google login error:", error.message);
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) {
            console.error("SignUp error:", error.message);
            setLoading(false);
            return;
        }
        setLoading(false);
        navigate("/pricing");
    };

    return (
        <div className="min-h-screen bg-background flex relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
            </div>

            {/* Left - benefits panel (desktop) */}
            <div className="hidden lg:flex flex-col justify-center w-1/2 px-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <VCDLogo size="md" showText />
                    <h1 className="text-4xl font-bold text-foreground mt-8 mb-4">
                        Organize sua gestão de tráfego<br />
                        <span className="vcd-gradient-text">como nunca antes</span>
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        Junte-se a centenas de gestores que já transformaram sua rotina com o Vurp.
                    </p>
                    <ul className="space-y-4">
                        {benefits.map((b, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="text-foreground/80">{b}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            </div>

            {/* Right - form */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden mb-6">
                        <Link to="/">
                            <VCDLogo size="sm" showText />
                        </Link>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-border"}`} />
                        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-border"}`} />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-1">
                        {step === 1 ? "Crie sua conta" : "Defina sua senha"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        {step === 1
                            ? "Comece com 7 dias grátis, sem compromisso."
                            : "Escolha uma senha segura para proteger sua conta."}
                    </p>

                    {/* Google Sign-In */}
                    {step === 1 && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                                className="w-full h-12 text-base font-medium border-border/60 hover:bg-card/80 transition-all mb-4 gap-3"
                            >
                                {googleLoading ? (
                                    <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                Continuar com Google
                            </Button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground">ou</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                        </>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 ? (
                            <>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1.5 block">Nome completo</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: João Silva"
                                        required
                                        className="h-11 bg-card/60 border-border/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                        className="h-11 bg-card/60 border-border/50"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1.5 block">Senha</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                            minLength={8}
                                            className="h-11 bg-card/60 border-border/50 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        required
                                        className="mt-1 accent-primary"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        Concordo com os{" "}
                                        <Link to="/terms" className="text-primary hover:underline">Termos de Uso</Link>
                                        {" "}e a{" "}
                                        <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
                                    </span>
                                </label>
                            </>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base vcd-button-glow"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : step === 1 ? (
                                <>Continuar <ArrowRight className="ml-2 w-4 h-4" /></>
                            ) : (
                                "Criar Conta"
                            )}
                        </Button>

                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
                            >
                                ← Voltar
                            </button>
                        )}
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default SignUp;

