export interface Testimonial {
  name: string;
  text: string;
  rating?: number;
  date?: string;
}

// Flip this to true ONLY after replacing the placeholder testimonials below
// with real reviews (each with a rating + date). Emitting fake reviews as
// structured data violates Google's review-snippet guidelines.
export const EMIT_REVIEW_SCHEMA = false;

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Anna",
    text: "Best manicure I've ever had — Ksenia is incredibly precise.",
  },
  {
    name: "Maria",
    text: "Studio feels relaxing and private. Nails lasted 4 weeks.",
  },
  {
    name: "Elena",
    text: "Beautiful designs, gentle care, and always on time.",
  },
];
