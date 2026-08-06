import { SITE, BUSINESS, ADDRESS } from "./config";
import type { Testimonial } from "~/data/testimonials";

export function buildCanonicalUrl(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/$/, "");
  if (!pathname || pathname === "/") return `${base}/`;
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function buildBeautySalonJsonLd(
  siteUrl: string,
): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: SITE.name,
    legalName: BUSINESS.legalName,
    description: BUSINESS.description,
    url: siteUrl,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      postalCode: ADDRESS.postalCode,
      addressCountry: ADDRESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ADDRESS.latitude,
      longitude: ADDRESS.longitude,
    },
    hasMap: ADDRESS.mapsUrl,
    image: BUSINESS.image,
    priceRange: BUSINESS.priceRange,
    areaServed: BUSINESS.areaServed,
    sameAs: BUSINESS.sameAs,
  };

  if (BUSINESS.openingHoursSpecification.length > 0) {
    ld.openingHoursSpecification = BUSINESS.openingHoursSpecification.map(
      (h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dayOfWeek,
        opens: h.opens,
        closes: h.closes,
      }),
    );
  }

  return ld;
}

function hasCompleteReviewFields(
  testimonials: Testimonial[],
): testimonials is Array<Required<Testimonial>> {
  return (
    testimonials.length > 0 &&
    testimonials.every(
      (t) => typeof t.rating === "number" && typeof t.date === "string",
    )
  );
}

export function buildAggregateRatingJsonLd(
  testimonials: Testimonial[],
): Record<string, unknown> | null {
  if (!hasCompleteReviewFields(testimonials)) return null;
  const total = testimonials.reduce((sum, t) => sum + (t.rating ?? 0), 0);
  const avg = total / testimonials.length;
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "BeautySalon",
      name: SITE.name,
    },
    ratingValue: avg.toFixed(1),
    reviewCount: testimonials.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function buildReviewListJsonLd(
  testimonials: Testimonial[],
): Record<string, unknown>[] {
  if (!hasCompleteReviewFields(testimonials)) return [];
  return testimonials.map((t) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "BeautySalon",
      name: SITE.name,
    },
    author: {
      "@type": "Person",
      name: t.name,
    },
    reviewBody: t.text,
    datePublished: t.date,
    reviewRating: {
      "@type": "Rating",
      ratingValue: t.rating,
      bestRating: 5,
      worstRating: 1,
    },
  }));
}
