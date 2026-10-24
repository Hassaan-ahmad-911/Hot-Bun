"use client";

import { useRef } from "react";
import { DishImage } from "@/components/brand/DishImage";
import { Tilt } from "@/components/motion/Kinetic";
import { DietaryTags } from "@/components/ui/DietaryTags";
import { Skeleton } from "@/components/ui/States";
import { formatPrice } from "@/lib/format";
import type { Dish } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AddToCart } from "./AddToCart";

interface DishCardProps {
  dish: Dish;
  variant?: "default" | "feature";
  className?: string;
  priority?: boolean;
}

/** Sticker-style dish card: ink outline, hard shadow, 3D tilt and photo zoom on hover. */
export function DishCard({ dish, variant = "default", className, priority }: DishCardProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const soldOut = !dish.available;
  const feature = variant === "feature";

  return (
    <Tilt className={cn("h-full", className)} max={soldOut ? 0 : 6}>
      <article
        className={cn(
          "group relative flex h-full flex-col rounded-[1.75rem] border-2 border-ink bg-card p-3 shadow-pop",
          !soldOut && "hover:shadow-pop-lg",
          soldOut && "bg-cream",
        )}
        aria-labelledby={`dish-${dish.id}`}
      >
        <div ref={imageRef} className="relative overflow-hidden rounded-[1.25rem] border-2 border-ink">
          <DishImage
            name={dish.name}
            category={dish.category}
            src={dish.image}
            className={cn("rounded-none", feature ? "aspect-[4/5]" : "aspect-[4/3]")}
            imgClassName={cn("transition-transform duration-700 ease-hearth", !soldOut && "group-hover:scale-110 group-hover:rotate-1")}
            muted={soldOut}
            priority={priority}
          />
          {soldOut ? (
            <span className="absolute left-3 top-3 -rotate-3 rounded-full border-2 border-ink bg-card px-3 py-1 font-display text-xs font-extrabold uppercase">
              Sold out today
            </span>
          ) : (
            dish.badge && (
              <span className="absolute left-3 top-3 -rotate-6 rounded-full border-2 border-ink bg-mustard px-3 py-1 font-display text-xs font-extrabold uppercase shadow-pop-sm transition-transform duration-300 ease-snap group-hover:rotate-3 group-hover:scale-110">
                {dish.badge}
              </span>
            )
          )}
          <span
            className={cn(
              "absolute bottom-3 right-3 rotate-3 rounded-xl border-2 border-ink px-2.5 py-1 font-display text-xl font-extrabold shadow-pop-sm",
              soldOut ? "bg-card text-muted line-through" : "bg-cream",
            )}
          >
            <span className="sr-only">Price: </span>
            {formatPrice(dish.price)}
          </span>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
          <h3 id={`dish-${dish.id}`} className={cn("font-display uppercase leading-[0.95] tracking-tight", feature ? "text-3xl" : "text-2xl", soldOut && "text-muted")}>
            {dish.name}
          </h3>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{dish.description}</p>
          <DietaryTags tags={dish.tags} className="mt-3" />
          <div className="mt-auto flex justify-end pt-4">
            <AddToCart dish={dish} sourceRef={imageRef} />
          </div>
        </div>
      </article>
    </Tilt>
  );
}

export function DishCardSkeleton({ feature }: { feature?: boolean }) {
  return (
    <div className="rounded-[1.75rem] border-2 border-line bg-card p-3" aria-hidden>
      <Skeleton className={cn("rounded-[1.25rem]", feature ? "aspect-[4/5]" : "aspect-[4/3]")} />
      <div className="space-y-2.5 px-2 pb-2 pt-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex justify-end pt-3">
          <Skeleton className="h-11 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
