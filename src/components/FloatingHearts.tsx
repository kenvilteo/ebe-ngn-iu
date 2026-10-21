import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface Heart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  char: string;
}

const CHARS = ["💗", "💖", "💕", "🤍", "🌸"];

export default function FloatingHearts({ density = 10 }: { density?: number }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const hearts = useMemo<Heart[]>(
    () =>
      Array.from({ length: density }, (_, i) => ({
        id: i,
        left: (i * 97) % 100,
        size: 12 + ((i * 37) % 14),
        duration: 9 + ((i * 53) % 8),
        delay: (i * 1.7) % 9,
        char: CHARS[i % CHARS.length],
      })),
    [density]
  );

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute bottom-[-40px]"
          style={{ left: `${h.left}%`, fontSize: h.size, opacity: 0.5 }}
          animate={{ y: [0, -(window.innerHeight + 120)], opacity: [0, 0.55, 0] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "linear" }}
        >
          {h.char}
        </motion.span>
      ))}
    </div>
  );
}
