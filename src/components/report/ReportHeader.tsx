import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReportHeaderProps {
    cliente: any;
    periodoInicio: Date;
    periodoFim: Date;
    isExporting?: boolean;
}

export const ReportHeader = ({ cliente, periodoInicio, periodoFim, isExporting = false }: ReportHeaderProps) => {
    const monthName = format(periodoInicio, "MMMM", { locale: ptBR });
    const year = format(periodoInicio, "yyyy");

    return (
        <div className="p-4 sm:p-10 pb-4 sm:pb-6 bg-gradient-to-b from-black/40 to-transparent overflow-hidden w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 sm:mb-8 text-center sm:text-left gap-5 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {cliente?.logo_url || (cliente?.agencias as any)?.logo_url ? (
                        <div className="p-1 bg-gradient-to-br from-[#ffb500] to-[#cc9200] rounded-2xl shadow-[0_0_20px_rgba(255,181,0,0.2)] flex-shrink-0">
                            <div className="rounded-xl overflow-hidden flex items-center justify-center bg-black/90 p-2">
                                <img
                                    src={cliente.logo_url || (cliente?.agencias as any)?.logo_url}
                                    alt={cliente.nome}
                                    className="h-14 sm:h-20 w-auto object-contain"
                                    crossOrigin="anonymous"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#ffb500] to-[#cc9200] flex items-center justify-center shadow-xl flex-shrink-0">
                            <span className="text-3xl sm:text-4xl font-bold text-black tracking-widest">{cliente?.nome?.charAt(0)}</span>
                        </div>
                    )}
                    <div className="space-y-1 py-0 sm:py-1">
                        <p
                            className={cn(
                                "text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase leading-[1.12] break-words max-w-full",
                                isExporting
                                    ? "text-[#ffcc33]"
                                    : "text-transparent bg-clip-text bg-gradient-to-r from-[#ffb500] via-[#ffd700] to-[#cc9200]"
                            )}
                        >
                            {cliente?.nome}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                            Relatório de Performance
                        </p>
                    </div>
                </div>

                {/* Date badge — premium stacked design */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        {!isExporting && (
                            <div className="absolute -inset-1 bg-gradient-to-br from-[#ffb500]/20 to-[#cc9200]/10 rounded-xl blur-sm" />
                        )}
                        <div className="relative bg-gradient-to-br from-[#ffb500] to-[#cc9200] rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-center shadow-lg">
                            <p className="text-[9px] sm:text-[10px] font-black text-black/60 uppercase tracking-[0.3em] leading-none mb-0.5">
                                {monthName}
                            </p>
                            <p className="text-lg sm:text-xl font-black text-black leading-none tracking-tight">
                                {year}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#ffb500]/15 to-[#cc9200]/15 rounded-full blur opacity-30"></div>
                    <div className="relative px-5 sm:px-8 py-2 rounded-full bg-black/40 border border-[#ffb500]/20 backdrop-blur-sm flex items-center justify-center">
                        <span className={cn("w-1.5 h-1.5 rounded-full bg-[#ffb500] flex-shrink-0", !isExporting && "animate-pulse")}></span>
                        <p className="text-[10px] sm:text-xs text-gray-300 tracking-[0.15em] sm:tracking-[0.2em] font-bold uppercase mx-3">
                            {format(periodoInicio, "dd/MM")} — {format(periodoFim, "dd/MM/yyyy")}
                        </p>
                        <span className={cn("w-1.5 h-1.5 rounded-full bg-[#ffb500] flex-shrink-0", !isExporting && "animate-pulse")}></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
