import { useEffect, useState } from "react";

interface Testimonial {
  name: string;
  text: string;
}

interface Props {
  testimonials: Testimonial[];
}

const INTERVAL_MS = 5000;

export default function TestimonialsCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [testimonials.length]);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            aria-hidden={i !== index}
            className={
              "bg-white/10 backdrop-blur-xl p-8 shadow-[0_0_100px_#f5f5f5] transition-all duration-700 ease-out " +
              (i === index
                ? "relative opacity-100 translate-y-0 scale-100"
                : "absolute inset-0 opacity-0 translate-y-4 scale-[0.98] pointer-events-none")
            }
          >
            <p className="text-ink leading-relaxed">"{t.text}"</p>
            <p className="mt-4 text-sm tracking-widest uppercase text-ink-muted">
              — {t.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
