// app/routes/app.banners.$id.jsx
import { useLoaderData, redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { getShopData } from "../utils/db.helpers.server";
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

  if (status === "PUBLISHED" || status === "ACTIVE") {
    // Unpublish all other banners for this shop domain so ONLY ONE is published at a time
    await prisma.banner.updateMany({
      where: { shopDomain: session.shop, NOT: { id: params.id } },
      data: { status: "UNPUBLISHED" },
    });
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
