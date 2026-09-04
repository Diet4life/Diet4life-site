import type { Handler } from "@netlify/functions";
import { listActiveProducts } from "@/server/orders/orderService";

export const handler: Handler = async () => {
  try {
    const products = await listActiveProducts();
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          shortDescription: p.shortDescription,
          description: p.description,
          priceCents: p.priceCents,
          currency: p.currency,
          productType: p.productType,
        })),
      ),
    };
  } catch (error) {
    console.error("products-list failed", error);
    return { statusCode: 500, body: JSON.stringify({ error: "internal_error" }) };
  }
};
