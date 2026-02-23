import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-3 pb-6 pt-24 sm:px-6 sm:pb-10 sm:pt-24 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 26%, hsl(var(--primary) / 0.14), transparent 38%), radial-gradient(circle at 82% 18%, hsl(var(--accent) / 0.12), transparent 38%), radial-gradient(circle at 52% 72%, hsl(var(--foreground) / 0.06), transparent 46%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.97) 48%, hsl(var(--background)) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1220px] p-0 sm:rounded-[30px] sm:border sm:border-border/60 sm:bg-background/35 sm:p-5 sm:shadow-[0_24px_72px_hsl(var(--background)/0.45)] sm:backdrop-blur-sm lg:p-6">
        <div className="mx-auto max-w-3xl px-1 pb-5 pt-2 text-center sm:px-4 sm:pb-7 sm:pt-7 lg:max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-border/55 bg-card/25 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.11em] text-muted-foreground sm:px-4 sm:py-1 sm:text-[11px] sm:tracking-[0.14em]">
            Gerador de relatorios para gestores de trafego
          </div>

          <h1 className="mx-auto mt-3 max-w-[18ch] text-balance text-[clamp(1.7rem,6.8vw,3.35rem)] font-black leading-[1.05] tracking-[-0.02em] text-foreground sm:mt-5">
            Relatorios profissionais para gestores de trafego.
          </h1>

          <p className="mx-auto mt-3 max-w-[52ch] text-[1rem] leading-[1.5] text-muted-foreground sm:mt-5 sm:text-[1.04rem] md:text-[1.1rem]">
            Organize seus dados, monte dashboards claros e entregue relatorios bonitos em PDF e link, com a marca da sua agencia.
          </p>

          <div className="mt-5 flex w-full flex-col items-stretch justify-center gap-2 sm:mt-7 sm:items-center md:flex-row">
            <div className="w-full rounded-[14px] border border-border/70 bg-card/35 p-0.5 sm:w-auto">
              <Button asChild size="lg" className="h-11 w-full rounded-xl px-5 text-[15px] font-bold sm:h-11 sm:w-auto sm:px-6 focus-visible:ring-2 focus-visible:ring-primary/70">
                <Link to="/signup">Comecar Gratis</Link>
              </Button>
            </div>

            <div className="w-full rounded-[14px] border border-border/70 bg-gradient-to-r from-cyan-400/65 via-sky-500/55 to-fuchsia-400/55 p-0.5 sm:w-auto">
              <Button
                asChild
                size="lg"
                className="h-11 w-full rounded-xl bg-card/95 px-5 text-[15px] font-semibold text-foreground hover:bg-foreground hover:text-background sm:h-11 sm:w-auto sm:px-6 focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                <Link to="/signup" className="inline-flex items-center gap-2">
                  Ver modelos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border/55 bg-card/25 p-1 shadow-[0_18px_44px_hsl(var(--background)/0.38)] ring-1 ring-border/25 sm:rounded-t-2xl sm:border-b-0 sm:p-2">
          <img
            src="/hero-dashboard-vurp.png"
            alt="Painel Vurp"
            className="aspect-[16/10] w-full rounded-lg object-cover object-left-top sm:aspect-[15/8] sm:rounded-xl sm:object-top"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
