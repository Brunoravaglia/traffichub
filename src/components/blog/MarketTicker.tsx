import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Clock } from "lucide-react";
import {
    FaBitcoin,
    FaDollarSign,
    FaEthereum,
} from "react-icons/fa6";
import { SiSolana } from "react-icons/si";

interface MarketItem {
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: string;
}

const REFRESH_INTERVAL = 60_000; // 1 minute
const formatCurrency = (value: number, decimals = 2) =>
    `R$ ${value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}`;

const MarketTicker = () => {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchMarketData = async () => {
        try {
            const [awesomeRes, usdtRes] = await Promise.allSettled([
                fetch("https://economia.awesomeapi.com.br/last/BTC-BRL,ETH-BRL,SOL-BRL"),
                fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=USDTBRL"),
            ]);

            const awesomeData =
                awesomeRes.status === "fulfilled" && awesomeRes.value.ok
                    ? await awesomeRes.value.json()
                    : {};

            const usdtData =
                usdtRes.status === "fulfilled" && usdtRes.value.ok
                    ? await usdtRes.value.json()
                    : null;

            const parsed: MarketItem[] = [];

            if (awesomeData.BTCBRL) {
                const d = awesomeData.BTCBRL;
                const price = parseFloat(d.bid);
                parsed.push({
                    label: "Bitcoin (BTC)",
                    value: `R$ ${Math.round(price).toLocaleString("pt-BR")}`,
                    change: parseFloat(d.pctChange),
                    icon: <FaBitcoin className="h-4 w-4 sm:h-5 sm:w-5" />,
                    color: "text-orange-400",
                });
            }

            if (awesomeData.ETHBRL) {
                const d = awesomeData.ETHBRL;
                parsed.push({
                    label: "Ethereum (ETH)",
                    value: `R$ ${Math.round(parseFloat(d.bid)).toLocaleString("pt-BR")}`,
                    change: parseFloat(d.pctChange),
                    icon: <FaEthereum className="h-4 w-4 sm:h-5 sm:w-5" />,
                    color: "text-indigo-400",
                });
            }

            if (awesomeData.SOLBRL) {
                const d = awesomeData.SOLBRL;
                parsed.push({
                    label: "Solana (SOL)",
                    value: formatCurrency(parseFloat(d.bid), 2),
                    change: parseFloat(d.pctChange),
                    icon: <SiSolana className="h-4 w-4 sm:h-5 sm:w-5" />,
                    color: "text-violet-400",
                });
            }

            if (usdtData?.lastPrice) {
                const usdtPrice = parseFloat(usdtData.lastPrice);
                const usdtChange = parseFloat(usdtData.priceChangePercent ?? "0");
                parsed.push({
                    label: "Tether (USDT)",
                    value: formatCurrency(usdtPrice, 2),
                    change: usdtChange,
                    icon: <FaDollarSign className="h-4 w-4 sm:h-5 sm:w-5" />,
                    color: "text-emerald-400",
                });
            } else {
                parsed.push({
                    label: "Tether (USDT)",
                    value: "-",
                    change: 0,
                    icon: <FaDollarSign className="h-4 w-4 sm:h-5 sm:w-5" />,
                    color: "text-emerald-400",
                });
            }

            // Never let the widget disappear entirely.
            if (parsed.length === 0) {
                parsed.push(
                    {
                        label: "Bitcoin (BTC)",
                        value: "-",
                        change: 0,
                        icon: <FaBitcoin className="h-4 w-4 sm:h-5 sm:w-5" />,
                        color: "text-orange-400",
                    },
                    {
                        label: "Ethereum (ETH)",
                        value: "-",
                        change: 0,
                        icon: <FaEthereum className="h-4 w-4 sm:h-5 sm:w-5" />,
                        color: "text-indigo-400",
                    },
                    {
                        label: "Solana (SOL)",
                        value: "-",
                        change: 0,
                        icon: <SiSolana className="h-4 w-4 sm:h-5 sm:w-5" />,
                        color: "text-violet-400",
                    },
                    {
                        label: "Tether (USDT)",
                        value: "-",
                        change: 0,
                        icon: <FaDollarSign className="h-4 w-4 sm:h-5 sm:w-5" />,
                        color: "text-emerald-400",
                    }
                );
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
        <section className="space-y-2">
            {/* Header / Meta Info */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/80">
                        Cripto em Alta
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase tracking-wider">
                        Live
                    </span>
                </div>
                {lastUpdate && (
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium uppercase tracking-tight">
                        <Clock className="w-2.5 h-2.5" />
                        Atualizado {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                )}
            </div>

            {/* Ticker Grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item, i) => (
                    <motion.a
                        key={item.label}
                        href="https://www.binance.com/referral/earn-together/refer2earn-usdc/claim?hl=pt-BR&ref=GRO_28502_WCBJT&utm_source=default"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="group relative block"
                    >
                        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/0 via-primary/25 to-accent/0 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60 group-active:opacity-60" />
                        <div className="relative h-[86px] rounded-xl border border-border/50 bg-card/95 p-2 transition-all duration-300 sm:h-[104px] sm:p-2.5 group-hover:border-primary/45 group-active:border-primary/45 group-hover:shadow-[0_0_18px_hsl(var(--primary)/0.2),0_0_34px_hsl(var(--accent)/0.12)] group-active:shadow-[0_0_18px_hsl(var(--primary)/0.2),0_0_34px_hsl(var(--accent)/0.12)]">
                            <div className="relative flex h-full items-center rounded-lg border border-border/50 bg-background/35 px-2 py-2 sm:px-2.5 sm:py-2.5">
                                <div className="flex min-w-0 items-center gap-2 pr-2 sm:gap-3 sm:pr-24">
                                    <div className={`rounded-lg bg-muted/50 p-1.5 sm:p-2 ${item.color.replace('text-', 'bg-')}/10 ${item.color} shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="mb-0.5 truncate text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:text-[10px] sm:tracking-wider">
                                            {item.label}
                                        </p>
                                        <p className="whitespace-nowrap text-base font-black leading-none tracking-tight text-foreground tabular-nums sm:text-2xl">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                                {item.change !== 0 && (
                                    <div className={`absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-black whitespace-nowrap sm:right-2.5 sm:top-2.5 sm:gap-1 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs ${item.change > 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                        {item.change > 0 ? <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                                        {item.change > 0 ? "+" : ""}{item.change.toFixed(2)}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.a>
                ))}
            </div>
        </section>
    );
};

export default MarketTicker;
