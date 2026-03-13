import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Copy, ExternalLink, ShieldCheck } from "lucide-react";

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
            // silent
        }
    };

    const hasValidation = reportData.validationId || reportData.validationPassword;
    const isPremium = Boolean((cliente?.agencias as any)?.id);

    return (
        <div className="mt-12">
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#ffb500]/30 to-transparent mb-8" />

            {/* Client row */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {cliente?.logo_url || (cliente?.agencias as any)?.logo_url ? (
                        <div className="h-8 rounded-md overflow-hidden flex items-center justify-center bg-black/40 px-1.5 py-1 border border-white/10">
                            <img
                                src={cliente.logo_url || (cliente?.agencias as any)?.logo_url}
                                alt={cliente.nome}
                                className="h-full w-auto object-contain"
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#ffb500] to-[#cc9200] flex items-center justify-center">
                            <span className="text-sm font-black text-black">{cliente?.nome?.charAt(0)}</span>
                        </div>
                    )}
                    <span className="text-[10px] font-black text-white/70 tracking-[0.15em] uppercase">{cliente?.nome}</span>
                </div>
                <span className="text-[10px] text-white/40 font-medium">
                    {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </span>
            </div>

            {/* Validation card */}
            {hasValidation && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#ffb500] flex-shrink-0" />
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Validação do Relatório</span>
                    </div>

                    {/* Fields row */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mb-4">
                        {reportData.validationId && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1">ID</p>
                                <div className="flex items-start gap-1.5">
                                    <code className="text-[8px] text-[#ffb500] font-mono font-bold tracking-wider break-all leading-relaxed">{reportData.validationId}</code>
                                    {!isExporting && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(reportData.validationId)}
                                            className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3 text-white" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {reportData.validationPassword && (
                            <div className="flex-shrink-0">
                                <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1">Senha</p>
                                <div className="flex items-center gap-1.5">
                                    <code className="text-[9px] text-[#ffb500] font-mono font-bold tracking-widest">{reportData.validationPassword}</code>
                                    {!isExporting && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(reportData.validationPassword)}
                                            className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3 text-white" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validation button */}
                    <div className="pt-3 border-t border-white/[0.04]">
                        <a
                            href={validationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffb500]/10 border border-[#ffb500]/20 text-[#ffb500] hover:bg-[#ffb500]/20 transition-colors text-[10px] font-bold tracking-wide"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Verificar Autenticidade
                        </a>
                    </div>
                </div>
            )}

            {/* VURP branding — only for basic clients (no agency) */}
            {!isPremium && (
                <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                    <div className="h-px w-8 bg-white/20" />
                    <p className="text-[7px] text-white font-bold tracking-[0.4em] uppercase">VURP</p>
                    <div className="h-px w-8 bg-white/20" />
                </div>
            )}
        </div>
    );
};
