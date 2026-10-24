import Link from "next/link";
import { BunMark } from "@/components/brand/Logo";
import { restaurant } from "@/data/restaurant";
import { DAY_NAMES, formatTime } from "@/lib/dates";

export function Footer() {
  const ordered = [...restaurant.hours.slice(1), restaurant.hours[0]]; // Monday first

  return (
    <footer className="on-dark overflow-hidden bg-ink text-cream">
      <div className="container pb-10 pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BunMark className="h-12 w-14 text-cream" />
              <span className="font-display text-5xl uppercase tracking-tight">
                Hot<span className="ml-[0.12em] text-tomato">Bun</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-fog">
              Smash burgers, crispy chicken and spoon-thick shakes. Fresh every day, smashed to order, never frozen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg uppercase text-mustard">Visit</h2>
            <address className="mt-4 not-italic leading-relaxed text-fog">
              {restaurant.address.line1}
              <br />
              {restaurant.address.city} {restaurant.address.postcode}
            </address>
            <p className="mt-4 text-fog">
              <a className="underline-offset-4 hover:text-cream hover:underline" href={`tel:${restaurant.phone.replace(/[^+\d]/g, "")}`}>
                {restaurant.phone}
              </a>
              <br />
              <a className="underline-offset-4 hover:text-cream hover:underline" href={`mailto:${restaurant.email}`}>
                {restaurant.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg uppercase text-mustard">Hours</h2>
            <dl className="mt-4 space-y-1.5 text-sm">
              {ordered.map((h) => (
                <div key={h.day} className="flex justify-between gap-4">
                  <dt className="text-fog">{DAY_NAMES[h.day].slice(0, 3)}</dt>
                  <dd className="font-mono tabular-nums">{h.open && h.close ? `${formatTime(h.open)} – ${formatTime(h.close)}` : "Closed"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-display text-lg uppercase text-mustard">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/menu", label: "Order online" },
                { href: "/reservations", label: "Book a booth" },
                { href: "/#story", label: "Our story" },
                { href: "/admin", label: "Staff panel (demo)" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-fog underline-offset-4 transition-colors hover:text-cream hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Giant wordmark */}
        <p className="text-pop mt-16 select-none text-center text-tomato font-display text-[clamp(4rem,19vw,17rem)] uppercase leading-[0.8] tracking-normal" aria-hidden>
          Hot Bun
        </p>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-line pt-6 text-sm text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} HOT BUN. A fictional restaurant — portfolio demo. Photos: Unsplash.</p>
          <p>Payments run in test mode. No real orders are placed.</p>
        </div>
      </div>
    </footer>
  );
}
