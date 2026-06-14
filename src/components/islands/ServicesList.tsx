import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  fetchServicesAndCategories,
  formatPrice,
  type ApiCategory,
  type ServicesData,
} from "~/lib/services";

interface Props {
  initial?: ServicesData | null;
}

export default function ServicesList({ initial }: Props) {
  const [categories, setCategories] = useState<ApiCategory[] | null>(
    initial?.categories ?? null,
  );
  const [activeId, setActiveId] = useState<string | null>(
    initial?.categories[0]?.categoryId ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let cancelled = false;
    fetchServicesAndCategories()
      .then(({ categories: fresh }) => {
        if (cancelled) return;
        setCategories(fresh);
        setActiveId((prev) => {
          const stillExists = prev && fresh.find((c) => c.categoryId === prev);
          return stillExists ? prev : (fresh[0]?.categoryId ?? null);
        });
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

  const activeCategory = useMemo(
    () => categories?.find((c) => c.categoryId === activeId) ?? null,
    [categories, activeId],
  );

  return (
    <div>
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-10">
          {categories.map((c) => (
            <TabButton
              key={c.categoryId}
              active={c.categoryId === activeId}
              onClick={() => setActiveId(c.categoryId)}
            >
              {c.name}
            </TabButton>
          ))}
        </div>
      )}

      {loading && !categories && (
        <ul className="space-y-6" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-12 bg-ink/5 animate-pulse rounded-sm" />
          ))}
        </ul>
      )}

      {!loading && !categories && error && (
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
                </div>
                <p className="font-body font-medium text-xl md:text-service-title whitespace-nowrap">
                  {formatPrice(s.priceCents)}
                </p>
              </button>
            </li>
          ))}
          {activeCategory.services.length === 0 && (
            <li className="py-6 text-sm text-ink-muted">
              No services in this category yet.
            </li>
          )}
        </ul>
      )}

    </div>
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
