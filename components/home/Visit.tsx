"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Phone } from "lucide-react";
import { SplitText } from "@/components/motion/Kinetic";
import { Reveal } from "@/components/motion/Reveal";
import { OpenStatus } from "@/components/site/OpenStatus";
import { buttonClasses } from "@/components/ui/Button";
import { restaurant } from "@/data/restaurant";
import { DAY_NAMES, formatTime } from "@/lib/dates";
import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

function MapPlaceholder() {
  return (
    <div className="relative h-full min-h-[22rem] overflow-hidden rounded-[1.75rem] border-2 border-ink bg-mustard-tint shadow-pop">
      {/* Illustrated street map — replace with a Mapbox/Google embed. */}
      <svg viewBox="0 0 600 420" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Map showing HOT BUN at ${restaurant.address.line1}`}>
        <path d="M-20 300 C120 260 200 340 330 300 S520 250 640 290 L640 360 C520 320 430 380 330 360 S110 320 -20 370Z" fill="#9ED3B4" stroke="#111" strokeWidth="2" />
        <g stroke="#111" strokeWidth="18" strokeLinecap="round" fill="none">
          <path d="M-10 120 H620" />
          <path d="M140 -10 V440" />
          <path d="M420 -10 V440" />
        </g>
        <g stroke="#FFFDF7" strokeWidth="13" strokeLinecap="round" fill="none">
          <path d="M-10 120 H620" />
          <path d="M140 -10 V440" />
          <path d="M420 -10 V440" />
        </g>
        <g fill="#FFFFFF" stroke="#111" strokeWidth="2">
          <rect x="165" y="140" width="100" height="58" rx="10" />
          <rect x="300" y="40" width="96" height="56" rx="10" />
          <rect x="445" y="150" width="70" height="80" rx="10" />
          <rect x="20" y="148" width="92" height="56" rx="10" />
        </g>
        <text x="300" y="338" fill="#111" fontFamily="var(--font-plex-mono)" fontSize="13" fontWeight="600" letterSpacing="4">RIVER WALK</text>
        <text x="442" y="110" fill="#111" fontFamily="var(--font-plex-mono)" fontSize="11" fontWeight="600" letterSpacing="3">FOUNDRY LN</text>
      </svg>
      <div className="absolute left-[47%] top-[27%] -translate-x-1/2 -translate-y-full" aria-hidden>
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <span className="rounded-full border-2 border-ink bg-tomato px-3 py-1 font-display text-sm font-extrabold uppercase text-white shadow-pop-sm">HOT BUN</span>
          <MapPin className="h-10 w-10 fill-tomato text-ink" />
        </motion.div>
      </div>
    </div>
  );
}

export function Visit() {
  const now = useNow();
  const todayIndex = now?.getDay();
  const ordered = [...restaurant.hours.slice(1), restaurant.hours[0]];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restaurant.address.line1}, ${restaurant.address.city} ${restaurant.address.postcode}`,
  )}`;

  return (
    <section id="visit" className="py-20 lg:py-28" aria-labelledby="visit-title">
      <div className="container">
        <p className="inline-block rotate-2 rounded-full border-2 border-ink bg-mustard px-3 py-1 font-display text-sm font-extrabold uppercase shadow-pop-sm">
          Find us
        </p>
        <h2 id="visit-title" className="mt-4 font-display text-display-lg uppercase">
          <SplitText text="48 Foundry Lane." by="word" />
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="rounded-[1.75rem] border-2 border-ink bg-card p-6 shadow-pop">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-3xl uppercase">Hours</h3>
                <OpenStatus showLead={false} className="border-2 border-ink bg-cream" />
              </div>
              <dl className="mt-5 space-y-1.5">
                {ordered.map((h) => {
                  const today = h.day === todayIndex;
                  return (
                    <div
                      key={h.day}
                      className={cn("flex items-baseline justify-between rounded-xl px-3 py-2", today ? "border-2 border-ink bg-mustard font-bold" : "border-2 border-transparent")}
                    >
                      <dt className="font-semibold">
                        {DAY_NAMES[h.day]}
                        {today && <span className="ml-2 font-mono text-xs uppercase">Today</span>}
                      </dt>
                      <dd className="font-mono tabular-nums">{h.open && h.close ? `${formatTime(h.open)} – ${formatTime(h.close)}` : "Closed"}</dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-4 text-sm text-muted">Grill takes last orders 15 minutes before close. Walk-ins always welcome.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-5 lg:col-span-7">
            <MapPlaceholder />
            <div className="flex flex-col gap-4 rounded-[1.5rem] border-2 border-ink bg-card p-5 shadow-pop sm:flex-row sm:items-center sm:justify-between">
              <address className="not-italic">
                <span className="block font-display text-2xl uppercase">{restaurant.address.line1}</span>
                <span className="text-muted">
                  {restaurant.address.city} {restaurant.address.postcode} · 3 min from Riverside station
                </span>
              </address>
              <div className="flex gap-2">
                <a href={mapsUrl} target="_blank" rel="noreferrer" className={buttonClasses({ variant: "secondary", size: "md" })}>
                  <Navigation className="h-4 w-4" aria-hidden /> Directions
                </a>
                <a
                  href={`tel:${restaurant.phone.replace(/[^+\d]/g, "")}`}
                  className={buttonClasses({ variant: "mustard", size: "md", className: "px-4" })}
                  aria-label={`Call HOT BUN at ${restaurant.phone}`}
                >
                  <Phone className="h-4 w-4" aria-hidden /> Call
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
