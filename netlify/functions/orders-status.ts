import type { Handler } from "@netlify/functions";
import { getOrderByPublicToken } from "@/server/orders/orderService";

// Resolves order status strictly by the random public_status_token query
// param -- never by order_number or id. Returns only what the checkout
// result UI needs; billing_details/patient_details are never exposed here.
export const handler: Handler = async (event) => {
  const token = event.queryStringParameters?.token;
  if (!token) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_token" }) };
  }

  try {
    const order = await getOrderByPublicToken(token);
    if (!order) {
      return { statusCode: 404, body: JSON.stringify({ error: "not_found" }) };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        status: order.status,
        productName: order.productName,
        productType: order.productType,
        totalCents: order.priceSnapshotCents,
        currency: order.currency,
        invoiceStatus: order.invoiceStatus,
        deliveryStatus: order.deliveryStatus,
      }),
    };
  } catch (error) {
    console.error("orders-status failed", error);
    return { statusCode: 500, body: JSON.stringify({ error: "internal_error" }) };
  }
};
