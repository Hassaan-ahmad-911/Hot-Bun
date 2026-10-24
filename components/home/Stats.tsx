"use client";

import { motion } from "framer-motion";
import { Counter } from "@/components/motion/Kinetic";
import { Wave } from "./Wave";

const STATS = [
  { to: 182400, label: "Burgers smashed", note: "since 2016" },
  { to: 4.9, decimals: 1, label: "Average rating", note: "2,300+ reviews" },
  { to: 15, suffix: " min", label: "Average pickup", note: "order to hand" },
  { to: 0, label: "Freezers", note: "everything fresh, daily" },
];

/** Big count-up numbers on a loud ink band. Labelled sample figures in the copy below. */
export function Stats() {
  return (
    <div>
      <Wave className="-mb-px text-ink" />
      <section className="on-dark bg-ink py-16 text-cream lg:py-20" aria-label="HOT BUN in numbers">
        <div className="container grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ type: "spring", stiffness: 160, damping: 18, delay: i * 0.08 }}
            >
              <p className="font-display text-5xl uppercase leading-none text-mustard sm:text-6xl lg:text-7xl">
                <Counter to={s.to} decimals={s.decimals} suffix={s.suffix} />
              </p>
              <p className="mt-3 font-display text-xl uppercase">{s.label}</p>
              <p className="text-sm text-fog">{s.note}</p>
            </motion.div>
          ))}
        </div>
        <p className="container mt-10 text-xs text-fog">Figures are sample data for this demo.</p>
      </section>
      <Wave flip className="-mt-px text-ink" />
    </div>
  );
}
