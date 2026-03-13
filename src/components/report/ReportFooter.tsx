import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy } from "lucide-react";

interface ReportFooterProps {
    reportData: any;
    cliente: any;
}

export const ReportFooter = ({ reportData, cliente }: ReportFooterProps) => {
    const isExporting = Boolean(reportData?.isGeneratingPDF);
    const baseUrl = (import.meta.env.VITE_SITE_URL || "https://vurp.space").replace(/\/$/, "");
    const validationUrl = reportData?.validationId
        ? `${baseUrl}/validar-relatorio?id=${reportData.validationId}`
        : `${baseUrl}/validar-relatorio`;

    const handleCopy = async (value?: string) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // no-op: keep silent to avoid breaking PDF/preview flows
        }
    };

    const fieldClass =
        "h-7 min-w-0 sm:min-w-[250px] w-full max-w-full rounded border border-[#ffb500]/20 bg-[#ffb500]/5 px-2.5 flex items-center text-[9px] text-[#ffb500] font-mono font-black tracking-[0.08em] select-text";

    return (
        <div className="mt-10 pt-8 border-t border-white/10">
            {/* Client info + Date */}
            <div className="flex items-center justify-between mb-6 opacity-80">
                <div className="flex items-center gap-3">
                    {cliente?.logo_url || (cliente?.agencias as any)?.logo_url ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-black/40 p-1 border border-[#ffb500]/20">
                            <img
                                src={cliente.logo_url || (cliente?.agencias as any)?.logo_url}
                                alt={cliente.nome}
                                className="max-w-full max-h-full object-contain"
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ffb500] to-[#cc9200] flex items-center justify-center">
                            <span className="text-lg font-black text-black">{cliente?.nome?.charAt(0)}</span>
                        </div>
                    )}
                    <p className="text-[10px] font-black text-[#ffb500] tracking-[0.15em] uppercase">{cliente?.nome}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-0.5">Emitido em</p>
                    <p className="text-[10px] text-white font-bold tracking-wider">
                        {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>

            {/* Validation Footer */}
            {(reportData.validationId || reportData.validationPassword) && (
                <div className="pt-5 border-t border-white/[0.05]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4">
                        {reportData.validationId && (
                            <div className="space-y-1 flex-1 min-w-0">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">ID de Validação</p>
                                <div className="flex items-center gap-1.5">
                                    <div className={fieldClass}>
                                        <span className="truncate">{reportData.validationId}</span>
                                    </div>
                                    {!isExporting && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(reportData.validationId)}
                                            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-[#ffb500]/20 bg-[#ffb500]/5 text-[#ffb500] hover:bg-[#ffb500]/10 transition-colors"
                                            aria-label="Copiar ID"
                                            title="Copiar ID"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {reportData.validationPassword && (
                            <div className="space-y-1 flex-shrink-0">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Chave de Acesso</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-7 w-[100px] rounded border border-[#ffb500]/20 bg-[#ffb500]/5 px-2.5 flex items-center text-[9px] text-[#ffb500] font-mono font-black tracking-[0.08em]">
                                        <span>{reportData.validationPassword}</span>
                                    </div>
                                    {!isExporting && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(reportData.validationPassword)}
                                            className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-[#ffb500]/20 bg-[#ffb500]/5 text-[#ffb500] hover:bg-[#ffb500]/10 transition-colors"
                                            aria-label="Copiar Chave"
                                            title="Copiar Chave"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validation URL — clickable link */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] flex-shrink-0">Verificar autenticidade:</p>
                        <a
                            href={validationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-[#ffb500] font-bold hover:text-[#ffd700] transition-colors underline underline-offset-2 break-all"
                        >
                            {validationUrl}
                        </a>
                        {!isExporting && (
                            <button
                                type="button"
                                onClick={() => handleCopy(validationUrl)}
                                className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-[#ffb500]/20 bg-[#ffb500]/5 text-[#ffb500] hover:bg-[#ffb500]/10 transition-colors"
                                aria-label="Copiar link"
                                title="Copiar link"
                            >
                                <Copy className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6 text-center border-t border-white/[0.02] pt-3">
                <p className="text-[7px] text-gray-600 font-bold tracking-[0.3em] uppercase">Relatório gerado por VURP</p>
            </div>
        </div>
    );
};
