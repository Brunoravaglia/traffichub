import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-3 pb-8 pt-28 sm:px-6 sm:pb-12 sm:pt-24 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(245,200,120,0.22),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_60%_75%,rgba(180,140,90,0.14),transparent_45%),linear-gradient(180deg,#030303_0%,#0a0908_45%,#040404_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1220px] rounded-[22px] border border-white/15 bg-black/35 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.65)] backdrop-blur-[2px] sm:rounded-[30px] sm:p-5 lg:p-6">
        <div className="mx-auto max-w-3xl px-1 pb-5 pt-3 text-center sm:px-4 sm:pb-7 sm:pt-7 lg:max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:px-4 sm:py-2 sm:text-xs sm:tracking-widest">
            Gerador de relatorios para gestores de trafego
          </div>

          <h1 className="mt-3 text-balance text-[1.9rem] font-black leading-[1.02] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl lg:text-[5rem]">
            Relatorios profissionais para
            <br />
            gestores de trafego.
          </h1>

          <p className="mx-auto mt-3 max-w-3xl text-[1.02rem] leading-relaxed text-white/70 sm:mt-4 sm:text-[1.35rem] sm:leading-relaxed md:text-[1.6rem] md:leading-relaxed">
            Organize seus dados, monte dashboards claros e entregue relatorios bonitos em PDF e link, com a marca da sua agencia.
          </p>

          <div className="mt-5 flex w-full flex-col items-stretch justify-center gap-2 sm:mt-7 sm:items-center md:flex-row">
            <div className="w-full rounded-[14px] border border-white/20 bg-white/10 p-0.5 sm:w-auto">
              <Button asChild size="lg" className="h-11 w-full rounded-xl px-5 text-[15px] font-bold sm:h-12 sm:w-auto sm:px-6">
                <Link to="/signup">Comecar Gratis</Link>
              </Button>
            </div>

            <div className="w-full rounded-[14px] border border-cyan-300/60 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 p-0.5 sm:w-auto">
              <Button
                asChild
                size="lg"
                className="h-11 w-full rounded-xl bg-white px-5 text-[15px] font-semibold text-black hover:bg-black hover:text-white sm:h-12 sm:w-auto sm:px-6"
              >
                <Link to="/modelos" className="inline-flex items-center gap-2">
                  Ver modelos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/20 bg-black/25 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:rounded-t-2xl sm:border-b-0 sm:p-2.5">
          <picture>
            <source media="(max-width: 639px)" srcSet="/hero-dashboard-mobile.webp" />
            <source media="(min-width: 640px)" srcSet="/hero-dashboard.webp" />
            <img
              src="/hero-dashboard.webp"
              alt="Painel Vurp"
              className="aspect-[16/10] w-full rounded-lg object-cover object-left-top sm:aspect-[15/8] sm:rounded-xl sm:object-top"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/hero-dashboard-vurp.png";
              }}
            />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
