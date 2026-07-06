import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface Testimonial {
  name: string;
  text: string;
}

interface Props {
  testimonials: Testimonial[];
}

const INTERVAL_MS = 5000;
const SLIDE_MS = 700;
const FADE_MS = 120;

export default function TestimonialsCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        setPrevIndex(i);
        return (i + 1) % testimonials.length;
      });
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [testimonials.length]);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative overflow-hidden">
        {testimonials.map((t, i) => {
          const isActive = i === index;
          const isLeaving = i === prevIndex && prevIndex !== index;
          let position = "translate-x-full opacity-0";
          let transition = "none";
          if (isActive) {
            position = "translate-x-0 opacity-100";
            transition = `transform ${SLIDE_MS}ms ease-in-out, opacity ${FADE_MS}ms ease-in-out`;
          } else if (isLeaving) {
            position = "-translate-x-full opacity-0";
            transition = `transform ${SLIDE_MS}ms ease-in-out, opacity ${FADE_MS}ms ease-in-out ${SLIDE_MS - FADE_MS}ms`;
          }
          const style: CSSProperties = { transition };
          return (
            <div
              key={t.name}
              aria-hidden={!isActive}
              style={style}
              className={
                "bg-white/10 backdrop-blur-xl p-8 shadow-[0_0_100px_#f5f5f5] " +
                (isActive
                  ? "relative pointer-events-auto "
                  : "absolute inset-0 pointer-events-none ") +
                position
              }
            >
              <p className="text-ink leading-relaxed">"{t.text}"</p>
              <p className="mt-4 text-sm tracking-widest uppercase text-ink-muted">
                — {t.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
