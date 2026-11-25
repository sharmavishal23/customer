import { notFound } from "next/navigation";
import { ALL_SHIPMENTS } from "@/lib/data";
import ShipmentView from "./ShipmentView";

export function generateStaticParams() {
  return ALL_SHIPMENTS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Shipment ${id} · Airflo Track & Trace` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ALL_SHIPMENTS.some((s) => s.id === id)) notFound();
  return <ShipmentView id={id} />;
}
