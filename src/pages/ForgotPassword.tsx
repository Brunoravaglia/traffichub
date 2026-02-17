import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import VCDLogo from "@/components/VCDLogo";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Integrate with Supabase Auth
        // await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
        console.log("Reset password for:", email);
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                <Link to="/" className="inline-block mb-6">
                    <VCDLogo size="sm" showText />
                </Link>

                {sent ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-emerald-500/30 bg-card/40 p-8 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Email enviado!</h2>
                        <p className="text-sm text-muted-foreground mb-2">
                            Enviamos um link de recuperação para:
                        </p>
                        <p className="text-sm text-primary font-medium mb-6">{email}</p>
                        <p className="text-xs text-muted-foreground mb-6">
                            Verifique também sua caixa de spam. O link expira em 24 horas.
                        </p>
                        <Link to="/login">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar ao login
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                            Esqueceu a senha?
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Digite seu email e enviaremos um link para redefinir sua senha.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                ) : (
                                    "Enviar Link de Recuperação"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="w-3 h-3 inline mr-1" />
                                Voltar ao login
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
