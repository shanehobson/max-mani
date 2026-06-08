export const SITE = {
  name: "Max Mani",
  phone: "+12393063205",
  phoneDisplay: "+1 (239) 306-3205",
  email: "oksana.maxumiv@gmail.com",
  instagram: "max.manicure_naples",
  instagramUrl: "https://instagram.com/max.manicure_naples",
} as const;

// Dev: Vite proxies /api/zaera → api.zaera.io (see astro.config.mjs).
// Prod: CloudFront proxies /api/zaera/* → api.zaera.io (see infra/lib/site-stack.ts).
const ZAERA_BASE = "/api/zaera";

export const ZAERA = {
  bookingIframeUrl: "https://booking.zaera.io/maxmanicure",
  servicesApiUrl: `${ZAERA_BASE}/public/services`,
  categoriesApiUrl: `${ZAERA_BASE}/public/service-categories`,
  tenantId: "da1251e5-d0bc-4a6f-af4d-c45c637e6cd1",
} as const;

export const LAMBDA_SUBMIT_URL =
  "https://l2vegtv6gtdcld2vfydmshheru0cxfek.lambda-url.us-east-1.on.aws/";

export const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About me" },
  { href: "#testimonials", label: "Testimonials" },
] as const;
