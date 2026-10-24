"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EASE_HEARTH } from "@/components/motion/Reveal";
import { OpenStatus } from "@/components/site/OpenStatus";
import { DIETARY_META } from "@/components/ui/DietaryTags";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useMenu } from "@/lib/store/menu";
import type { CategoryId, DietaryTag, Dish } from "@/lib/types";
import { cn, pluralize } from "@/lib/utils";
import { DishCard, DishCardSkeleton } from "./DishCard";

type CategoryFilter = CategoryId | "all";
const DIETARY_FILTERS: DietaryTag[] = ["vegetarian", "vegan", "spicy", "gluten-free"];
const CATEGORY_IDS: CategoryId[] = ["burgers", "chicken", "sides", "greens", "shakes", "drinks"];

function matches(dish: Dish, query: string, diet: DietaryTag[]) {
  const q = query.trim().toLowerCase();
  const text = `${dish.name} ${dish.description} ${dish.badge ?? ""}`.toLowerCase();
  return (!q || text.includes(q)) && diet.every((t) => dish.tags.includes(t));
}

function Grid({ dishes }: { dishes: Dish[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {dishes.map((dish) => (
          <motion.div
            key={dish.id}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: EASE_HEARTH }}
          >
            <DishCard dish={dish} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function MenuView() {
  const { categories, dishes, status, error, load } = useMenu();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const fromUrl = params.get("category");
  const initial: CategoryFilter = CATEGORY_IDS.includes(fromUrl as CategoryId) ? (fromUrl as CategoryId) : "all";
  const [category, setCategory] = useState<CategoryFilter>(initial);
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<DietaryTag[]>([]);

  useEffect(() => void load(), [load]);

  // Deep-linkable category: /menu?category=chicken
  const selectCategory = (next: CategoryFilter) => {
    setCategory(next);
    const sp = new URLSearchParams(params.toString());
    if (next === "all") sp.delete("category");
    else sp.set("category", next);
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const toggleDiet = (tag: DietaryTag) =>
    setDiet((d) => (d.includes(tag) ? d.filter((t) => t !== tag) : [...d, tag]));

  const filtered = useMemo(
    () => dishes.filter((d) => (category === "all" || d.category === category) && matches(d, query, diet)),
    [dishes, category, query, diet],
  );

  const isFiltering = query.trim() !== "" || diet.length > 0;
  const grouped = category === "all" && !isFiltering;
  const clearAll = () => {
    setQuery("");
    setDiet([]);
    selectCategory("all");
  };

  const tabs: { id: CategoryFilter; name: string }[] = [{ id: "all", name: "Everything" }, ...categories.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <>
      <section className="border-b border-line pb-10 pt-[calc(var(--header-h)+3rem)]">
        <div className="container flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Order for pickup or delivery</p>
            <h1 className="mt-3 font-display text-display-xl uppercase">
              The <span className="text-tomato">menu</span>
            </h1>
            <p className="mt-3 max-w-lg text-lg text-muted">
              Everything is smashed, fried and blended to order. Most orders are ready in about 15 minutes.
            </p>
          </div>
          <OpenStatus />
        </div>
      </section>

      {/* Sticky filter bar — sits under the site header. */}
      <div className="sticky top-[var(--header-h)] z-30 border-b border-line bg-cream/95 backdrop-blur-md">
        <div className="container flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
          <nav aria-label="Menu categories" className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:flex-1 lg:px-0">
            <ul className="flex w-max gap-1">
              {tabs.map((tab) => {
                const active = tab.id === category;
                return (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => selectCategory(tab.id)}
                      aria-pressed={active}
                      className={cn(
                        "relative h-11 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-200",
                        active ? "text-cream" : "text-ink hover:bg-ink/[0.06]",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="menu-tab-pill"
                          className="absolute inset-0 rounded-full bg-ink"
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          aria-hidden
                        />
                      )}
                      <span className="relative">{tab.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <label htmlFor="menu-search" className="sr-only">
                Search the menu
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="menu-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search, e.g. bacon"
                className="h-11 w-full rounded-full border-2 border-ink bg-card pl-10 pr-10 text-[0.95rem] placeholder:text-muted/70 focus:border-ink focus:outline-none focus:ring-4 focus:ring-mustard/30 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full hover:bg-ink/[0.07]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
            <div role="group" aria-label="Dietary filters" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {DIETARY_FILTERS.map((tag) => {
                const meta = DIETARY_META[tag];
                const Icon = meta.icon;
                const on = diet.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDiet(tag)}
                    className={cn(
                      "inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-95",
                      on ? "border-ink bg-ink text-cream" : "border-ink bg-card text-ink hover:bg-mustard-tint",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {meta.short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10 lg:py-14">
        <p className="sr-only" role="status" aria-live="polite">
          {status === "ready" ? `${pluralize(filtered.length, "dish", "dishes")} shown.` : ""}
        </p>

        {status === "error" ? (
          <ErrorState message={error ?? undefined} onRetry={() => load({ force: true })} />
        ) : status !== "ready" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading the menu">
            {Array.from({ length: 6 }, (_, i) => (
              <DishCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-7 w-7" />}
            title={query ? `Nothing matches “${query}”` : "Nothing matches those filters"}
            action={
              <Button variant="secondary" onClick={clearAll}>
                Clear filters
              </Button>
            }
          >
            Try a broader search — or ask us, we love talking about food.
          </EmptyState>
        ) : grouped ? (
          <div className="space-y-16">
            {categories.map((cat) => {
              const items = filtered.filter((d) => d.category === cat.id);
              if (!items.length) return null;
              return (
                <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                  <div className="mb-6 flex flex-col gap-1 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between">
                    <h2 id={`cat-${cat.id}`} className="font-display text-display-md">
                      {cat.name}
                    </h2>
                    <p className="text-muted">{cat.blurb}</p>
                  </div>
                  <Grid dishes={items} />
                </section>
              );
            })}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-display-sm">
                {category === "all" ? "Results" : categories.find((c) => c.id === category)?.name}
              </h2>
              <p className="font-mono text-sm text-muted">{pluralize(filtered.length, "dish", "dishes")}</p>
            </div>
            <Grid dishes={filtered} />
          </>
        )}
      </div>
    </>
  );
}
