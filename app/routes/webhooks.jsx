import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    console.log(`Webhook triggered for uninstalled shop: ${shop}`);
  }

  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await prisma.session.deleteMany({ where: { shop } });
      }
      await prisma.shop.updateMany({
        where: { shopDomain: shop },
        data: { plan: "FREE" }, // Downgrade or clear subscription
      });
      break;

    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
      // These are required compliance webhooks. You must return 200 OK.
      // Implement specific data redaction or export logic if you store PII.
      break;

    default:
      console.log(`Unhandled webhook topic: ${topic}`);
      break;
  }

  return new Response("", { status: 200 });
};
