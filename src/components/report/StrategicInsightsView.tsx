import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { Sparkles, TrendingUp, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StrategicInsightsViewProps {
    reportData: any;
}

export const StrategicInsightsView = ({ reportData }: StrategicInsightsViewProps) => {
    // Mock comparative data based on client investment
    const investido = (reportData.google?.investido || 0) + (reportData.meta?.investido || 0);

    const chartData = [
        { name: 'Set', client: investido * 0.8, average: investido * 0.9 },
        { name: 'Out', client: investido * 0.85, average: investido * 0.92 },
        { name: 'Nov', client: investido * 0.9, average: investido * 0.95 },
        { name: 'Dez', client: investido * 1.1, average: investido * 1.05 },
        { name: 'Jan', client: investido * 0.95, average: investido * 0.98 },
        { name: 'Fev', client: investido, average: investido * 1.02 },
    ];

    const healthMetrics = [
        { label: "Market Resonance", value: 88, color: "bg-emerald-500" },
        { label: "Budget Efficiency", value: 94, color: "bg-amber-500" },
        { label: "Creative Impact", value: 72, color: "bg-blue-500" },
    ];

    return (
        <div className="mb-12 space-y-8">
            {/* Premium Insight Alert */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group p-1 rounded-[2rem] bg-gradient-to-br from-[#ffb500] via-[#cc9200] to-transparent"
            >
                <div className="p-8 rounded-[1.9rem] bg-black/90 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffb500]/20 to-transparent flex items-center justify-center border border-[#ffb500]/30 shadow-[0_0_30px_rgba(255,181,0,0.1)]">
                            <TrendingUp className="w-10 h-10 text-[#ffb500]" />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <Sparkles className="w-5 h-5 text-[#ffb500]" />
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Cenário de Expansão</h3>
                            </div>
                            <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
                                Identificamos uma eficiência acima da média (+14%) em seus investimentos em comparação com o benchmark da agência.
                                <span className="text-white font-bold ml-1">Recomendamos escalar o orçamento em 15% nas campanhas de fundo de funil para o próximo ciclo.</span>
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 tracking-widest uppercase">
                                    <ShieldCheck className="w-3 h-3" /> ROI Saudável
                                </span>
                                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffb500]/10 border border-[#ffb500]/20 text-[10px] font-black text-[#ffb500] tracking-widest uppercase">
                                    <Zap className="w-3 h-3" /> Alta tração
                                </span>
                            </div>
                        </div>

                        <div className="px-8 py-4 rounded-3xl bg-white/[0.03] border border-white/10 text-center">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Growth Index</p>
                            <p className="text-4xl font-black text-white tracking-tighter">9.4<span className="text-sm text-[#ffb500]">/10</span></p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Benchmarking Chart */}
                <div className="lg:col-span-8 p-10 rounded-[2.5rem] bg-black/60 border border-white/5 relative overflow-hidden group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">Benchmark de Investimento</h3>
                            <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Comparative Monthly Analysis</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffb500]"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Marca</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Média Agência</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorClient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffb500" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ffb500" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,181,0,0.2)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#ffb500' }}
                                    labelStyle={{ color: '#fff', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="client"
                                    stroke="#ffb500"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorClient)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="average"
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth={2}
                                    fill="transparent"
                                    strokeDasharray="5 5"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Health Indicators */}
                <div className="lg:col-span-4 p-10 rounded-[2.5rem] bg-black/60 border border-white/5 space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase">Saúde Digital</h3>
                        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">Performance Health Score</p>
                    </div>

                    <div className="space-y-8">
                        {healthMetrics.map((m) => (
                            <div key={m.label} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                                    <p className="text-lg font-black text-white tracking-tighter">{m.value}%</p>
                                </div>
                                <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${m.value}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full ${m.color} relative`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 p-4 rounded-2xl bg-[#ffb500]/5 border border-[#ffb500]/10 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-[#ffb500]" />
                        <p className="text-[9px] text-gray-400 font-bold leading-tight">
                            Sua pontuação de impacto criativo está sendo o principal limitador de escala atualmente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
