export const SITE_URL = "https://maxmanicure.com";

export const SITE = {
  name: "Max Mani",
  phone: "+12393063205",
  phoneDisplay: "+1 (239) 306-3205",
  email: "oksana.maxumiv@gmail.com",
  instagram: "max.manicure_naples",
  instagramUrl: "https://instagram.com/max.manicure_naples",
} as const;

const STREET_ADDRESS = "4962 Tamiami Trail N";
const ADDRESS_LOCALITY = "Naples";
const ADDRESS_REGION = "FL";
const POSTAL_CODE = "34103";

export const ADDRESS = {
  street: STREET_ADDRESS,
  locality: ADDRESS_LOCALITY,
  region: ADDRESS_REGION,
  postalCode: POSTAL_CODE,
  country: "US",
  // Geocoded from the street address via OpenStreetMap (house-level match).
  latitude: 26.203457,
  longitude: -81.800369,
  display: `${STREET_ADDRESS}, ${ADDRESS_LOCALITY}, ${ADDRESS_REGION} ${POSTAL_CODE}`,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Max Mani, ${STREET_ADDRESS}, ${ADDRESS_LOCALITY}, ${ADDRESS_REGION} ${POSTAL_CODE}`,
  )}`,
} as const;

// Dev: Vite proxies /api/zaera → api.zaera.io (see astro.config.mjs).
// Prod: CloudFront proxies /api/zaera/* → api.zaera.io (see infra/lib/site-stack.ts).
const ZAERA_BASE = "/api/zaera";

// Build-time / SSR cannot use the relative proxy — call Zaera directly.
export const ZAERA_API_BASE_ABSOLUTE = "https://api.zaera.io";

export const ZAERA = {
  bookingIframeUrl: "https://booking.zaera.io/maxmanicure",
  servicesApiUrl: `${ZAERA_BASE}/public/services`,
  categoriesApiUrl: `${ZAERA_BASE}/public/service-categories`,
  tenantId: "da1251e5-d0bc-4a6f-af4d-c45c637e6cd1",
} as const;

// Owner must populate `openingHoursSpecification` with real hours before
// the JSON-LD field will be emitted. Until then the footer shows
// "By appointment" and the JSON-LD omits the field.
export const BUSINESS = {
  legalName: "Max Mani",
  description:
    `Private nail studio at ${ADDRESS.display} offering hard gel manicure, pedicure, and custom nail art by licensed nail technician Ksenia.`,
  image: `${SITE_URL}/og-image.jpg`,
  priceRange: "$$",
  areaServed: "Naples, FL",
  sameAs: [SITE.instagramUrl],
  openingHoursSpecification: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
  ] as Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>,
} as const;

export const LAMBDA_SUBMIT_URL =
  "https://l2vegtv6gtdcld2vfydmshheru0cxfek.lambda-url.us-east-1.on.aws/";

export const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About me" },
  { href: "#testimonials", label: "Testimonials" },
] as const;
