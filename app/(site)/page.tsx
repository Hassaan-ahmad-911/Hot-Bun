import { BigCta } from "@/components/home/BigCta";
import { Featured } from "@/components/home/Featured";
import { Stats } from "@/components/home/Stats";
import { TickerBands } from "@/components/home/TickerBands";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Story } from "@/components/home/Story";
import { Visit } from "@/components/home/Visit";
import { restaurant } from "@/data/restaurant";
import { DAY_NAMES } from "@/lib/dates";

/** schema.org Restaurant data — helps Google show hours, menu and ordering links. */
function RestaurantJsonLd() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hotbun.example";
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    servesCuisine: ["American", "Burgers"],
    priceRange: "$",
    telephone: restaurant.phone,
    url: site,
    menu: `${site}/menu`,
    acceptsReservations: true,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address.line1,
      addressLocality: restaurant.address.city,
      postalCode: restaurant.address.postcode,
    },
    openingHoursSpecification: restaurant.hours
      .filter((h) => h.open && h.close)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_NAMES[h.day], opens: h.open, closes: h.close })),
    potentialAction: {
      "@type": "OrderAction",
      target: `${site}/menu`,
      deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModePickUp", "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"],
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function HomePage() {
  return (
    <>
      <RestaurantJsonLd />
      <Hero />
      <TickerBands />
      <Featured />
      <Stats />
      <HowItWorks />
      <Story />
      <Visit />
      <BigCta />
    </>
  );
}
