import type { Handler } from "@netlify/functions";
import { checkoutSubmissionSchema } from "@/lib/checkout/schemas";
import {
  createOrder,
  PatientDetailsRequiredError,
  ProductNotFoundError,
} from "@/server/orders/orderService";

// Creates a Diet4Life order in "pending_payment" status. No payment
// provider is contacted here -- that is Phase 2 (payments-initiate).
// The price is never taken from the request body: createOrder() always
// re-reads it from the products table.
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_json" }) };
  }

  const parsed = checkoutSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "validation_failed", issues: parsed.error.issues }),
    };
  }

  try {
    const order = await createOrder({
      productSlug: parsed.data.productSlug,
      billing: parsed.data.billing,
      patient: parsed.data.patient,
    });

    return {
      statusCode: 201,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        publicStatusToken: order.publicStatusToken,
        status: order.status,
      }),
    };
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return { statusCode: 404, body: JSON.stringify({ error: "product_not_found" }) };
    }
    if (error instanceof PatientDetailsRequiredError) {
      return { statusCode: 400, body: JSON.stringify({ error: "patient_details_required" }) };
    }
    console.error("orders-create failed", error);
    return { statusCode: 500, body: JSON.stringify({ error: "internal_error" }) };
  }
};
