import type { Metadata } from "next";
import { OrdersRail } from "@/components/admin/OrdersRail";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return <OrdersRail />;
}
