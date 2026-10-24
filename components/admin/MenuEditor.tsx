"use client";

import { ExternalLink, Pencil, Plus, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DishImage } from "@/components/brand/DishImage";
import { Button } from "@/components/ui/Button";
import { DietaryTags } from "@/components/ui/DietaryTags";
import { Select } from "@/components/ui/Field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { Switch } from "@/components/ui/Switch";
import { toast } from "@/components/ui/Toaster";
import { formatMoney } from "@/lib/format";
import { useMenu } from "@/lib/store/menu";
import type { CategoryId, Dish } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "./AdminShell";
import { DishForm } from "./DishForm";

export function MenuEditor() {
  const { dishes, categories, status, error, load, updateDish } = useMenu();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [editing, setEditing] = useState<Dish | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => void load(), [load]);

  const rows = useMemo(
    () =>
      dishes.filter(
        (d) => (category === "all" || d.category === category) && d.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [dishes, category, query],
  );
  const soldOut = dishes.filter((d) => !d.available).length;
  const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;

  const toggle = async (dish: Dish, available: boolean) => {
    try {
      await updateDish(dish.id, { available });
      toast(available ? `${dish.name} is back on the menu.` : `${dish.name} marked sold out — the public menu updated.`);
    } catch {
      toast("Couldn't update availability.", "error");
    }
  };

  const openEditor = (dish: Dish | null) => {
    setEditing(dish);
    setFormOpen(true);
  };

  return (
    <div>
      <AdminPageHeader
        title="Menu"
        description={status === "ready" ? `${dishes.length} dishes · ${soldOut} sold out today` : "Loading dishes…"}
        actions={
          <>
            <Link href="/menu" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted hover:bg-ink/[0.06] hover:text-ink">
              <ExternalLink className="h-4 w-4" aria-hidden /> Public menu
            </Link>
            <Button size="sm" onClick={() => openEditor(null)}>
              <Plus className="h-4 w-4" aria-hidden /> Add dish
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <label htmlFor="dish-search" className="sr-only">
            Search dishes
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="dish-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes"
            className="h-11 w-full rounded-full border border-line bg-card pl-10 pr-4 focus:border-ink focus:outline-none focus:ring-4 focus:ring-mustard/30"
          />
        </div>
        <label htmlFor="dish-category" className="sr-only">
          Filter by category
        </label>
        <Select id="dish-category" value={category} onChange={(e) => setCategory(e.target.value as CategoryId | "all")} className="h-11 rounded-full sm:w-56">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {status === "error" ? (
        <ErrorState message={error ?? undefined} onRetry={() => load({ force: true })} />
      ) : status !== "ready" ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={<SearchX className="h-7 w-7" />} title="No dishes match" action={<Button variant="secondary" onClick={() => { setQuery(""); setCategory("all"); }}>Clear filters</Button>} />
      ) : (
        <div className="overflow-hidden rounded-[1.25rem] border-2 border-ink bg-card shadow-pop">
          <table className="w-full text-left">
            <caption className="sr-only">Menu dishes with price, dietary tags and availability</caption>
            <thead className="hidden border-b border-line text-sm text-muted md:table-header-group">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Dish</th>
                <th scope="col" className="px-3 py-3 font-semibold">Category</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">Price</th>
                <th scope="col" className="hidden px-3 py-3 font-semibold xl:table-cell">Tags</th>
                <th scope="col" className="px-3 py-3 font-semibold">Available</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((dish) => (
                <tr key={dish.id} className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 p-4 md:table-row md:p-0", !dish.available && "bg-cream/60")}>
                  <td className="flex min-w-0 flex-1 items-center gap-3 md:px-5 md:py-3">
                    <DishImage name={dish.name} category={dish.category} src={dish.image} className="h-14 w-14 shrink-0 rounded-xl" muted={!dish.available} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {dish.name}
                        {dish.featured && <span className="ml-2 rounded-full bg-mustard-tint px-2 py-0.5 align-middle text-[0.65rem] font-semibold uppercase tracking-wider text-muted">Featured</span>}
                      </p>
                      <p className="text-sm text-muted md:hidden">
                        {categoryName(dish.category)} · {formatMoney(dish.price)}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 text-sm text-muted md:table-cell">{categoryName(dish.category)}</td>
                  <td className="hidden px-3 py-3 text-right font-mono tabular-nums md:table-cell">{formatMoney(dish.price)}</td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    <DietaryTags tags={dish.tags} />
                  </td>
                  <td className="md:px-3 md:py-3">
                    <Switch checked={dish.available} onChange={(v) => toggle(dish, v)} label={`${dish.name} available`} hideLabel />
                    <span className={cn("ml-1 text-sm font-semibold md:hidden", dish.available ? "text-lettuce" : "text-muted")} aria-hidden>
                      {dish.available ? "Available" : "Sold out"}
                    </span>
                  </td>
                  <td className="md:px-5 md:py-3 md:text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditor(dish)} aria-label={`Edit ${dish.name}`}>
                      <Pencil className="h-4 w-4" aria-hidden /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DishForm open={formOpen} dish={editing} onClose={() => setFormOpen(false)} />
    </div>
  );
}
