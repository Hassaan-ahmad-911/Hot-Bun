import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/order/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderConfirmation id={id} />;
}
