import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props { flipped: boolean; front: ReactNode; back: ReactNode; className?: string; delay?: number }

/** 3D Y-axis flip. `front` is the face-down side, `back` is revealed when flipped. Fades under reduced motion. */
export function FlipCard({ flipped, front, back, className, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={cn("relative", className)}>
        <motion.div className="absolute inset-0" animate={{ opacity: flipped ? 0 : 1 }} transition={{ duration: 0.2, delay }}>{front}</motion.div>
        <motion.div className="absolute inset-0" animate={{ opacity: flipped ? 1 : 0 }} transition={{ duration: 0.2, delay }}>{back}</motion.div>
      </div>
    );
  }
  return (
    <div className={cn("perspective relative", className)}>
      <motion.div
        className="preserve-3d absolute inset-0"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay }}
      >
        <div className="backface-hidden absolute inset-0">{front}</div>
        <div className="backface-hidden absolute inset-0 [transform:rotateY(180deg)]">{back}</div>
      </motion.div>
    </div>
  );
}
