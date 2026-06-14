import { ZAERA, ZAERA_API_BASE_ABSOLUTE } from "./config";

export interface ApiCategoryRef {
  categoryId: string;
  tenantId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiService {
  serviceId: string;
  tenantId: string;
  categoryId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  createdAt: string;
  updatedAt: string;
  category?: ApiCategoryRef;
}

export interface ApiCategory extends ApiCategoryRef {
  services: ApiService[];
}

export interface ServicesData {
  categories: ApiCategory[];
  services: ApiService[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    headers: { "x-tenant-id": ZAERA.tenantId },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as T;
}

export async function fetchServicesAndCategories(): Promise<ServicesData> {
  const [categories, services] = await Promise.all([
    fetchJson<ApiCategory[]>(ZAERA.categoriesApiUrl),
    fetchJson<ApiService[]>(ZAERA.servicesApiUrl),
  ]);
  return { categories, services };
}

export async function fetchServicesAndCategoriesServer(): Promise<ServicesData> {
  const [categories, services] = await Promise.all([
    fetchJson<ApiCategory[]>(`${ZAERA_API_BASE_ABSOLUTE}/public/service-categories`),
    fetchJson<ApiService[]>(`${ZAERA_API_BASE_ABSOLUTE}/public/services`),
  ]);
  return { categories, services };
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
