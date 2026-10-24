import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuView } from "@/components/menu/MenuView";

export const metadata: Metadata = {
  title: "Menu — order online",
  description:
    "Order HOT BUN online: smash burgers, Nashville hot chicken, loaded fries and thick shakes. Pickup in about 15 minutes or delivery within 5 km.",
  alternates: { canonical: "/menu" },
  openGraph: { title: "HOT BUN menu — order online", url: "/menu" },
};

export default function MenuPage() {
  return (
    <Suspense>
      <MenuView />
    </Suspense>
  );
}
