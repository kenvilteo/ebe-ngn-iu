import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function StepContainer({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[680px] flex-1 px-5 pb-16 pt-2 sm:px-8"
    >
      {children}
    </motion.main>
  );
}
