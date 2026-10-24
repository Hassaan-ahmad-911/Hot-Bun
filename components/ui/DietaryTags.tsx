import { Flame, Leaf, Sprout, WheatOff } from "lucide-react";
import type { DietaryTag } from "@/lib/types";
import { cn } from "@/lib/utils";

export const DIETARY_META: Record<DietaryTag, { label: string; short: string; icon: typeof Leaf; className: string }> = {
  vegetarian: { label: "Vegetarian", short: "Veg", icon: Leaf, className: "bg-lettuce-tint text-lettuce" },
  vegan: { label: "Vegan", short: "Vegan", icon: Sprout, className: "bg-lettuce-tint text-lettuce" },
  spicy: { label: "Spicy", short: "Spicy", icon: Flame, className: "bg-chili-tint text-chili" },
  "gluten-free": { label: "Gluten-free", short: "GF", icon: WheatOff, className: "bg-mustard-tint text-muted" },
};

/** Vegan implies vegetarian — show the more specific tag only. */
export function displayTags(tags: DietaryTag[]) {
  return tags.filter((t) => !(t === "vegetarian" && tags.includes("vegan")));
}

export function DietaryTags({ tags, className }: { tags: DietaryTag[]; className?: string }) {
  const shown = displayTags(tags);
  if (!shown.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Dietary information">
      {shown.map((tag) => {
        const meta = DIETARY_META[tag];
        const Icon = meta.icon;
        return (
          <li key={tag} className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", meta.className)}>
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {meta.label}
          </li>
        );
      })}
    </ul>
  );
}
