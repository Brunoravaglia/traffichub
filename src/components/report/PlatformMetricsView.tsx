import { type ReactNode } from "react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PrimaryMetric {
  label: string;
  value: string | number;
  icon: string;
  isCurrency?: boolean;
}

interface AdditionalMetric {
  label: string;
  value: string | number;
}

interface PlatformMetricsViewProps {
  title: string;
  logo: ReactNode;
  primaryMetrics: PrimaryMetric[];
  additionalMetrics?: AdditionalMetric[];
}

const getPrimaryMetricValueClass = (value: string, isInvested = false) => {
  const len = value.length;
  if (isInvested) {
    if (len <= 10) return "text-[clamp(1.2rem,1.8vw,1.95rem)]";
    if (len <= 13) return "text-[clamp(1.05rem,1.55vw,1.6rem)]";
    if (len <= 16) return "text-[clamp(0.94rem,1.25vw,1.25rem)]";
    return "text-[clamp(0.86rem,1.05vw,1.08rem)]";
  }

  if (len <= 8) return "text-[clamp(1.2rem,1.85vw,2rem)]";
  if (len <= 11) return "text-[clamp(1.05rem,1.55vw,1.6rem)]";
  if (len <= 14) return "text-[clamp(0.94rem,1.25vw,1.25rem)]";
  return "text-[clamp(0.86rem,1.05vw,1.08rem)]";
};

const getAdditionalMetricValueClass = (value: string) => {
  const len = value.length;
  if (len <= 9) return "text-[clamp(0.9rem,1.2vw,1.05rem)]";
  if (len <= 12) return "text-[clamp(0.82rem,1.05vw,0.96rem)]";
  if (len <= 15) return "text-[clamp(0.76rem,0.95vw,0.88rem)]";
  return "text-[clamp(0.72rem,0.88vw,0.82rem)]";
};

const toDisplay = (value: string | number, isCurrency?: boolean) =>
  isCurrency ? formatCurrency(Number(value) || 0) : typeof value === "number" ? formatNumber(value) : value;

export function PlatformMetricsView({
  title,
  logo,
  primaryMetrics,
  additionalMetrics = [],
}: PlatformMetricsViewProps) {
  return (
    <div className="mb-8 p-10 rounded-[2.5rem] bg-gradient-to-br from-black/60 to-black/30 border border-[#ffb500]/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32" />

      <div className="flex items-center mb-8 relative">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-[#ffb500]/20 to-transparent rounded-2xl border border-[#ffb500]/20 shadow-[0_0_15px_rgba(255,181,0,0.1)]">
            {logo}
          </div>
          <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase">{title}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 relative">
        {primaryMetrics.map((metric) => {
          const value = toDisplay(metric.value, metric.isCurrency);
          return (
            <div key={metric.label} className="min-w-0 min-h-[144px] p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ffb500]/30 transition-all duration-500 group/item">
              <p
                className={`block w-full font-black text-white mb-2 tracking-tight whitespace-normal break-all leading-[1.3] tabular-nums group-hover:text-[#ffb500] transition-colors ${
                  metric.isCurrency
                    ? getPrimaryMetricValueClass(String(value), true)
                    : getPrimaryMetricValueClass(String(value))
                }`}
                title={String(value)}
              >
                {value}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-50">{metric.icon}</span>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {additionalMetrics.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {additionalMetrics.map((metric) => {
            const value = String(metric.value);
            return (
              <div key={metric.label} className="min-w-0 min-h-[108px] p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300">
                <p
                  className={`${getAdditionalMetricValueClass(value)} block w-full font-bold text-[#ffb500] mb-1 tracking-tight whitespace-normal break-all leading-[1.25] tabular-nums`}
                  title={value}
                >
                  {value}
                </p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em]">{metric.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
