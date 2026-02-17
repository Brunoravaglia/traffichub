import { Link } from "react-router-dom";
import SEOHead from "../../components/SEOHead";
import PublicLayout from "@/components/home/PublicLayout";

const AboutPage = () => {
    return (
        <PublicLayout>
            <SEOHead
                title="Sobre o Vurp | Bruno Ravaglia - Gestor de Tráfego desde 2013"
                description="Conheça a história do Vurp e de Bruno Ravaglia, gestor de tráfego pago desde 2013 com experiência na Você Digital Propaganda."
                path="/about"
                breadcrumbs={[
                    { name: "Sobre", path: "/about" },
                ]}
            />

            <div className="min-h-screen bg-background text-foreground">
                {/* Hero */}
                <section className="relative py-24 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
                            Sobre nós
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Feito por quem{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                vive tráfego pago
                            </span>{" "}
                            todo dia
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            O Vurp nasceu da experiência real de mais de uma década
                            gerenciando campanhas de tráfego pago para centenas de clientes.
                        </p>
                    </div>
                </section>

                {/* Bio Section */}
                <section className="py-16 md:py-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="grid md:grid-cols-5 gap-12 items-start">
                            {/* Avatar / Visual */}
                            <div className="md:col-span-2 flex justify-center">
                                <div className="relative">
                                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                                BR
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-2">
                                                Bruno Ravaglia
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 bg-amber-500 text-background text-xs font-bold px-3 py-1.5 rounded-full">
                                        Desde 2013
                                    </div>
                                </div>
                            </div>

                            {/* Text */}
                            <div className="md:col-span-3 space-y-6">
                                <h2 className="text-2xl md:text-3xl font-bold">
                                    Bruno Ravaglia
                                </h2>
                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    <p>
                                        Meu nome é <strong className="text-foreground">Bruno Ravaglia</strong> e eu trabalho
                                        com gestão de tráfego pago{" "}
                                        <strong className="text-foreground">desde 2013</strong>. Isso
                                        significa que eu comecei quando o Facebook Ads ainda era uma
                                        ferramenta nova, o Google Ads se chamava AdWords, e TikTok não
                                        existia.
                                    </p>
                                    <p>
                                        Ao longo dessa trajetória, tive o privilégio de trabalhar na{" "}
                                        <strong className="text-foreground">
                                            Você Digital Propaganda
                                        </strong>
                                        , uma agência onde pude gerenciar campanhas para dezenas de
                                        clientes de diferentes segmentos - desde e-commerce e
                                        infoprodutos até negócios locais e B2B.
                                    </p>
                                    <p>
                                        Foram centenas de campanhas criadas, milhões de reais em
                                        investimento gerenciados e uma certeza absoluta:{" "}
                                        <strong className="text-foreground">
                                            o maior desafio de um gestor de tráfego não é criar
                                            campanhas - é se organizar.
                                        </strong>
                                    </p>
                                    <p>
                                        Conforme o número de clientes crescia, percebi que planilhas,
                                        blocos de notas e ferramentas genéricas não davam conta. Eu
                                        precisava de um sistema feito especificamente para gestores de
                                        tráfego - e como ele não existia, eu criei o{" "}
                                        <strong className="text-amber-400">Vurp</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="py-16 md:py-24 bg-card/30">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">
                            A jornada até o Vurp
                        </h2>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />

                            {[
                                {
                                    year: "2013",
                                    title: "Início no tráfego pago",
                                    desc: "Primeiras campanhas no Google AdWords e Facebook Ads. Tudo era novo, tudo era experimentação. Aprendi errando e optimizando.",
                                },
                                {
                                    year: "2015",
                                    title: "Você Digital Propaganda",
                                    desc: "Entrei para a equipe da Você Digital Propaganda, onde pude escalar minha experiência e gerenciar campanhas de alto volume para múltiplos clientes.",
                                },
                                {
                                    year: "2018",
                                    title: "A dor da escala",
                                    desc: "Com 15+ clientes ativos, as planilhas começaram a falhar. Tarefas esquecidas, relatórios atrasados, dados desatualizados. Precisava de algo melhor.",
                                },
                                {
                                    year: "2020",
                                    title: "A pandemia acelerou tudo",
                                    desc: "Boom do digital. Mais clientes, mais urgência, mais caos operacional. A necessidade de um sistema especializado ficou impossível de ignorar.",
                                },
                                {
                                    year: "2023",
                                    title: "Nasce o Vurp",
                                    desc: "Comecei a construir o Vurp: um sistema feito por gestor de tráfego, para gestores de tráfego. Cada feature nasceu de uma dor real.",
                                },
                                {
                                    year: "2026",
                                    title: "Lançamento oficial",
                                    desc: "O Vurp está pronto para ajudar gestores de todo o Brasil a trabalhar com mais organização, profissionalismo e resultados.",
                                },
                            ].map((item, i) => (
                                <div
                                    key={item.year}
                                    className={`relative flex items-start mb-12 last:mb-0 ${i % 2 === 0
                                        ? "md:flex-row"
                                        : "md:flex-row-reverse"
                                        }`}
                                >
                                    {/* Dot */}
                                    <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-amber-500 -translate-x-1/2 mt-2 z-10 shadow-lg shadow-amber-500/30" />

                                    {/* Content */}
                                    <div
                                        className={`ml-10 md:ml-0 md:w-[45%] ${i % 2 === 0 ? "md:pr-12" : "md:pl-12"
                                            }`}
                                    >
                                        <span className="text-amber-400 font-bold text-sm">
                                            {item.year}
                                        </span>
                                        <h3 className="text-lg font-semibold mt-1 mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section className="py-16 md:py-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "🎯",
                                    title: "Missão",
                                    desc: "Dar a todo gestor de tráfego as ferramentas necessárias para trabalhar com organização e profissionalismo, independente do tamanho.",
                                },
                                {
                                    icon: "👁️",
                                    title: "Visão",
                                    desc: "Ser a plataforma de referência para gestores de tráfego pago no Brasil, tornando a gestão de campanhas tão simples quanto deveria ser.",
                                },
                                {
                                    icon: "💡",
                                    title: "Valores",
                                    desc: "Simplicidade acima de complexidade. Feito por gestores, para gestores. Cada feature resolve uma dor real. Transparência sempre.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-amber-500/30 transition-colors"
                                >
                                    <div className="text-3xl mb-4">{item.icon}</div>
                                    <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-amber-500/5">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Pronto para organizar sua gestão?
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Experimente o Vurp gratuitamente e descubra como a
                            organização transforma seus resultados.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity"
                            >
                                Teste grátis
                            </Link>
                            <Link
                                to="/blog"
                                className="px-8 py-3 rounded-xl border border-border hover:border-amber-500/50 font-semibold transition-colors"
                            >
                                Ler nosso blog
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default AboutPage;
