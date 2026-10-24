import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light" | "mustard";
type Size = "sm" | "md" | "lg";

/**
 * Bold "sticker" buttons: ink outline + hard offset shadow. Hover lifts, press
 * pushes the button into its shadow. Only `transform` is transitioned.
 */
const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-bold tracking-tight " +
  "transition-transform duration-200 ease-snap cursor-pointer " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const popped =
  "border-2 border-ink shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-sm";

const variants: Record<Variant, string> = {
  // Tomato is reserved for primary actions only.
  primary: cn(popped, "bg-tomato text-white hover:bg-tomato-deep"),
  secondary: cn(popped, "bg-card text-ink hover:bg-mustard"),
  mustard: cn(popped, "bg-mustard text-ink"),
  ghost: "bg-transparent text-ink hover:bg-ink/[0.06] active:scale-[0.97]",
  light: "border-2 border-cream bg-cream text-ink shadow-[4px_4px_0_0_theme(colors.mustard.DEFAULT)] hover:-translate-y-0.5 active:translate-y-0.5",
  "outline-light":
    "border-2 border-cream bg-transparent text-cream hover:-translate-y-0.5 hover:bg-cream hover:text-ink active:translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, loadingText, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
