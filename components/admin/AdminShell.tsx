"use client";

import { ExternalLink, LayoutDashboard, Loader2, LogOut, Receipt, RotateCcw, UtensilsCrossed, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BunMark } from "@/components/brand/Logo";
import { Toaster, toast } from "@/components/ui/Toaster";
import { resetDb } from "@/lib/api";
import { useAdminAuth } from "@/lib/store/admin-auth";
import { useMenu } from "@/lib/store/menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/reservations", label: "Bookings", icon: CalendarDays },
];

export function SampleDataBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-mustard-tint px-2.5 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-muted", className)}>
      Sample data
    </span>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrated, signOut } = useAdminAuth();
  const [confirmReset, setConfirmReset] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (hydrated && !user && !isLogin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin text-muted" aria-label="Loading staff panel" />
      </div>
    );
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetDb();
    await useMenu.getState().load({ force: true });
    setConfirmReset(false);
    toast("Demo data reset to the original sample.", "info");
  };

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="on-dark sticky top-0 hidden h-screen flex-col bg-ink p-5 text-cream lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <BunMark className="text-cream" />
          <span>
            <span className="block font-display text-xl font-semibold leading-none">HOT BUN</span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-fog">Staff panel</span>
          </span>
        </Link>
        <nav aria-label="Admin" className="mt-10">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-xl px-3 font-semibold transition-colors",
                      active ? "bg-cream text-ink" : "text-fog hover:bg-cream/10 hover:text-cream",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto space-y-1 border-t border-ink-line pt-4 text-sm">
          <Link href="/" className="flex h-10 items-center gap-3 rounded-xl px-3 text-fog transition-colors hover:bg-cream/10 hover:text-cream">
            <ExternalLink className="h-4 w-4" aria-hidden /> View public site
          </Link>
          <button type="button" onClick={handleReset} className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-fog transition-colors hover:bg-cream/10 hover:text-cream">
            <RotateCcw className="h-4 w-4" aria-hidden /> {confirmReset ? "Click again to reset" : "Reset demo data"}
          </button>
          <button
            type="button"
            onClick={() => {
              signOut();
              router.replace("/admin/login");
            }}
            className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-fog transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
          <p className="px-3 pt-3 text-xs text-fog">Signed in as {user.name}</p>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile top bar */}
        <header className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-cream lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <BunMark className="h-7 w-6 text-cream" />
            <span className="font-display text-lg font-semibold">HOT BUN staff</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream/10" aria-label="View public site">
              <ExternalLink className="h-5 w-5" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace("/admin/login");
              }}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream/10"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="px-4 pb-28 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {children}
        </main>

        {/* Mobile bottom tabs */}
        <nav aria-label="Admin" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur-md lg:hidden">
          <ul className="grid grid-cols-4">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold", active ? "text-ink" : "text-muted")}
                  >
                    <Icon className={cn("h-5 w-5", active && "text-tomato")} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <Toaster />
    </div>
  );
}

export function AdminPageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-display-sm sm:text-4xl">{title}</h1>
        {description && <div className="mt-1.5 text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
