import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "@/components/views/inventory-page";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryPage,
});
