import { motion } from "framer-motion";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

const sections = [
    {
        title: "1. Aceitação dos Termos",
        content:
            "Ao acessar ou utilizar o Vurp, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços. Estes termos constituem um acordo legal entre você e o Vurp.",
    },
    {
        title: "2. Definições",
        content:
            '• "Plataforma" refere-se ao sistema Vurp, incluindo website, aplicação web e APIs.\n• "Usuário" refere-se a qualquer pessoa que acesse ou utilize a Plataforma.\n• "Conta" refere-se ao registro individualizado do Usuário na Plataforma.\n• "Gestor" refere-se ao usuário com permissões de gestão de tráfego.\n• "Agência" refere-se a um grupo de gestores sob uma mesma conta organizacional.',
    },
    {
        title: "3. Cadastro e Conta",
        content:
            "Para utilizar o Vurp, é necessário criar uma conta fornecendo informações verdadeiras, atualizadas e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.",
    },
    {
        title: "4. Planos e Pagamento",
        content:
            "O Vurp oferece planos pagos com diferentes níveis de funcionalidade. Os preços estão disponíveis na página de preços. O pagamento é processado por meio de provedores terceiros (Stripe). Ao assinar um plano, você autoriza a cobrança recorrente conforme o ciclo escolhido (mensal ou anual). Alterações de plano entram em vigor imediatamente com ajuste proporcional.",
    },
    {
        title: "5. Cancelamento e Reembolso",
        content:
            "Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. Após o cancelamento, seu acesso permanece ativo até o final do período já pago. Não oferecemos reembolso por períodos parciais, exceto quando exigido por lei. O período de teste gratuito de 7 dias pode ser cancelado sem qualquer cobrança.",
    },
    {
        title: "6. Uso Permitido",
        content:
            "O Vurp deve ser utilizado exclusivamente para fins de gestão de tráfego pago e atividades relacionadas. É proibido:\n• Utilizar a plataforma para fins ilegais ou não autorizados\n• Tentar acessar áreas restritas do sistema\n• Compartilhar credenciais de acesso com terceiros não autorizados\n• Realizar engenharia reversa ou descompilar o software\n• Utilizar bots ou scripts automatizados sem autorização",
    },
    {
        title: "7. Propriedade Intelectual",
        content:
            "Todo o conteúdo, design, funcionalidades, código-fonte e marcas do Vurp são propriedade exclusiva do Vurp e protegidos por leis de propriedade intelectual. Os dados inseridos pelo Usuário permanecem de propriedade do Usuário, concedendo ao Vurp uma licença limitada para processamento conforme necessário para a prestação do serviço.",
    },
    {
        title: "8. Limitação de Responsabilidade",
        content:
            'O Vurp é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será ininterrupto ou livre de erros. Em nenhuma circunstância o Vurp será responsável por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso da plataforma.',
    },
    {
        title: "9. Proteção de Dados (LGPD)",
        content:
            "O Vurp está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Para informações detalhadas sobre como coletamos, usamos e protegemos seus dados pessoais, consulte nossa Política de Privacidade.",
    },
    {
        title: "10. Modificações dos Termos",
        content:
            "Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas com antecedência mínima de 30 dias por email. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.",
    },
    {
        title: "11. Disposições Gerais",
        content:
            "Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de São Paulo/SP. Se qualquer disposição destes Termos for considerada inválida, as demais disposições permanecerão em pleno vigor.",
    },
];

const TermsPage = () => {
    return (
        <PublicLayout>
            <SEOHead
                title="Termos de Uso"
                description="Termos de Uso do Vurp - condições de acesso, planos, pagamento, propriedade intelectual e conformidade LGPD."
                path="/terms"
                breadcrumbs={[
                    { name: "Termos de Uso", path: "/terms" },
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
                            Termos de Uso
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
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-border/30">
                            <p className="text-xs text-muted-foreground/60">
                                Este documento foi revisado pela última vez na data indicada acima. Para dúvidas sobre estes termos, entre em contato através do email: legal@vurp.com.br
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default TermsPage;
