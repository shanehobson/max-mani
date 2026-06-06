export const SITE = {
  name: "Max Mani",
  phone: "+12393063205",
  phoneDisplay: "+1 (239) 306-3205",
  email: "oksana.maxumiv@gmail.com",
  instagram: "max.manicure_naples",
  instagramUrl: "https://instagram.com/max.manicure_naples",
} as const;

// TODO: fill in with real values from user
// TODO: replace hardcoded tenantId with the real Max Mani tenant id once provisioned
// In dev we go through Vite's `/api/zaera` proxy (see astro.config.mjs) to avoid
// browser CORS errors against api.zaera.io. In production CORS must be enabled
// on api.zaera.io for https://maxmani.com.
const ZAERA_BASE = import.meta.env.DEV
  ? "/api/zaera"
  : "https://api.zaera.io";

export const ZAERA = {
  bookingIframeUrl: "https://booking.zaera.io/demo",
  servicesApiUrl: `${ZAERA_BASE}/public/services`,
  categoriesApiUrl: `${ZAERA_BASE}/public/service-categories`,
  tenantId: "ad67c4b4-26a5-4899-94f9-596c7b3dcd84",
} as const;

// TODO: fill in with real Lambda function URL
export const LAMBDA_SUBMIT_URL = "https://TBD-lambda-function-url";

export const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About me" },
  { href: "#testimonials", label: "Testimonials" },
] as const;
