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
    return (
        <div className="p-10 pb-6 bg-gradient-to-b from-black/40 to-transparent">
            <div className="flex items-start justify-between mb-10">
                <div className="flex items-center gap-8">
                    {cliente?.logo_url || (cliente?.agencias as any)?.logo_url ? (
                        <div className="p-1 bg-gradient-to-br from-[#ffb500] to-[#cc9200] rounded-2xl shadow-[0_0_20px_rgba(255,181,0,0.2)]">
                            <div className="h-24 max-w-[280px] rounded-xl overflow-hidden flex items-center justify-center bg-black/90" style={{ height: '96px', maxWidth: '280px' }}>
                                <img
                                    src={cliente.logo_url || (cliente?.agencias as any)?.logo_url}
                                    alt={cliente.nome}
                                    className="w-full h-full object-contain p-2"
                                    style={{ height: '96px', width: '100%' }}
                                    crossOrigin="anonymous"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ffb500] to-[#cc9200] flex items-center justify-center shadow-xl">
                            <span className="text-4xl font-bold text-black tracking-widest">{cliente?.nome?.charAt(0)}</span>
                        </div>
                    )}
                    <div className="space-y-2 py-1">
                        <p
                            className={cn(
                                "text-4xl font-black tracking-tight uppercase leading-[1.12]",
                                isExporting
                                    ? "text-[#ffcc33]"
                                    : "text-transparent bg-clip-text bg-gradient-to-r from-[#ffb500] via-[#ffd700] to-[#cc9200]"
                            )}
                        >
                            {cliente?.nome}
                        </p>
                        <p className="text-xs text-gray-400 font-bold tracking-[0.3em] uppercase opacity-70">
                            Performance Analytics Report
                        </p>
                    </div>
                </div>
                <div className="text-right flex flex-col justify-center">
                    <h1 className="text-4xl font-light text-white mb-0 tracking-tighter leading-none opacity-40 italic">RESULTS</h1>
                    <h1
                        className={cn(
                            "text-5xl font-black mb-3 tracking-tighter leading-none",
                            isExporting
                                ? "text-[#ffcc33]"
                                : "text-transparent bg-clip-text bg-gradient-to-tr from-[#ffb500] to-[#ffd700]"
                        )}
                    >
                        INSIGHTS
                    </h1>
                    <div className="flex flex-col items-end gap-1">
                        <p className="text-sm text-[#ffb500] uppercase font-bold tracking-[0.2em] bg-[#ffb500]/10 px-3 py-1 rounded-sm border border-[#ffb500]/20">
                            {format(periodoInicio, "MMMM yyyy", { locale: ptBR })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-10">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#ffb500]/20 to-[#cc9200]/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative px-8 py-3 rounded-full bg-black/40 border border-[#ffb500]/30 backdrop-blur-sm">
                        <p className="text-xs text-gray-200 tracking-[0.25em] font-black uppercase flex items-center gap-3">
                            <span className={cn("w-1 h-1 rounded-full bg-[#ffb500]", !isExporting && "animate-pulse")}></span>
                            Período: {format(periodoInicio, "dd/MM")} — {format(periodoFim, "dd/MM")}
                            <span className={cn("w-1 h-1 rounded-full bg-[#ffb500]", !isExporting && "animate-pulse")}></span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
