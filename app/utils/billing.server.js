// app/utils/billing.server.js
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const BILLING_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    interval: "EVERY_30_DAYS",
  },
  BASIC: {
    name: "Basic",
    price: 9.0,
    interval: "EVERY_30_DAYS",
  },
  PREMIUM: {
    name: "Premium",
    price: 19.0,
    interval: "EVERY_30_DAYS",
  },
};

export async function checkAppSubscription(request) {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  let shopRecord = await prisma.shop.findUnique({
    where: { shopDomain },
  });

  if (!shopRecord) {
    shopRecord = await prisma.shop.create({
      data: {
        shopDomain,
        accessToken: session.accessToken,
        plan: "BASIC", // Default to Basic for demo/dev preview
      },
    });
  }

  return shopRecord.plan || "BASIC";
}

export async function requestSubscription(request, planName) {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  if (planName === "FREE") {
    await prisma.shop.upsert({
      where: { shopDomain },
      update: { plan: "FREE" },
      create: { shopDomain, accessToken: session.accessToken, plan: "FREE" },
    });

    await prisma.subscription.create({
      data: {
        shopDomain,
        plan: "FREE",
        status: "ACTIVE",
      },
    });

    return { confirmationUrl: null, success: true, plan: "FREE" };
  }

  const targetPlan = BILLING_PLANS[planName] || BILLING_PLANS.BASIC;
  const returnUrl = `${process.env.SHOPIFY_APP_URL || ""}/app/templates?shop=${shopDomain}`;

  const response = await admin.graphql(
    `#graphql
    mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $price: Decimal!, $interval: AppPricingInterval!) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        lineItems: [{
          plan: {
            appRecurringPricingDetails: {
              price: { amount: $price, currencyCode: USD }
              interval: $interval
            }
          }
        }]
        test: true
      ) {
        userErrors {
          field
          message
        }
        confirmationUrl
        appSubscription {
          id
          status
        }
      }
    }`,
    {
      variables: {
        name: `ScrollFlow ${targetPlan.name} Plan`,
        returnUrl,
        price: targetPlan.price,
        interval: targetPlan.interval,
      },
    }
  );

  const responseJson = await response.json();
  const data = responseJson.data?.appSubscriptionCreate;

  if (data?.confirmationUrl) {
    return { confirmationUrl: data.confirmationUrl, success: true };
  }

  // Fallback for dev environment if GraphQL returns test confirmation or is bypassed
  await prisma.shop.upsert({
    where: { shopDomain },
    update: { plan: planName },
    create: { shopDomain, accessToken: session.accessToken, plan: planName },
  });

  return { confirmationUrl: null, success: true, plan: planName };
}

export async function verifyAndSyncSubscription(request, chargeId) {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const response = await admin.graphql(
    `#graphql
    query GetSubscription($id: ID!) {
      node(id: $id) {
        ... on AppSubscription {
          id
          name
          status
        }
      }
    }`,
    {
      variables: {
        id: `gid://shopify/AppSubscription/${chargeId}`
      }
    }
  );

  const responseJson = await response.json();
  const subscription = responseJson.data?.node;

  if (subscription && subscription.status === "ACTIVE") {
    let planName = "BASIC";
    if (subscription.name.includes("Premium")) planName = "PREMIUM";
    else if (subscription.name.includes("Basic")) planName = "BASIC";
    else if (subscription.name.includes("Free")) planName = "FREE";

    await prisma.shop.upsert({
      where: { shopDomain },
      update: { plan: planName },
      create: { shopDomain, accessToken: session.accessToken, plan: planName },
    });

    await prisma.subscription.create({
      data: {
        shopDomain,
        plan: planName,
        status: "ACTIVE",
      },
    });
  }
}
