// app/routes/api.storefront.banner.jsx
import prisma from "../db.server";
import { getStoreSettings } from "../utils/db.helpers.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shopDomain = url.searchParams.get("shop");
  const bannerId = url.searchParams.get("bannerId");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // If shop domain missing, still try to return latest published banner fallback
  const targetDomain = shopDomain || "";

  let banner = null;
  if (bannerId) {
    banner = await prisma.banner.findFirst({
      where: {
        id: bannerId,
        status: { in: ["PUBLISHED", "ACTIVE"] },
      },
    });
  }

  if (!banner && shopDomain) {
    banner = await prisma.banner.findFirst({
      where: {
        shopDomain: { equals: shopDomain, mode: "insensitive" },
        status: { in: ["PUBLISHED", "ACTIVE"] },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Global Fallback: If shopDomain match fails, return the latest published/active banner
  if (!banner) {
    banner = await prisma.banner.findFirst({
      where: { status: { in: ["PUBLISHED", "ACTIVE"] } },
      orderBy: { updatedAt: "desc" },
    });
  }

  const storeSettings = await getStoreSettings(shopDomain);

  if (!banner) {
    return new Response(
      JSON.stringify({
        active: false,
        message: "No active banner found",
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  let parsedSettings = {};
  try {
    parsedSettings = JSON.parse(banner.settings);
  } catch (e) {}

  return new Response(
    JSON.stringify({
      active: true,
      id: banner.id,
      name: banner.name,
      settings: {
        ...parsedSettings,
        reduceMotion: storeSettings.reduceMotion,
        pauseOnHover: storeSettings.pauseOnHover,
        pauseOnFocus: storeSettings.pauseOnFocus,
      },
    }),
    { status: 200, headers: corsHeaders }
  );
};
