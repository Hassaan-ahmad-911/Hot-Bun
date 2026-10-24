"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu as MenuIcon, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DishImage } from "@/components/brand/DishImage";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { categories, dishes } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CartButton } from "./CartButton";
import { OpenStatus } from "./OpenStatus";

const NAV = [
  { href: "/menu", label: "Menu", mega: true },
  { href: "/reservations", label: "Book a booth" },
  { href: "/#story", label: "Our story" },
  { href: "/#visit", label: "Find us" },
];

const PROMOS = [
  "Free fries on your 1st order · code HOTFIRST",
  `Pickup in ~${restaurant.pickupLeadMinutes} min · Delivery within ${restaurant.deliveryRadiusKm} km`,
  "Smashed to order. Never frozen. Ever.",
];

/** Rotating one-liners in the top strip. */
function PromoTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % PROMOS.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative h-5 flex-1 overflow-hidden text-center" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={i}
          className="absolute inset-0 truncate"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {PROMOS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

const CATEGORY_TILES = categories.map((c) => {
  const items = dishes.filter((d) => d.category === c.id);
  return { ...c, count: items.length, image: items[0]?.image };
});
const STAR_DISH = dishes.find((d) => d.id === "hot-bun-og")!;

/** Desktop mega menu: category tiles with photos + a "most ordered" feature. */
function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="origin-top"
    >
      <div className="grid grid-cols-[1fr_17rem] gap-4 rounded-[1.75rem] border-2 border-ink bg-card p-4 shadow-pop-lg">
        <ul className="grid grid-cols-3 gap-3">
          {CATEGORY_TILES.map((c, i) => (
            <motion.li key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
              <Link
                href={`/menu?category=${c.id}`}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-2xl border-2 border-transparent p-2 transition-colors hover:border-ink hover:bg-mustard-tint"
              >
                <DishImage
                  name={c.name}
                  category={c.id}
                  src={c.image}
                  shape="circle"
                  sizes="56px"
                  className="h-14 w-14 shrink-0 border-2 border-ink"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                />
                <span>
                  <span className="block font-display text-lg uppercase leading-tight">{c.name}</span>
                  <span className="text-sm text-muted">{c.count} items</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
        <Link href="/menu" onClick={onNavigate} className="group relative overflow-hidden rounded-2xl border-2 border-ink bg-ink text-cream">
          <DishImage name={STAR_DISH.name} category="burgers" src={STAR_DISH.image} className="absolute inset-0 h-full w-full rounded-none opacity-80" imgClassName="transition-transform duration-700 group-hover:scale-110" sizes="280px" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" aria-hidden />
          <span className="relative flex h-full flex-col justify-end p-4">
            <span className="mb-auto self-start -rotate-3 rounded-full border-2 border-ink bg-mustard px-2.5 py-0.5 font-display text-xs font-extrabold uppercase text-ink">Most ordered</span>
            <span className="font-display text-2xl uppercase leading-none">{STAR_DISH.name}</span>
            <span className="mt-2 flex items-center justify-between font-semibold">
              {formatPrice(STAR_DISH.price)}
              <span className="flex items-center gap-1 text-mustard">
                Order <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </span>
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    clearTimeout(closeTimer.current);
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  // While the mega menu is open, close it on Escape, scroll, a click outside the
  // header, or when the window/tab loses focus (mouseleave never fires then).
  useEffect(() => {
    if (!megaOpen) return;
    const close = () => {
      clearTimeout(closeTimer.current);
      setMegaOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) close();
    };
    const onVisibility = () => document.hidden && close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("blur", close);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close);
      window.removeEventListener("blur", close);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [megaOpen]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMegaSoon = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140);
  };

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      {/* Announcement strip */}
      <div className="on-dark bg-ink text-cream">
        <div className="container flex h-9 items-center gap-4 text-[0.8rem] font-semibold">
          <OpenStatus showLead={false} className="hidden min-h-0 bg-transparent px-0 py-0 text-[0.8rem] text-cream md:inline-flex" />
          <PromoTicker />
          <a href={`tel:${restaurant.phone.replace(/[^+\d]/g, "")}`} className="hidden items-center gap-1.5 hover:text-mustard md:inline-flex">
            <Phone className="h-3.5 w-3.5" aria-hidden /> {restaurant.phone}
          </a>
        </div>
      </div>

      {/* Floating pill nav */}
      <div className="container pt-2.5">
        <div
          className={cn(
            "relative flex h-16 items-center justify-between gap-3 rounded-full border-2 border-ink bg-card pl-4 pr-2 transition-shadow duration-300",
            scrolled ? "shadow-pop-lg" : "shadow-pop",
          )}
        >
          <Logo />

          <nav aria-label="Main" className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
            <ul className="flex items-center">
              {NAV.map((item) => {
                const active = item.href === pathname;
                const showPill = hovered === item.href || (hovered === null && active);
                return (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => {
                      setHovered(item.href);
                      if (item.mega) openMega();
                      else {
                        clearTimeout(closeTimer.current);
                        setMegaOpen(false);
                      }
                    }}
                    onMouseLeave={() => item.mega && closeMegaSoon()}
                  >
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="relative z-10 block px-4 py-2 font-display text-[1.05rem] font-bold tracking-tight"
                        onFocus={() => setHovered(item.href)}
                      >
                        {showPill && (
                          <motion.span
                            layoutId="nav-pill"
                            className={cn("absolute inset-0 -z-10 rounded-full border-2 border-ink", active && hovered === null ? "bg-mustard" : "bg-mustard-tint")}
                            transition={{ type: "spring", stiffness: 500, damping: 36 }}
                            aria-hidden
                          />
                        )}
                        {item.label}
                      </Link>
                      {item.mega && (
                        <button
                          type="button"
                          aria-expanded={megaOpen}
                          aria-controls="mega-menu"
                          aria-label="Show menu categories"
                          onClick={() => setMegaOpen((o) => !o)}
                          className="-ml-3 mr-1 flex h-8 w-7 cursor-pointer items-center justify-center rounded-full"
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", megaOpen && "rotate-180")} aria-hidden />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/menu" size="sm" className="hidden md:inline-flex">
              Order now
            </ButtonLink>
            <CartButton />
            <button
              type="button"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-mustard transition-transform active:scale-95 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <MenuIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Only interactive while open: when closed, hovering the strip under the nav must NOT reopen it. */}
          <div
            id="mega-menu"
            className={cn("absolute inset-x-0 top-full hidden pt-3 lg:block", !megaOpen && "pointer-events-none")}
            onMouseEnter={megaOpen ? openMega : undefined}
            onMouseLeave={megaOpen ? closeMegaSoon : undefined}
          >
            <AnimatePresence>{megaOpen && <MegaMenu onNavigate={() => setMegaOpen(false)} />}</AnimatePresence>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title={<span className="sr-only">Navigation</span>} headerClassName="pb-0" className="bg-mustard">
        <nav aria-label="Mobile" className="flex h-full flex-col pb-8">
          <OpenStatus className="mb-6 self-start border-2 border-ink bg-card" />
          <ul>
            {NAV.map((item, i) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: 40, rotate: 4 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.08 + i * 0.06 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline gap-4 border-b-2 border-ink py-4 font-display text-5xl uppercase tracking-tight transition-colors hover:text-tomato"
                >
                  <span className="font-mono text-sm font-semibold">0{i + 1}</span>
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {CATEGORY_TILES.map((c) => (
              <Link key={c.id} href={`/menu?category=${c.id}`} onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 rounded-2xl border-2 border-ink bg-card p-2 text-center">
                <DishImage name={c.name} category={c.id} src={c.image} shape="circle" sizes="48px" className="h-12 w-12 border-2 border-ink" />
                <span className="font-display text-xs uppercase leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-3">
            <ButtonLink href="/menu" size="lg" onClick={() => setMenuOpen(false)}>
              Order online
            </ButtonLink>
            <ButtonLink href="/reservations" variant="secondary" size="lg" onClick={() => setMenuOpen(false)}>
              Book a booth
            </ButtonLink>
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
