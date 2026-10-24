import { CheckCheck, ChefHat, CircleSlash, ClipboardCheck, PackageCheck } from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; icon: typeof ChefHat; className: string }> = {
  received: { label: "Received", icon: ClipboardCheck, className: "bg-mustard-tint text-ink" },
  cooking: { label: "Cooking", icon: ChefHat, className: "bg-chili-tint text-chili" },
  ready: { label: "Ready", icon: PackageCheck, className: "bg-lettuce-tint text-lettuce" },
  completed: { label: "Completed", icon: CheckCheck, className: "bg-line/70 text-muted" },
  cancelled: { label: "Cancelled", icon: CircleSlash, className: "bg-tomato-tint text-tomato" },
};

/** Status always ships with an icon and a label — never colour alone. */
export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", meta.className, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}
