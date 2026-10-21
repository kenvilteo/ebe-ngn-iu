import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDatePlanner } from "../../hooks/useDatePlanner";

const W = 400;
const H = 220;
const REVEAL_AT = 60;

export default function ScratchStep() {
  const { next } = useDatePlanner();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const scratching = useRef(false);
  const done = useRef(false);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(false);

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#F9C9DA");
    grad.addColorStop(0.5, "#F6A9C4");
    grad.addColorStop(1, "#F17CA2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 46; i++) {
      const x = (i * 67) % W;
      const y = (i * 41) % H;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#fff";
    // Canvas không đọc được class Tailwind, nên stack này phải khớp tay với
    // fontFamily.display trong tailwind.config.js. Để weight 400 cho khớp mọi
    // chỗ dùng font-display khác — canvas vẽ trước khi webfont tải xong sẽ dùng
    // font dự phòng và KHÔNG tự vẽ lại, nên đừng đòi weight chưa chắc có.
    ctx.font = "400 30px 'Playfair Display', Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("scratch me ✨", W / 2, H / 2 - 8);
    ctx.font = "500 15px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText("go on, use your finger", W / 2, H / 2 + 24);
  }, []);

  useEffect(() => {
    paintCover();
  }, [paintCover]);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setRevealed(true);
  }, []);

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || done.current) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    try {
      const data = ctx.getImageData(0, 0, W, H).data;
      let transparent = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 12) {
        total++;
        if (data[i] < 128) transparent++;
      }
      const pct = (transparent / total) * 100;
      if (pct >= REVEAL_AT) finish();
    } catch {
      // canvas tainted (shouldn't happen) — keep manual reveal available
    }
  }, [finish]);

  const eraseAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || done.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      const y = ((clientY - rect.top) / rect.height) * H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      moves.current += 1;
      if (moves.current % 6 === 0) checkProgress();
    },
    [checkProgress]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (e: PointerEvent) => {
      scratching.current = true;
      canvas.setPointerCapture?.(e.pointerId);
      eraseAt(e.clientX, e.clientY);
    };
    const move = (e: PointerEvent) => {
      if (!scratching.current) return;
      e.preventDefault();
      eraseAt(e.clientX, e.clientY);
    };
    const up = () => {
      scratching.current = false;
      checkProgress();
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [eraseAt, checkProgress]);

  return (
    <div className="flex min-h-[68dvh] flex-col items-center justify-center text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush">step 02 — almost there</p>
      <h2 className="mt-2 font-display text-4xl text-ink sm:text-5xl">one tiny thing first…</h2>

      <div ref={wrapRef} className="relative mt-8 w-full max-w-[400px]">
        <div className="flex h-[220px] w-full flex-col items-center justify-center rounded-[22px] border border-[#F3D9E3] bg-white px-6 shadow-card">
          <p className="font-display text-[1.7rem] leading-snug text-ink">
            You just unlocked
            <br />a date 💖
          </p>
          <p className="mt-2 text-sm italic text-muted">no refunds btw</p>
        </div>
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="absolute inset-0 h-full w-full cursor-cell touch-none rounded-[22px] shadow-card"
            aria-label="Scratch card. Scratch to reveal a hidden message, or use the Reveal button."
          />
        )}
      </div>

      <div className="mt-6 flex min-h-[56px] items-center">
        {revealed ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={next}
            className="min-h-[52px] rounded-full bg-raspberry px-8 font-semibold text-white shadow-soft hover:bg-raspberry-dark"
          >
            continue →
          </motion.button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="min-h-[44px] rounded-full border border-[#E5CBD6] bg-white px-6 text-sm font-medium text-muted hover:text-raspberry"
          >
            Reveal (no scratching)
          </button>
        )}
      </div>
    </div>
  );
}
