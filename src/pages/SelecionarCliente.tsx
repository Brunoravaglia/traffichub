import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";
import { useState } from "react";

const SelecionarCliente = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes-relatorio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, logo_url")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const filteredClientes = clientes?.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Novo Relatório</h1>
            <p className="text-muted-foreground">
              Selecione o cliente para criar um novo relatório
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Client Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredClientes?.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 hover:bg-card/80 transition-all group"
                  onClick={() => navigate(`/cliente/${cliente.id}/enviar-relatorio`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="w-12 h-12 group-hover:scale-105 transition-transform">
                      <AvatarImage src={cliente.logo_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {cliente.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {cliente.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criar relatório →
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredClientes?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum cliente encontrado
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SelecionarCliente;
