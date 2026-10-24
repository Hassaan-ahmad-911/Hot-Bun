import type { Metadata } from "next";
import { ReservationFlow } from "@/components/reservations/ReservationFlow";

export const metadata: Metadata = {
  title: "Book a table",
  description: "Book a booth at HOT BUN — booths, counter seats by the flat-top, or the patio. Tables for up to ten, Tuesday to Sunday.",
  alternates: { canonical: "/reservations" },
  openGraph: { title: "Book a booth at HOT BUN", url: "/reservations" },
};

export default function ReservationsPage() {
  return <ReservationFlow />;
}
