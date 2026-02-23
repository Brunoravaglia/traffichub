import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportFooterProps {
    reportData: any;
    cliente: any;
}

export const ReportFooter = ({ reportData, cliente }: ReportFooterProps) => {
    return (
        <div className="mt-12 pt-10 border-t border-white/10">
            <div className="flex items-center justify-between mb-8 opacity-80">
                <div className="flex items-center gap-4">
                    {cliente?.logo_url || (cliente?.agencias as any)?.logo_url ? (
                        <div className="h-10 w-auto rounded-lg overflow-hidden flex items-center justify-center bg-black/40 p-1.5 border border-[#ffb500]/20">
                            <img
                                src={cliente.logo_url || (cliente?.agencias as any)?.logo_url}
                                alt={cliente.nome}
                                className="h-full w-full object-contain"
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ffb500] to-[#cc9200] flex items-center justify-center">
                            <span className="text-xl font-black text-black">{cliente?.nome?.charAt(0)}</span>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-black text-[#ffb500] tracking-[0.2em] uppercase">{cliente?.nome}</p>
                        <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">Certified Accountability</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">ISSUED ON</p>
                    <p className="text-xs text-white font-bold tracking-wider">
                        {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>

            {/* Validation Footer */}
            {(reportData.validationId || reportData.validationPassword) && (
                <div className="pt-6 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                        {reportData.validationId && (
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">VALIDATION ID</p>
                                <code className="inline-flex items-center text-[10px] leading-[1.25] text-[#ffb500] font-mono font-black tracking-[0.08em] bg-[#ffb500]/5 px-2.5 py-1 rounded border border-[#ffb500]/20 whitespace-nowrap">
                                    {reportData.validationId}
                                </code>
                            </div>
                        )}
                        {reportData.validationPassword && (
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">ACCESS KEY</p>
                                <code className="inline-flex items-center text-[10px] leading-[1.25] text-[#ffb500] font-mono font-black tracking-[0.08em] bg-[#ffb500]/5 px-2.5 py-1 rounded border border-[#ffb500]/20 whitespace-nowrap">
                                    {reportData.validationPassword}
                                </code>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                        <p className="text-[9px] font-black text-[#ffb500] uppercase tracking-[0.2em] mb-1">VERIFICAR AUTENTICIDADE EM:</p>
                        <a
                            href={`https://vurp.vercel.app/validar-relatorio?id=${reportData.validationId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-gray-400 font-bold hover:text-[#ffb500] transition-colors border-b border-white/10 pb-0.5"
                        >
                            vurp.vercel.app/validar-relatorio
                        </a>
                    </div>
                </div>
            )}

            <div className="mt-8 text-center border-t border-white/[0.02] pt-4">
                <p className="text-[8px] text-gray-600 font-bold tracking-[0.4em] uppercase">Powered by VURP Intelligent Marketing Systems</p>
            </div>
        </div>
    );
};
