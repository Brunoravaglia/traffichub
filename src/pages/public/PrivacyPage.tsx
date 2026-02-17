import { motion } from "framer-motion";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

const sections = [
    {
        title: "1. Introdução",
        content:
            "O Vurp valoriza e respeita a privacidade dos seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).",
    },
    {
        title: "2. Dados Coletados",
        content:
            "Coletamos os seguintes tipos de dados:\n\n• **Dados de cadastro:** nome completo, endereço de email, telefone e senha (criptografada)\n• **Dados de uso:** informações sobre como você utiliza a plataforma, páginas visitadas, funcionalidades usadas\n• **Dados de clientes:** informações dos clientes de tráfego que você cadastra no sistema (nome, plataformas, métricas)\n• **Dados de pagamento:** processados diretamente pelo Stripe; não armazenamos dados de cartão de crédito\n• **Dados técnicos:** endereço IP, tipo de navegador, sistema operacional, cookies de sessão",
    },
    {
        title: "3. Finalidade do Tratamento",
        content:
            "Utilizamos seus dados pessoais para:\n\n• Fornecer e manter o funcionamento da plataforma\n• Processar pagamentos e gerenciar assinaturas\n• Enviar comunicações relacionadas ao serviço (avisos de conta, atualizações)\n• Melhorar a experiência do usuário e personalizar o serviço\n• Cumprir obrigações legais e regulatórias\n• Prevenir fraudes e garantir a segurança da plataforma",
    },
    {
        title: "4. Base Legal",
        content:
            "O tratamento dos seus dados pessoais é realizado com as seguintes bases legais (Art. 7, LGPD):\n\n• **Consentimento:** ao criar sua conta e aceitar estes termos\n• **Execução de contrato:** para fornecer o serviço contratado\n• **Legítimo interesse:** para melhorar e proteger a plataforma\n• **Cumprimento de obrigação legal:** para atender exigências legais e fiscais",
    },
    {
        title: "5. Compartilhamento de Dados",
        content:
            "Seus dados pessoais podem ser compartilhados com:\n\n• **Stripe:** para processamento de pagamentos\n• **Supabase:** para armazenamento seguro de dados\n• **Autoridades competentes:** quando exigido por lei ou ordem judicial\n\nNão vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.",
    },
    {
        title: "6. Cookies",
        content:
            "Utilizamos cookies essenciais para o funcionamento da plataforma:\n\n• **Cookies de sessão:** para manter você autenticado\n• **Cookies de preferência:** para salvar suas configurações\n\nNão utilizamos cookies de rastreamento de terceiros para publicidade.",
    },
    {
        title: "7. Segurança dos Dados",
        content:
            "Implementamos medidas técnicas e organizacionais para proteger seus dados:\n\n• Criptografia em trânsito (HTTPS/TLS)\n• Criptografia em repouso para dados sensíveis\n• Autenticação segura com hash de senhas\n• Backups regulares e redundância\n• Controle de acesso baseado em funções\n• Monitoramento contínuo de segurança",
    },
    {
        title: "8. Retenção de Dados",
        content:
            "Seus dados são retidos enquanto sua conta estiver ativa. Após o cancelamento:\n\n• Dados da conta são mantidos por 30 dias para possibilitar reativação\n• Após 30 dias, dados pessoais são anonimizados ou excluídos\n• Dados fiscais são retidos pelo período exigido por lei (5 anos)\n• Backups são eliminados em até 90 dias",
    },
    {
        title: "9. Seus Direitos (LGPD)",
        content:
            "Conforme a LGPD, você tem direito a:\n\n• **Confirmação e acesso:** saber se tratamos seus dados e acessá-los\n• **Correção:** solicitar correção de dados incompletos ou incorretos\n• **Anonimização ou exclusão:** solicitar a exclusão de dados desnecessários\n• **Portabilidade:** solicitar a transferência dos seus dados\n• **Revogação do consentimento:** revogar o consentimento a qualquer momento\n• **Oposição:** opor-se ao tratamento em casos específicos\n\nPara exercer seus direitos, entre em contato: privacidade@vurp.com.br",
    },
    {
        title: "10. Encarregado de Proteção de Dados (DPO)",
        content:
            "Para questões relacionadas à proteção de dados pessoais, entre em contato com nosso Encarregado:\n\nEmail: dpo@vurp.com.br\nEndereço: São Paulo/SP, Brasil",
    },
    {
        title: "11. Alterações nesta Política",
        content:
            "Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas serão comunicadas por email com antecedência de 15 dias. A data da última atualização sempre estará indicada no topo desta página.",
    },
];

const PrivacyPage = () => {
    return (
        <PublicLayout>
            <SEOHead
                title="Política de Privacidade"
                description="Como o Vurp coleta, usa e protege seus dados. Política em conformidade com a LGPD - Lei Geral de Proteção de Dados."
                path="/privacy"
                breadcrumbs={[
                    { name: "Privacidade", path: "/privacy" },
                ]}
            />
            <section className="py-16 sm:py-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                            Política de Privacidade
                        </h1>
                        <p className="text-sm text-muted-foreground mb-10">
                            Última atualização: {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}
                        </p>

                        <div className="space-y-8">
                            {sections.map((section, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.03 }}
                                >
                                    <h2 className="text-lg font-semibold text-foreground mb-3">{section.title}</h2>
                                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line prose-strong:text-foreground/80">
                                        {section.content.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
                                            if (part.startsWith("**") && part.endsWith("**")) {
                                                return <strong key={j} className="text-foreground/80">{part.slice(2, -2)}</strong>;
                                            }
                                            return <span key={j}>{part}</span>;
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-border/30">
                            <p className="text-xs text-muted-foreground/60">
                                Para dúvidas sobre esta política, entre em contato: privacidade@vurp.com.br
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default PrivacyPage;
