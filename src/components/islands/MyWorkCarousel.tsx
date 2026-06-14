import { useEffect, useState } from "react";

interface Slide {
  src: string;
  alt: string;
}

interface Props {
  slides: Slide[];
}

const INTERVAL_MS = 5000;

export default function MyWorkCarousel({ slides }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-cream-100 shadow-md translate-y-[60px]">
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          loading={i === 0 ? "eager" : "lazy"}
          className={
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out " +
            (i === index ? "opacity-100" : "opacity-0")
          }
        />
      ))}
    </div>
  );
}
