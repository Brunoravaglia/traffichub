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

    const readonlyFieldClass =
        "h-7 min-w-0 sm:min-w-[250px] w-full max-w-full rounded border border-[#ffb500]/20 bg-[#ffb500]/5 px-2.5 text-[9px] leading-[1.2] text-[#ffb500] font-mono font-black tracking-[0.08em] select-text";

    return (
        <div className="mt-10 pt-8 border-t border-white/10">
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
                <div className="pt-5 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-5">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                        {reportData.validationId && (
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">ID de Validação</p>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="text"
                                        readOnly
                                        value={reportData.validationId}
                                        onFocus={(e) => e.currentTarget.select()}
                                        onClick={(e) => e.currentTarget.select()}
                                        className={readonlyFieldClass}
                                        aria-label="ID de Validação"
                                    />
                                    {!isExporting && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(reportData.validationId)}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#ffb500]/20 bg-[#ffb500]/5 text-[#ffb500] hover:bg-[#ffb500]/10 transition-colors"
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
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Chave de Acesso</p>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="text"
                                        readOnly
                                        value={reportData.validationPassword}
                                        onFocus={(e) => e.currentTarget.select()}
                                        onClick={(e) => e.currentTarget.select()}
                                        className="h-7 w-[120px] rounded border border-[#ffb500]/20 bg-[#ffb500]/5 px-2.5 text-[9px] leading-[1.2] text-[#ffb500] font-mono font-black tracking-[0.08em] select-text"
                                        aria-label="Chave de Acesso"
                                    />
                                    {!isExporting && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(reportData.validationPassword)}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#ffb500]/20 bg-[#ffb500]/5 text-[#ffb500] hover:bg-[#ffb500]/10 transition-colors"
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

                    <div className="flex flex-col items-center md:items-end gap-1.5">
                        <p className="text-[8px] font-black text-[#ffb500] uppercase tracking-[0.2em]">Verificar autenticidade:</p>
                        <input
                            type="text"
                            readOnly
                            value={validationUrl}
                            onFocus={(e) => e.currentTarget.select()}
                            onClick={(e) => e.currentTarget.select()}
                            className="h-7 w-full max-w-[340px] rounded border border-white/15 bg-white/[0.03] px-2.5 text-[9px] leading-[1.2] text-gray-300 font-bold select-text"
                            aria-label="Link de verificação"
                        />
                        {!isExporting && (
                            <div className="flex items-center gap-2">
                                <a
                                    href={validationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-gray-400 font-bold hover:text-[#ffb500] transition-colors"
                                >
                                    Abrir link
                                </a>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(validationUrl)}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded border border-[#ffb500]/20 bg-[#ffb500]/5 text-[#ffb500] hover:bg-[#ffb500]/10 transition-colors"
                                    aria-label="Copiar link"
                                    title="Copiar link"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            </div>
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
