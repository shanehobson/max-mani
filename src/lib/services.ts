import { ZAERA, ZAERA_API_BASE_ABSOLUTE } from "./config";

export interface ApiCategoryRef {
  categoryId: string;
  tenantId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiService {
  serviceId: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  /** Resolved for the location the service was fetched for. */
  priceCents: number;
  createdAt: string;
  updatedAt: string;
  category?: ApiCategoryRef;
}

export interface ApiCategory extends ApiCategoryRef {
  services: ApiService[];
}

export type AddressKind = "physical" | "in_home";

export interface ApiAddress {
  addressId: string;
  label: string;
  kind: AddressKind;
  /** Travel fee added per in-home visit; null when there is none. */
  surchargeCents: number | null;
  street: string;
  suite: string | null;
  city: string;
  state: string;
  zip: string;
  isPrimary: boolean;
}

export interface LocationCatalog {
  /** null when the tenant has no active locations. */
  address: ApiAddress | null;
  categories: ApiCategory[];
}

export interface ServicesData {
  locations: LocationCatalog[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    headers: { "x-tenant-id": ZAERA.tenantId },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as T;
}

function locationRank(a: ApiAddress): number {
  if (a.isPrimary) return 0;
  return a.kind === "physical" ? 1 : 2;
}

function sortLocations(addresses: ApiAddress[]): ApiAddress[] {
  return [...addresses].sort((a, b) => locationRank(a) - locationRank(b));
}

function groupByCategory(
  categories: ApiCategory[],
  services: ApiService[],
): ApiCategory[] {
  return categories
    .map((c) => ({
      ...c,
      services: services.filter((s) => s.categoryId === c.categoryId),
    }))
    .filter((c) => c.services.length > 0);
}

async function fetchCatalogFrom(apiBase: string): Promise<ServicesData> {
  const [addresses, categories] = await Promise.all([
    fetchJson<ApiAddress[]>(`${apiBase}/public/addresses`),
    fetchJson<ApiCategory[]>(`${apiBase}/public/service-categories`),
  ]);

  const ordered = sortLocations(addresses);
  if (ordered.length === 0) {
    return {
      locations: [
        {
          address: null,
          categories: categories.filter((c) => c.services.length > 0),
        },
      ],
    };
  }

  const locations = await Promise.all(
    ordered.map(async (address) => {
      const services = await fetchJson<ApiService[]>(
        `${apiBase}/public/services?addressId=${encodeURIComponent(address.addressId)}`,
      );
      return { address, categories: groupByCategory(categories, services) };
    }),
  );
  return { locations };
}

export function fetchCatalog(): Promise<ServicesData> {
  return fetchCatalogFrom(ZAERA.apiBase);
}

export function fetchCatalogServer(): Promise<ServicesData> {
  return fetchCatalogFrom(ZAERA_API_BASE_ABSOLUTE);
}

export function locationKey(location: LocationCatalog): string {
  return location.address?.addressId ?? "default";
}

export function formatAddress(a: ApiAddress): string {
  const street = a.suite ? `${a.street}, ${a.suite}` : a.street;
  return `${street}, ${a.city}, ${a.state} ${a.zip}`;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (rest > 0 || hours === 0) {
    parts.push(`${rest} ${rest === 1 ? "minute" : "minutes"}`);
  }
  return parts.join(" ");
}
