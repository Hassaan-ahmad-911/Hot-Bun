import type { Metadata } from "next";
import { ReservationsList } from "@/components/admin/ReservationsList";

export const metadata: Metadata = { title: "Bookings" };

export default function AdminReservationsPage() {
  return <ReservationsList />;
}
