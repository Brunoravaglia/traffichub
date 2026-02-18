import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Clock } from "lucide-react";
import {
    FaBitcoin,
    FaDollarSign,
} from "react-icons/fa6";

interface MarketItem {
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: string;
}

const REFRESH_INTERVAL = 60_000; // 1 minute

const MarketTicker = () => {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchMarketData = async () => {
        try {
            const [awesomeRes] = await Promise.all([
                fetch("https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL,EUR-BRL"),
            ]);

            const awesomeData = await awesomeRes.json();
            const parsed: MarketItem[] = [];

            if (awesomeData.USDBRL) {
                const d = awesomeData.USDBRL;
                parsed.push({
                    label: "Dólar Comercial",
                    value: `R$ ${parseFloat(d.bid).toFixed(2)}`,
                    change: parseFloat(d.pctChange),
                    icon: <FaDollarSign className="w-6 h-6" />,
                    color: "text-emerald-400",
                });
            }

            if (awesomeData.BTCBRL) {
                const d = awesomeData.BTCBRL;
                const price = parseFloat(d.bid);
                parsed.push({
                    label: "Bitcoin (BTC)",
                    value: price >= 1000
                        ? `R$ ${(price / 1000).toFixed(1)}k`
                        : `R$ ${price.toFixed(2)}`,
                    change: parseFloat(d.pctChange),
                    icon: <FaBitcoin className="w-6 h-6" />,
                    color: "text-orange-400",
                });
            }

            if (awesomeData.EURBRL) {
                const d = awesomeData.EURBRL;
                parsed.push({
                    label: "Euro Comercial",
                    value: `R$ ${parseFloat(d.bid).toFixed(2)}`,
                    change: parseFloat(d.pctChange),
                    icon: <span className="text-xl font-bold">€</span>,
                    color: "text-blue-400",
                });
            }

            try {
                const goldRes = await fetch("https://economia.awesomeapi.com.br/last/XAU-BRL");
                const goldData = await goldRes.json();
                if (goldData.XAUBRL) {
                    const g = goldData.XAUBRL;
                    parsed.push({
                        label: "Ouro (Gramas)",
                        value: `R$ ${parseFloat(g.bid).toFixed(0)}`,
                        change: parseFloat(g.pctChange),
                        icon: <span className="text-xl font-bold">🪙</span>,
                        color: "text-amber-400",
                    });
                }
            } catch {
                parsed.push({
                    label: "Ouro",
                    value: "-",
                    change: 0,
                    icon: <span className="text-xl">🪙</span>,
                    color: "text-amber-400",
                });
            }

            setItems(parsed);
            setLastUpdate(new Date());
        } catch (err) {
            console.error("MarketTicker fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-3 py-6 bg-card/40 border border-border/20 rounded-2xl animate-pulse">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Sincronizando Mercado...</span>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <section className="space-y-4">
            {/* Header / Meta Info */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80">
                        Mercado em Tempo Real
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-wider">
                        Live
                    </span>
                </div>
                {lastUpdate && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        Última Atualização: {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                )}
            </div>

            {/* Ticker Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {items.map((item, i) => (
                    <motion.a
                        key={item.label}
                        href="https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=pt-BR&ref=GRO_28502_WCBJT&utm_source=default"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative block"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur" />
                        <div className="relative flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                            <div className="flex items-start justify-between">
                                <div className={`p-2.5 rounded-xl bg-muted/50 ${item.color.replace('text-', 'bg-')}/10 ${item.color} shadow-inner`}>
                                    {item.icon}
                                </div>
                                {item.change !== 0 && (
                                    <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black ${item.change > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                        {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {item.change > 0 ? "+" : ""}{item.change.toFixed(2)}%
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                    {item.label}
                                </p>
                                <p className="text-xl font-black text-foreground tracking-tight tabular-nums">
                                    {item.value}
                                </p>
                            </div>

                            {/* Decorative Sparkle Gradient */}
                            <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br ${item.color.replace('text-', 'from-')}/5 to-transparent rounded-br-2xl pointer-events-none opacity-50`} />
                        </div>
                    </motion.a>
                ))}
            </div>
        </section>
    );
};

export default MarketTicker;
