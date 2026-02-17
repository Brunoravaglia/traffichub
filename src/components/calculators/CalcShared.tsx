import { useState } from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaMeta, FaTiktok, FaLinkedin } from "react-icons/fa6";

export const platforms = [
    { id: "meta", label: "Meta Ads", icon: FaMeta, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    { id: "google", label: "Google Ads", icon: FaGoogle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
    { id: "tiktok", label: "TikTok Ads", icon: FaTiktok, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30" },
    { id: "linkedin", label: "LinkedIn Ads", icon: FaLinkedin, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
];

export function PlatformSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {platforms.map((p) => (
                <button
                    key={p.id}
                    onClick={() => onChange(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === p.id
                            ? `${p.bg} ${p.color} ${p.border} border`
                            : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                        }`}
                >
                    <p.icon className="w-4 h-4" />
                    {p.label}
                </button>
            ))}
        </div>
    );
}

export function CalcInput({ label, placeholder, value, onChange, hint }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
            <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
            />
            {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
        </div>
    );
}

export function CalcResult({ items }: { items: { label: string; value: string; color?: string }[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-background/80 border border-border/50"
        >
            <div className={`grid grid-cols-${Math.min(items.length, 3)} gap-4 text-center`}>
                {items.map((item) => (
                    <div key={item.label}>
                        <p className={`text-2xl sm:text-3xl font-extrabold ${item.color || "text-foreground"}`}>
                            {item.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
