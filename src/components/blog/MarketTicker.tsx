import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
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
            // AwesomeAPI - free, no key, Brazilian API
            // Fetch USD, BTC, EUR in BRL
            const [awesomeRes] = await Promise.all([
                fetch("https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL,EUR-BRL"),
            ]);

            const awesomeData = await awesomeRes.json();

            const parsed: MarketItem[] = [];

            // USD/BRL
            if (awesomeData.USDBRL) {
                const d = awesomeData.USDBRL;
                parsed.push({
                    label: "Dólar",
                    value: `R$ ${parseFloat(d.bid).toFixed(2)}`,
                    change: parseFloat(d.pctChange),
                    icon: <FaDollarSign className="w-4 h-4" />,
                    color: "text-green-400",
                });
            }

            // BTC/BRL
            if (awesomeData.BTCBRL) {
                const d = awesomeData.BTCBRL;
                const price = parseFloat(d.bid);
                parsed.push({
                    label: "Bitcoin",
                    value: price >= 1000
                        ? `R$ ${(price / 1000).toFixed(1)}k`
                        : `R$ ${price.toFixed(2)}`,
                    change: parseFloat(d.pctChange),
                    icon: <FaBitcoin className="w-4 h-4" />,
                    color: "text-orange-400",
                });
            }

            // EUR/BRL
            if (awesomeData.EURBRL) {
                const d = awesomeData.EURBRL;
                parsed.push({
                    label: "Euro",
                    value: `R$ ${parseFloat(d.bid).toFixed(2)}`,
                    change: parseFloat(d.pctChange),
                    icon: <span className="text-sm font-bold">€</span>,
                    color: "text-blue-400",
                });
            }

            // Gold via AwesomeAPI (XAU)
            try {
                const goldRes = await fetch("https://economia.awesomeapi.com.br/last/XAU-BRL");
                const goldData = await goldRes.json();
                if (goldData.XAUBRL) {
                    const g = goldData.XAUBRL;
                    parsed.push({
                        label: "Ouro",
                        value: `R$ ${parseFloat(g.bid).toFixed(0)}`,
                        change: parseFloat(g.pctChange),
                        icon: <span className="text-sm">🥇</span>,
                        color: "text-amber-400",
                    });
                }
            } catch {
                parsed.push({
                    label: "Ouro",
                    value: "-",
                    change: 0,
                    icon: <span className="text-sm">🥇</span>,
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
            <div className="flex items-center justify-center gap-2 py-3 bg-card/50 border border-border/30 rounded-xl">
                <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
                <span className="text-xs text-muted-foreground">Carregando cotações...</span>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl bg-card/60 backdrop-blur-sm border border-border/40"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cotações em Tempo Real
                    </span>
                </div>
                {lastUpdate && (
                    <span className="text-[10px] text-muted-foreground">
                        Atualizado às {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                )}
            </div>

            {/* Ticker items */}
            <div className="flex items-stretch divide-x divide-border/30">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-3 hover:bg-card/80 transition-colors"
                    >
                        <span className={item.color}>{item.icon}</span>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] text-muted-foreground leading-none mb-0.5">
                                {item.label}
                            </span>
                            <span className="text-sm font-semibold text-foreground leading-none">
                                {item.value}
                            </span>
                        </div>
                        {item.change !== 0 && (
                            <span
                                className={`flex items-center gap-0.5 text-[11px] font-medium ${item.change > 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {item.change > 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {item.change > 0 ? "+" : ""}
                                {item.change.toFixed(2)}%
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default MarketTicker;
