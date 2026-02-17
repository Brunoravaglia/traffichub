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
        <div className="overflow-hidden tracking-tighter leading-[0.8] m-0 whitespace-nowrap flex flex-nowrap py-4">
            <motion.div
                style={{ x }}
                className="font-bold uppercase text-lg sm:text-2xl md:text-3xl flex whitespace-nowrap flex-nowrap will-change-transform text-primary dark:text-accent opacity-[0.15]"
            >
                <span className="block mr-12">{children} </span>
                <span className="block mr-12">{children} </span>
                <span className="block mr-12">{children} </span>
                <span className="block mr-12">{children} </span>
            </motion.div>
        </div>
    );
}

export default function ParallaxTextScroll() {
    return (
        <section className="relative w-full py-12 bg-background overflow-hidden border-y border-primary/10">
            {/* Background Grid */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #16DB65 1px, transparent 1px),
            linear-gradient(to bottom, #16DB65 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative z-10 flex flex-col gap-4">
                <ParallaxText baseVelocity={-2}>Gestão Profissional de Tráfego</ParallaxText>
                <ParallaxText baseVelocity={2}>Relatórios que Impressionam Clientes</ParallaxText>
                <ParallaxText baseVelocity={-1.5}>Escalabilidade para sua Agência</ParallaxText>
            </div>
        </section>
    );
}
