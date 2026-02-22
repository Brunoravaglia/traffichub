import React, { useState } from 'react';
import { GradientButton } from './gradient-button';
import { ChevronRight, BarChart3, Users, Zap, Search, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Data for the Vurp image accordion ---
const accordionItems = [
    {
        id: 1,
        title: 'CRM de Clientes',
        description: 'Gestão completa da carteira com histórico e status em tempo real.',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
        icon: Users
    },
    {
        id: 2,
        title: 'Relatórios Premium',
        description: 'Dashboards elegantes em Black & Gold para impressionar seus clientes.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bbdac8626ad1?q=80&w=2070&auto=format&fit=crop',
        icon: BarChart3
    },
    {
        id: 3,
        title: 'Insights Estratégicos',
        description: 'Análise inteligente de performance com benchmarks de agência.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
        icon: Zap
    },
    {
        id: 4,
        title: 'Controle Financeiro',
        description: 'Gestão de saldos, budgets e previsões de investimento.',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop',
        icon: Search
    },
    {
        id: 5,
        title: 'Setup Técnico',
        description: 'Checklist completo de tags, pixels e integrações vitais.',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010badcc3e?q=80&w=2091&auto=format&fit=crop',
        icon: ShieldCheck
    },
];

// --- Accordion Item Component ---
const AccordionItem = ({ item, isActive, onMouseEnter }) => {
    const Icon = item.icon;

    return (
        <div
            className={cn(
                "relative h-[500px] rounded-2xl overflow-hidden cursor-pointer",
                "transition-all duration-700 ease-in-out border border-white/5",
                isActive ? "w-[450px]" : "w-[80px]"
            )}
            onMouseEnter={onMouseEnter}
        >
            {/* Background Image */}
            <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                    (e.target as any).onerror = null;
                    (e.target as any).src = 'https://placehold.co/400x500/011a0a/ffffff?text=VCD+Vurp';
                }}
            />
            {/* Dark overlay for better text readability */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-500",
                isActive ? "opacity-90" : "opacity-60"
            )}></div>

            {/* Content */}
            <div className={cn(
                "absolute inset-x-0 bottom-0 p-6 flex flex-col transition-all duration-500",
                isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/20 border border-primary/20 backdrop-blur-md">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-300 font-medium leading-relaxed max-w-[300px]">
                    {item.description}
                </p>
            </div>

            {/* Vertical Caption for Inactive State */}
            <div
                className={cn(
                    "absolute text-white font-bold whitespace-nowrap uppercase tracking-[0.2em] text-xs",
                    "transition-all duration-500 ease-in-out flex items-center gap-4",
                    isActive
                        ? "opacity-0 invisible scale-90"
                        : "opacity-100 visible bottom-12 left-1/2 -translate-x-1/2 -rotate-90 origin-center"
                )}
            >
                <span className="w-8 h-[1px] bg-primary/50"></span>
                {item.title}
            </div>
        </div>
    );
};


// --- Main App Component ---
export function LandingAccordionItem() {
    const [activeIndex, setActiveIndex] = useState(2); // Set "Insights" as default active

    return (
        <div className="bg-[#020202] py-20 overflow-hidden relative font-inter">
            {/* Background Decor */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>

            <section className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

                    {/* Left Side: Text Content */}
                    <div className="w-full lg:w-[40%] text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest italic">All-in-one Growth OS</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8 italic uppercase">
                            O SISTEMA DEFINITIVO PARA <span className="text-primary tracking-normal not-italic underline decoration-primary/30 underline-offset-8">SCALAR</span> SUA AGÊNCIA.
                        </h1>

                        <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10 font-medium leading-[1.6]">
                            Acelere suas entregas e impressione seus clientes com uma infraestrutura premium de dashboards, analytics e produtividade focada em tráfego pago.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <GradientButton className="w-full sm:w-auto">
                                TESTAR AGORA
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </GradientButton>
                            <button className="px-8 py-3 rounded-lg border border-white/10 text-white font-bold hover:bg-white/5 transition-colors uppercase text-sm tracking-widest">
                                VER DEMONSTRAÇÃO
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Image Accordion */}
                    <div className="w-full lg:w-[60%] select-none">
                        <div className="flex flex-row items-center justify-center lg:justify-start gap-3 p-4">
                            {accordionItems.map((item, index) => (
                                <AccordionItem
                                    key={item.id}
                                    item={item}
                                    isActive={index === activeIndex}
                                    onMouseEnter={() => setActiveIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
