import Image, { type ImageLoaderProps } from "next/image";
import { UtensilsCrossed } from "lucide-react";
import type { CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The single image component for dishes and food photography.
 * - Unsplash URLs are resized by Unsplash's own CDN (no server work needed).
 * - Any other URL goes through next/image (add the host in next.config.ts).
 * - No `src` → a bright branded placeholder, so a dish without a photo still looks intentional.
 */

const PLACEHOLDER_BG: Record<CategoryId, string> = {
  burgers: "bg-mustard",
  chicken: "bg-sauce",
  sides: "bg-mustard-tint",
  greens: "bg-lettuce-tint",
  shakes: "bg-bubblegum",
  drinks: "bg-mustard-tint",
};

function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  return url.toString();
}

interface DishImageProps {
  name: string;
  category: CategoryId;
  src?: string;
  shape?: "rect" | "circle" | "blob";
  className?: string;
  sizes?: string;
  priority?: boolean;
  muted?: boolean;
  /** Extra classes for the <img> (e.g. hover zoom). */
  imgClassName?: string;
}

export function DishImage({
  name,
  category,
  src,
  shape = "rect",
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority,
  muted,
  imgClassName,
}: DishImageProps) {
  const radius = shape === "circle" ? "rounded-full" : shape === "blob" ? "rounded-blob" : "rounded-2xl";
  const isUnsplash = src?.startsWith("https://images.unsplash.com/");

  return (
    <div className={cn("relative isolate overflow-hidden bg-line", radius, muted && "grayscale", className)}>
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          loader={isUnsplash ? unsplashLoader : undefined}
          unoptimized={src.startsWith("data:")}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div role="img" aria-label={`${name} (photo coming soon)`} className={cn("halftone absolute inset-0 flex items-center justify-center", PLACEHOLDER_BG[category])}>
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-cream shadow-pop">
            <UtensilsCrossed className="h-7 w-7" aria-hidden />
          </span>
        </div>
      )}
    </div>
  );
}
