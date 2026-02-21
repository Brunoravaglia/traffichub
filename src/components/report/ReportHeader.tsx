import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReportHeaderProps {
    cliente: any;
    periodoInicio: Date;
    periodoFim: Date;
}

export const ReportHeader = ({ cliente, periodoInicio, periodoFim }: ReportHeaderProps) => {
    return (
        <div className="p-8 pb-4">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                    {cliente?.logo_url ? (
                        <div className="h-24 max-w-[280px] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-black/20" style={{ height: '96px', maxWidth: '280px' }}>
                            <img
                                src={cliente.logo_url}
                                alt={cliente.nome}
                                className="w-full h-full object-cover"
                                style={{ height: '96px', width: '100%', objectFit: 'cover' }}
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-[#ffb500]/10 border border-[#ffb500]/20 text-[#ffb500] flex items-center justify-center shadow-lg">
                            <span className="text-4xl font-medium tracking-widest">{cliente?.nome?.charAt(0)}</span>
                        </div>
                    )}
                    <div className="space-y-1">
                        <p className="text-3xl font-bold text-[#ffb500] tracking-wide uppercase leading-tight">{cliente?.nome}</p>
                        <p className="text-sm text-gray-400 font-normal tracking-wider">Relatório de Performance</p>
                    </div>
                </div>
                <div className="text-right flex flex-col justify-center">
                    <h1 className="text-3xl font-medium text-white mb-1 tracking-wider leading-none">RESULTADOS DE</h1>
                    <h1 className="text-3xl font-extrabold text-[#ffb500] mb-2 tracking-wider leading-none">CAMPANHA</h1>
                    <p className="text-xl text-gray-500 uppercase font-medium tracking-widest">
                        Mês de {format(periodoInicio, "MMMM", { locale: ptBR })}
                    </p>
                </div>
            </div>

            <div className="text-center mb-8">
                <span className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 tracking-[0.2em] font-bold uppercase">
                    Campanhas de {format(periodoInicio, "dd/MM")} à {format(periodoFim, "dd/MM")}
                </span>
            </div>
        </div>
    );
};
