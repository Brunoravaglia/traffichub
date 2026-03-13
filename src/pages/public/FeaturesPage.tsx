import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, stagger } from "animejs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  FileBarChart,
  Layers3,
  LayoutTemplate,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { GoogleLogo, LinkedInLogo, MetaLogo, ShopeeLogo, TikTokLogo } from "@/components/BrandLogos";

const heroStats = [
  { value: "5", label: "plataformas no mesmo relatório" },
  { value: "PDF + link", label: "entrega profissional pronta" },
  { value: "1 fluxo", label: "do briefing à exportação" },
];

const showcaseCards = [
  {
    title: "Dashboard gerencial real",
    copy: "Cliente, verba, produtividade, relatórios e operação em uma visão única.",
    image: "/hero-dashboard-vurp.png",
    tone: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  {
    title: "Relatórios com aparência premium",
    copy: "Google, Meta, LinkedIn, TikTok e Shopee Ads no mesmo padrão visual.",
    image: "/showcase/reports.png",
    tone: "from-cyan-500/20 via-cyan-500/5 to-transparent",
  },
  {
    title: "Checklist e rotina operacional",
    copy: "A entrega deixa de depender de memória e vira processo reproduzível.",
    image: "/showcase/checklist.png",
    tone: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
];

const featureRows = [
  {
    eyebrow: "Organização operacional",
    title: "Checklists, calendário e rotina no mesmo ritmo da agência.",
    description:
      "O Vurp não tenta parecer um painel bonito apenas no marketing. Ele organiza o trabalho real: tarefas recorrentes, datas de entrega, recargas, reuniões, cobranças e responsáveis.",
    bullets: [
      "Checklist por cliente e por gestor",
      "Calendário de entregas e alertas operacionais",
      "Visão clara do que está atrasado, concluído ou em risco",
    ],
    image: "/showcase/calendar.png",
    icon: CalendarDays,
  },
  {
    eyebrow: "Relatórios e templates",
    title: "Criar relatório deixou de ser um gargalo manual.",
    description:
      "Você pode gerar do zero ou partir de modelos salvos. A estrutura do relatório fica consistente, a equipe ganha velocidade e o cliente recebe algo com padrão profissional, não improvisado.",
    bullets: [
      "Templates reutilizáveis por operação ou cliente",
      "Seleção de métricas por plataforma",
      "Exportação pronta para PDF sem retrabalho visual",
    ],
    image: "/showcase/reports.png",
    icon: FileBarChart,
  },
  {
    eyebrow: "Gestão de agência",
    title: "Financeiro, produtividade e carteira sob controle.",
    description:
      "A plataforma também resolve a camada gerencial: quanto entrou, quanto foi investido, quais clientes exigem atenção, quem está produzindo e onde a operação está travando.",
    bullets: [
      "Controle por cliente e por gestor",
      "Indicadores de saúde da carteira",
      "Leitura rápida para tomada de decisão diária",
    ],
    image: "/showcase/dashboard.png",
    icon: BarChart3,
  },
];

const platformCards = [
  {
    name: "Google Ads",
    icon: GoogleLogo,
    metrics: ["Cliques", "Impressões", "Conversões", "Investido", "CPL", "CPA"],
  },
  {
    name: "Meta Ads",
    icon: MetaLogo,
    metrics: ["Impressões", "Engajamento", "Conversas", "Investido", "Cliques link", "Leads"],
  },
  {
    name: "LinkedIn Ads",
    icon: LinkedInLogo,
    metrics: ["Impressões", "Cliques", "Leads", "CTR", "CPC", "Investido"],
  },
  {
    name: "TikTok Ads",
    icon: TikTokLogo,
    metrics: ["Impressões", "Cliques", "Leads", "CTR", "CPC", "Investido"],
  },
  {
    name: "Shopee Ads",
    icon: ShopeeLogo,
    metrics: ["Impressões", "Cliques", "Pedidos", "ROAS", "Custo", "Investido"],
  },
];

const utilityCards = [
  {
    icon: CheckSquare,
    title: "Checklist inteligente",
    text: "Processo operacional padronizado para não perder entrega.",
  },
  {
    icon: LayoutTemplate,
    title: "Modelos reaproveitáveis",
    text: "Monte uma vez e use em escala com a equipe toda.",
  },
  {
    icon: Users,
    title: "Multi-gestor",
    text: "Acompanhe quem está operando, entregando e travando.",
  },
  {
    icon: Wallet,
    title: "Financeiro e saldo",
    text: "Leia rapidamente investimento, carteira e risco operacional.",
  },
  {
    icon: Trophy,
    title: "Conquistas e engajamento",
    text: "Gamificação para manter ritmo e disciplina de execução.",
  },
  {
    icon: Shield,
    title: "Entrega com validação",
    text: "Relatório exportado com rastreabilidade e aparência premium.",
  },
];

const FeaturesPage = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const collageRef = useRef<HTMLDivElement | null>(null);
  const utilitiesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (heroRef.current) {
      animate(heroRef.current.querySelectorAll("[data-hero-copy]"), {
        translateY: [28, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        delay: stagger(90),
        duration: 900,
      });
    }

    if (collageRef.current) {
      animate(collageRef.current.querySelectorAll("[data-collage-card]"), {
        translateY: [40, 0],
        translateX: (_el, i) => [i === 1 ? 36 : i === 2 ? -28 : 0, 0],
        rotate: (_el, i) => [i === 1 ? 3 : i === 2 ? -3 : 0, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        delay: stagger(140),
        duration: 1200,
      });
    }

    if (utilitiesRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          animate(utilitiesRef.current?.querySelectorAll("[data-utility-card]") ?? [], {
            translateY: [24, 0],
            opacity: [0, 1],
            scale: [0.98, 1],
            easing: "easeOutQuad",
            delay: stagger(70),
            duration: 700,
          });
          observer.disconnect();
        },
        { threshold: 0.2 }
      );
      observer.observe(utilitiesRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <PublicLayout>
      <SEOHead
        title="Funcionalidades"
        description="Veja o Vurp em funcionamento: relatórios premium, templates, dashboard gerencial, checklist, calendário e operação integrada para gestores de tráfego e agências."
        path="/features"
        breadcrumbs={[{ name: "Funcionalidades", path: "/features" }]}
      />

      <section className="relative overflow-hidden pt-20 sm:pt-28 pb-12 sm:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(160,255,97,0.13),_transparent_32%),radial-gradient(circle_at_20%_30%,_rgba(255,184,0,0.08),_transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 xl:grid-cols-[0.9fr_1.1fr]">
            <div ref={heroRef} className="max-w-2xl">
              <div data-hero-copy className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
                <Sparkles className="h-3.5 w-3.5" />
                Produto real, não mockup genérico
              </div>
              <h1 data-hero-copy className="max-w-4xl text-4xl font-black leading-[0.92] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl xl:text-[5.2rem]">
                Funcionalidades pensadas para operar uma agência inteira.
              </h1>
              <p data-hero-copy className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                O Vurp junta rotina, templates, relatórios, financeiro e gestão de carteira numa única interface. Em vez de vender promessa abstrata, esta página mostra o produto em uso.
              </p>
              <div data-hero-copy className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="h-14 rounded-2xl px-8 text-base font-bold">
                    Começar grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/[0.03] px-8 text-base font-semibold text-foreground hover:bg-white/[0.06]">
                    Ver planos
                  </Button>
                </Link>
              </div>
              <div data-hero-copy className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-xl font-black text-foreground">{stat.value}</div>
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={collageRef} className="relative min-h-[480px] sm:min-h-[620px]">
              {showcaseCards.map((card, index) => (
                <div
                  key={card.title}
                  data-collage-card
                  className={[
                    "absolute overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/85 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl",
                    index === 0 ? "left-0 top-0 w-[92%] sm:w-[88%]" : "right-0 top-[18%] w-[74%] sm:w-[66%]" ,
                    index === 2 ? "bottom-0 left-[8%] w-[78%] sm:w-[64%]" : "",
                  ].join(" ")}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.tone}`} />
                  <div className="relative border-b border-white/8 px-5 py-4">
                    <div className="text-sm font-semibold text-foreground">{card.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{card.copy}</div>
                  </div>
                  <div className="relative p-3 sm:p-4">
                    <img src={card.image} alt={card.title} className="h-auto w-full rounded-[20px] border border-white/8 object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-5">
            {platformCards.map((platform) => (
              <div key={platform.name} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/8">
                    <platform.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{platform.name}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {platform.metrics.map((metric) => (
                    <span key={metric} className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl space-y-20 px-4 sm:px-6 lg:px-8">
          {featureRows.map((row, index) => {
            const Icon = row.icon;
            return (
              <div key={row.title} className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
                    <Icon className="h-3.5 w-3.5" />
                    {row.eyebrow}
                  </div>
                  <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
                    {row.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                    {row.description}
                  </p>
                  <div className="mt-7 space-y-3">
                    {row.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 text-sm leading-6 text-foreground/85 sm:text-base">
                        <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-400" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    <img src={row.image} alt={row.title} className="h-auto w-full rounded-[22px] border border-white/8 object-cover" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
              <Layers3 className="h-3.5 w-3.5" />
              Módulos que se conectam
            </div>
            <h2 className="text-3xl font-black tracking-[-0.03em] text-foreground sm:text-4xl">
              O produto não termina no relatório.
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">
              Ele continua no processo, na operação e no acompanhamento da equipe. É isso que faz a plataforma parecer um sistema, não um conjunto solto de telas.
            </p>
          </div>

          <div ref={utilitiesRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {utilityCards.map((card) => {
              const Icon = card.icon;
              return (
                <div data-utility-card key={card.title} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6 opacity-0">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-6 sm:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(160,255,97,0.12),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-12">
            <h2 className="text-3xl font-black tracking-[-0.03em] text-foreground sm:text-4xl">
              Se a sua operação cresceu, a interface precisa acompanhar.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              O Vurp foi desenhado para reduzir esforço manual, aumentar padrão de entrega e dar leitura gerencial em tempo real. Isso é o que as funcionalidades precisam provar.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="h-14 rounded-2xl px-8 text-base font-bold">
                  Testar o Vurp
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="h-14 rounded-2xl border-white/10 bg-white/[0.03] px-8 text-base font-semibold text-foreground hover:bg-white/[0.06]">
                  Ver planos e limites
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FeaturesPage;
