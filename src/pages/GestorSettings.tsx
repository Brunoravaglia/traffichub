import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Save, User, Camera, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGestor } from "@/contexts/GestorContext";
import { supabase } from "@/integrations/supabase/client";

const GestorSettings = () => {
  const { gestor, updatePassword, refreshGestor } = useGestor();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem",
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 4 caracteres",
      });
      return;
    }

    setIsChangingPassword(true);

    // Verify current password
    const { data: gestorData } = await supabase
      .from("gestores")
      .select("senha")
      .eq("id", gestor?.id)
      .single();

    if (gestorData?.senha !== currentPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Senha atual incorreta",
      });
      setIsChangingPassword(false);
      return;
    }

    const result = await updatePassword(newPassword);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Senha alterada com sucesso",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.error || "Erro ao alterar senha",
      });
    }

    setIsChangingPassword(false);
  };

  if (!gestor) return null;

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações de conta
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="vcd-card mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {gestor.foto_url ? (
                <img
                  src={gestor.foto_url}
                  alt={gestor.nome}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {gestor.nome}
              </h2>
              <p className="text-muted-foreground text-sm">
                Gestor de Tráfego
              </p>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="vcd-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Alterar Senha</h3>
              <p className="text-sm text-muted-foreground">
                Atualize sua senha de acesso
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="bg-secondary border-border"
              />
            </div>

            <Button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isChangingPassword ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Nova Senha
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default GestorSettings;
