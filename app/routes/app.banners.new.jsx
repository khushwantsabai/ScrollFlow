// app/routes/app.banners.new.jsx
import { useLoaderData, redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { getShopData, DEFAULT_TEMPLATES } from "../utils/db.helpers.server";
import { canAccessTemplate, getMaxAllowedBanners } from "../utils/permissions";
import prisma from "../db.server";
import BannerEditorForm from "../components/BannerEditorForm";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const templateId = url.searchParams.get("templateId");

  const shopData = await getShopData(session.shop);
  
  let initialTemplateSettings = null;
  const isUnlocked = templateId ? canAccessTemplate(shopData.plan || "BASIC", templateId) : true;
  
  if (templateId && isUnlocked) {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      initialTemplateSettings = template.settings;
    }
  }

  return {
    shopPlan: shopData.plan || "BASIC",
    initialData: {
      name: "New Announcement Banner",
      templateId: templateId || "template-1",
      settings: initialTemplateSettings,
    },
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const name = formData.get("name") || "Untitled Banner";
  const templateId = formData.get("templateId") || "template-1";
  const settings = formData.get("settings") || "{}";
  const status = formData.get("status") || "PUBLISHED";

  const shopData = await prisma.shop.findUnique({ where: { shopDomain: session.shop } });
  const plan = shopData?.plan || "BASIC";

  if (!canAccessTemplate(plan, templateId)) {
    return redirect("/app/pricing");
  }

  if (status === "PUBLISHED" || status === "ACTIVE") {
    const allowedBanners = getMaxAllowedBanners(plan);
    const publishedCount = await prisma.banner.count({
      where: { shopDomain: session.shop, status: { in: ["PUBLISHED", "ACTIVE"] } }
    });

    if (publishedCount >= allowedBanners) {
      const oldestPublished = await prisma.banner.findFirst({
        where: { shopDomain: session.shop, status: { in: ["PUBLISHED", "ACTIVE"] } },
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

  const banner = await prisma.banner.create({
    data: {
      shopDomain: session.shop,
      name,
      templateId,
      status,
      settings,
    },
  });

  return redirect(`/app/banners/${banner.id}`);
};

export default function NewBannerPage() {
  const { shopPlan, initialData } = useLoaderData();
  return <BannerEditorForm initialData={initialData} isNew={true} shopPlan={shopPlan} />;
}
