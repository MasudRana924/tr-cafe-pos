import { createFileRoute, useParams } from "@tanstack/react-router";
import { useOrderQuery } from "@/hooks/useOrders";
import { OrderConfirmationScreen } from "@/components/pos/order-confirmation-screen";

export const Route = createFileRoute("/pos/order/$id")({
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { id } = useParams({ from: "/pos/order/$id" });
  const { data: order, isLoading, isError } = useOrderQuery(id, Boolean(id));

  if (isLoading) {
    return <OrderConfirmationScreen state="loading" />;
  }

  if (isError || !order) {
    return <OrderConfirmationScreen state="error" />;
  }

  return <OrderConfirmationScreen state="ready" order={order} />;
}
