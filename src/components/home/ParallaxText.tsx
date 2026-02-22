import { useRef } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame
} from "framer-motion";

// Wrap function (replacement for @motionone/utils)
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ParallaxProps {
    children: string;
    baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });

    /**
     * This is a magic number to around how much of the screen the text should take up.
     */
    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();
        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="overflow-hidden tracking-tight leading-[0.82] m-0 whitespace-nowrap flex flex-nowrap py-0.5 sm:py-1">
            <motion.div
                style={{ x }}
                className="font-extrabold uppercase text-sm sm:text-lg md:text-xl flex whitespace-nowrap flex-nowrap will-change-transform bg-gradient-to-r from-[#0a3b1f] via-[#10b65f] to-[#d9ff3f] bg-clip-text text-transparent opacity-[0.42] drop-shadow-[0_0_10px_rgba(120,255,80,0.14)]"
            >
                <span className="block mr-6 sm:mr-8">{children} </span>
                <span className="block mr-6 sm:mr-8">{children} </span>
                <span className="block mr-6 sm:mr-8">{children} </span>
                <span className="block mr-6 sm:mr-8">{children} </span>
                <span className="block mr-6 sm:mr-8">{children} </span>
                <span className="block mr-6 sm:mr-8">{children} </span>
            </motion.div>
        </div>
    );
}

export default function ParallaxTextScroll() {
    return (
        <section className="relative w-full py-3 sm:py-3.5 bg-background overflow-hidden border-y border-primary/15">
            {/* Background Grid */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(8, 74, 38, 0.55) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(160, 255, 48, 0.24) 1px, transparent 1px)
          `,
                    backgroundSize: '36px 36px'
                }}
            />

            <div className="relative z-10 flex flex-col gap-0.5">
                <ParallaxText baseVelocity={-2}>Gestão Profissional de Tráfego</ParallaxText>
                <ParallaxText baseVelocity={2}>Relatórios que Impressionam Clientes</ParallaxText>
                <ParallaxText baseVelocity={-1.5}>Escalabilidade para sua Agência</ParallaxText>
                <ParallaxText baseVelocity={1.8}>Dashboards Claros e Sem Planilhas Caóticas</ParallaxText>
                <ParallaxText baseVelocity={-1.2}>Mais Controle, Menos Retrabalho Operacional</ParallaxText>
            </div>
        </section>
    );
}
