// app/routes/app.banners.$id.jsx
import { useLoaderData, redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { getShopData } from "../utils/db.helpers.server";
import { canAccessTemplate, getMaxAllowedBanners } from "../utils/permissions";
import prisma from "../db.server";
import BannerEditorForm from "../components/BannerEditorForm";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getShopData(session.shop);

  const banner = await prisma.banner.findUnique({
    where: { id: params.id },
  });

  if (!banner) {
    throw new Response("Banner Not Found", { status: 404 });
  }

  if (!canAccessTemplate(shopData.plan || "BASIC", banner.templateId)) {
    return redirect("/app/pricing");
  }

  return {
    shopPlan: shopData.plan || "BASIC",
    banner,
  };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const name = formData.get("name");
  const templateId = formData.get("templateId");
  const settings = formData.get("settings");
  const status = formData.get("status") || "PUBLISHED";

  const shopData = await prisma.shop.findUnique({ where: { shopDomain: session.shop } });
  const plan = shopData?.plan || "BASIC";

  if (!canAccessTemplate(plan, templateId)) {
    return redirect("/app/pricing");
  }

  if (status === "PUBLISHED" || status === "ACTIVE") {
    const allowedBanners = getMaxAllowedBanners(plan);
    const publishedCount = await prisma.banner.count({
      where: { shopDomain: session.shop, status: { in: ["PUBLISHED", "ACTIVE"] }, NOT: { id: params.id } }
    });

    if (publishedCount >= allowedBanners) {
      const oldestPublished = await prisma.banner.findFirst({
        where: { shopDomain: session.shop, status: { in: ["PUBLISHED", "ACTIVE"] }, NOT: { id: params.id } },
        orderBy: { updatedAt: "asc" },
      });
      if (oldestPublished) {
        await prisma.banner.update({
          where: { id: oldestPublished.id },
          data: { status: "UNPUBLISHED" },
        });
      }
    }
  }

  await prisma.banner.update({
    where: { id: params.id },
    data: {
      name,
      templateId,
      status,
      settings,
      updatedAt: new Date(),
    },
  });

  return { success: true };
};

export default function EditBannerPage() {
  const { shopPlan, banner } = useLoaderData();
  return <BannerEditorForm initialData={banner} isNew={false} shopPlan={shopPlan} />;
}
