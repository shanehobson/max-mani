import { useEffect, useState, type ReactNode } from "react";
import {
  fetchCatalog,
  formatAddress,
  formatPrice,
  locationKey,
  type LocationCatalog,
  type ServicesData,
} from "~/lib/services";

interface Props {
  initial?: ServicesData | null;
}

export default function ServicesList({ initial }: Props) {
  const [data, setData] = useState<ServicesData | null>(initial ?? null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let cancelled = false;
    fetchCatalog()
      .then((fresh) => {
        if (!cancelled) setData(fresh);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // If we already have prerendered data, keep showing it and stay quiet.
        if (initial) return;
        setError(e instanceof Error ? e.message : "Failed to load services");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const locations = data?.locations ?? [];
  const activeLocation =
    locations.find((l) => locationKey(l) === selectedLocation) ??
    locations[0] ??
    null;
  const categories = activeLocation?.categories ?? [];
  const activeCategory =
    categories.find((c) => c.categoryId === selectedCategory) ??
    categories[0] ??
    null;

  return (
    <div>
      {locations.length > 1 && (
        <div className="flex flex-col items-center md:items-start gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {locations.map((l) => (
              <button
                key={locationKey(l)}
                type="button"
                className="btn-location"
                aria-pressed={l === activeLocation}
                onClick={() => setSelectedLocation(locationKey(l))}
              >
                {l.address?.label ?? "Studio"}
              </button>
            ))}
          </div>
          {activeLocation && <LocationNote location={activeLocation} />}
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-10">
          {categories.map((c) => (
            <TabButton
              key={c.categoryId}
              active={c === activeCategory}
              onClick={() => setSelectedCategory(c.categoryId)}
            >
              {c.name}
            </TabButton>
          ))}
        </div>
      )}

      {loading && !data && (
        <ul className="space-y-6" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-12 bg-ink/5 animate-pulse rounded-sm" />
          ))}
        </ul>
      )}

      {!loading && !data && error && (
        <p className="text-sm text-ink-muted mb-4">
          Services are temporarily unavailable: {error}
        </p>
      )}

      {activeCategory && (
        <ul className="divide-y divide-ink/10">
          {activeCategory.services.map((s) => (
            <li key={s.serviceId}>
              <button
                type="button"
                onClick={() =>
                  document.dispatchEvent(
                    new CustomEvent("book:open", {
                      detail: { service: s.serviceId },
                    }),
                  )
                }
                className="w-full grid grid-cols-[1fr_auto] gap-x-6 py-5 items-start text-left hover:bg-ink/[0.03] focus-visible:bg-ink/[0.03] focus-visible:outline-none transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-body font-medium text-xl md:text-service-title">
                    {s.name}
                  </p>
                  <p className="font-body text-base md:text-service-desc text-ink-muted mt-1">
                    {s.durationMinutes} min
                  </p>
                  {s.description && (
                    <p className="font-body text-sm md:text-base text-ink-muted mt-2 max-w-prose whitespace-pre-line">
                      {s.description}
                    </p>
                  )}
                </div>
                <p className="font-body font-medium text-xl md:text-service-title whitespace-nowrap">
                  {formatPrice(s.priceCents)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LocationNote({ location }: { location: LocationCatalog }) {
  const address = location.address;
  if (!address) return null;
  if (address.kind === "in_home") {
    const fee = address.surchargeCents;
    return (
      <p className="font-body text-sm text-ink-muted text-center md:text-left">
        I come to you anywhere in the Naples area.
        {fee ? ` A ${formatPrice(fee)} travel fee is added per visit.` : ""}
      </p>
    );
  }
  return (
    <p className="font-body text-sm text-ink-muted text-center md:text-left">
      {formatAddress(address)}
    </p>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-tab"
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
