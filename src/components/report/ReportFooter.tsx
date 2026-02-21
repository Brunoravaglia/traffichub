import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportFooterProps {
    reportData: any;
}

export const ReportFooter = ({ reportData }: ReportFooterProps) => {
    return (
        <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center p-2">
                        <span className="text-xl font-bold text-white">V</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white tracking-widest uppercase">VCD PERFORMANCE</p>
                        <p className="text-[10px] text-gray-400 font-medium">Relatório Estratégico de Marketing</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">DATA DE EMISSÃO</p>
                    <p className="text-sm text-white font-medium">
                        {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
            </div>

            {/* Validation Footer */}
            {(reportData.id || reportData.validationPassword) && (
                <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-between gap-8">
                    <div className="flex items-center gap-10">
                        {reportData.id && (
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">ID DE VALIDAÇÃO</p>
                                <code className="text-xs text-[#ffb500] font-mono font-bold tracking-wider bg-[#ffb500]/5 px-2 py-0.5 rounded border border-[#ffb500]/10">
                                    {reportData.id}
                                </code>
                            </div>
                        )}
                        {reportData.validationPassword && (
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">SENHA DE ACESSO</p>
                                <code className="text-xs text-[#ffb500] font-mono font-bold tracking-wider bg-[#ffb500]/5 px-2 py-0.5 rounded border border-[#ffb500]/10">
                                    {reportData.validationPassword}
                                </code>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">AUTENTICIDADE</p>
                        <p className="text-[10px] text-gray-400 font-medium italic">Documento verificado e assinado digitalmente</p>
                    </div>
                </div>
            )}
        </div>
    );
};
