// app/routes/app._index.jsx
import { useLoaderData, useFetcher, Link } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { getBanners, getShopData } from "../utils/db.helpers.server";
import { canAccessTemplate, getMaxAllowedBanners } from "../utils/permissions";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getShopData(session.shop);

  // Enforce published banner limits based on plan
  const allowedBanners = getMaxAllowedBanners(shopData.plan);
  const publishedBanners = await prisma.banner.findMany({
    where: { shopDomain: session.shop, status: { in: ["PUBLISHED", "ACTIVE"] } },
    orderBy: { updatedAt: "desc" },
  });

  if (publishedBanners.length > allowedBanners) {
    const olderBanners = publishedBanners.slice(allowedBanners);
    const olderIds = olderBanners.map((b) => b.id);
    await prisma.banner.updateMany({
      where: { id: { in: olderIds } },
      data: { status: "UNPUBLISHED" },
    });
  }

  const banners = await getBanners(session.shop);
  const totalTemplates = await prisma.template.count();
  const publishedCount = banners.filter((b) => b.status === "PUBLISHED" || b.status === "ACTIVE").length;

  return {
    shopDomain: session.shop,
    plan: shopData.plan,
    banners,
    stats: {
      publishedBanners: publishedCount,
      totalBanners: banners.length,
      templates: totalTemplates || 12,
      plan: shopData.plan,
    },
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const bannerId = formData.get("bannerId");

  if (intent === "toggleStatus") {
    const targetStatus = formData.get("status");
    const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (banner) {
      const isCurrentlyPublished = banner.status === "PUBLISHED" || banner.status === "ACTIVE";
      const newStatus = targetStatus
        ? targetStatus
        : isCurrentlyPublished
        ? "UNPUBLISHED"
        : "PUBLISHED";

      if (newStatus === "PUBLISHED" || newStatus === "ACTIVE") {
        // Enforce banner limits based on plan
        const shopData = await prisma.shop.findUnique({ where: { shopDomain: session.shop } });
        const allowedBanners = getMaxAllowedBanners(shopData?.plan || "BASIC");
        
        const publishedCount = await prisma.banner.count({
          where: { shopDomain: session.shop, status: { in: ["PUBLISHED", "ACTIVE"] }, NOT: { id: bannerId } }
        });

        if (publishedCount >= allowedBanners) {
          // Unpublish the oldest to make room
          const oldestPublished = await prisma.banner.findFirst({
            where: { shopDomain: session.shop, status: { in: ["PUBLISHED", "ACTIVE"] }, NOT: { id: bannerId } },
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
        where: { id: bannerId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });
    }
    return { success: true };
  }

  if (intent === "duplicate") {
    const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (banner) {
      await prisma.banner.create({
        data: {
          shopDomain: session.shop,
          name: `${banner.name} (Copy)`,
          templateId: banner.templateId,
          status: "DRAFT",
          settings: banner.settings,
        },
      });
    }
    return { success: true };
  }

  if (intent === "delete") {
    await prisma.banner.delete({
      where: { id: bannerId },
    });
    return { success: true };
  }

  return { success: false };
};

export default function Dashboard() {
  const { plan, banners, stats, shopDomain } = useLoaderData();
  const fetcher = useFetcher();
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const storeName = shopDomain
    ? shopDomain.replace('.myshopify.com', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : "Store Owner";

  // Compute optimistic banner statuses during in-flight submissions
  const activeSubmissionId =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === "toggleStatus" &&
    (fetcher.formData?.get("status") === "PUBLISHED" || fetcher.formData?.get("status") === "ACTIVE")
      ? fetcher.formData?.get("bannerId")
      : null;

  const optimisticBanners = banners.map((banner) => {
    const isTogglingThis =
      fetcher.state !== "idle" &&
      fetcher.formData?.get("bannerId") === banner.id &&
      fetcher.formData?.get("intent") === "toggleStatus";

    let status = banner.status;
    if (isTogglingThis) {
      const targetStatus = fetcher.formData?.get("status");
      const isCurrentlyPublished = banner.status === "PUBLISHED" || banner.status === "ACTIVE";
      status = targetStatus || (isCurrentlyPublished ? "UNPUBLISHED" : "PUBLISHED");
    } else if (activeSubmissionId && banner.id !== activeSubmissionId) {
      // If we only allow 1 banner, automatically unpublish this banner on UI
      if (getMaxAllowedBanners(plan) === 1) {
        status = "UNPUBLISHED";
      }
    }

    return { ...banner, status };
  });

  const publishedCount = optimisticBanners.filter(
    (b) => b.status === "PUBLISHED" || b.status === "ACTIVE"
  ).length;

  const handleToggle = (id, currentStatus) => {
    const isCurrentlyPublished = currentStatus === "PUBLISHED" || currentStatus === "ACTIVE";
    const nextStatus = isCurrentlyPublished ? "UNPUBLISHED" : "PUBLISHED";
    fetcher.submit(
      { intent: "toggleStatus", bannerId: id, status: nextStatus },
      { method: "POST" }
    );
  };

  const handleDuplicate = (id) => {
    fetcher.submit({ intent: "duplicate", bannerId: id }, { method: "POST" });
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      fetcher.submit({ intent: "delete", bannerId: deleteTargetId }, { method: "POST" });
      setDeleteTargetId(null);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Top Welcome Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
            Welcome back, {storeName}!
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
            Create and publish scrolling banners for your Shopify store.
          </p>
        </div>

        <Link to="/app/banners/new" className="sf-btn-primary">
          <span>+</span> Create New Banner
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {/* Published Banners */}
        <div className="sf-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#D1FAE5", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            🚀
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>Published Banners</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>{publishedCount}</div>
          </div>
        </div>

        {/* Total Banners */}
        <div className="sf-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            📊
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>Total Banners</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>{optimisticBanners.length}</div>
          </div>
        </div>

        {/* Templates */}
        <div className="sf-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#F0EBFF", color: "#5B2CFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            🎨
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>Templates</div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>{stats.templates}</div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="sf-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#FCE7F3", color: "#EC4899", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            👑
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>Current Plan</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>{stats.plan}</div>
          </div>
        </div>
      </div>

      {/* Recent Banners Section */}
      <div className="sf-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: 0 }}>Recent Banners</h2>
          <Link to="/app/templates" style={{ fontSize: "13px", fontWeight: "600", color: "#5B2CFF", textDecoration: "none" }}>
            View all templates →
          </Link>
        </div>

        {optimisticBanners.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>No banners yet</h3>
            <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "20px" }}>
              Create your first scrolling announcement banner for your store.
            </p>
            <Link to="/app/banners/new" className="sf-btn-primary">
              + Create Banner
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {optimisticBanners.map((banner) => {
              let parsedSettings = {
                messages: ["Sample Message"],
                backgroundColor: "#19D8CF",
                textColor: "#111827",
                direction: "Right to Left",
                dividerIcon: "•",
              };
              try {
                parsedSettings = JSON.parse(banner.settings);
              } catch (e) {}

              const isReverse = parsedSettings.direction === "Left to Right";
              const messages = parsedSettings.messages || ["ANNOUNCEMENT BANNER"];
              const doubledMessages = [...messages, ...messages, ...messages, ...messages];
              const isPublished = banner.status === "PUBLISHED" || banner.status === "ACTIVE";

              const isUnlocked = canAccessTemplate(plan, banner.templateId);

              return (
                <div
                  key={banner.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {/* Left: Row Banner Preview */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 auto", minWidth: 0, opacity: isUnlocked ? 1 : 0.6 }}>
                    <div
                      style={{
                        width: "220px",
                        height: "40px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        background: parsedSettings.backgroundColor || "#19D8CF",
                        color: parsedSettings.textColor || "#111827",
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
                        flexShrink: 0,
                      }}
                    >
                      <div className="sf-marquee-preview-container">
                        <div className={`sf-marquee-track ${isReverse ? "reverse" : ""}`}>
                          {doubledMessages.map((msg, i) => (
                            <span key={i} className="sf-marquee-item" style={{ fontSize: "11px" }}>
                              {msg} <span style={{ opacity: 0.6 }}>{parsedSettings.dividerIcon || "•"}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "2px" }}>
                        {banner.name} {!isUnlocked && <span style={{ fontSize: "12px", color: "#EC4899" }}>🔒 Locked</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {banner.templateId} • {parsedSettings.direction}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status badge, Updated time, Publish Button & Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                    <span
                      className={`sf-badge ${
                        isPublished
                          ? "sf-badge-published"
                          : banner.status === "DRAFT"
                          ? "sf-badge-draft"
                          : "sf-badge-unpublished"
                      }`}
                    >
                      {isPublished ? "Published" : banner.status === "DRAFT" ? "Draft" : "Unpublished"}
                    </span>

                    {/* Publish / Unpublish Action Button */}
                    {!isUnlocked ? (
                      <Link
                        to="/app/pricing"
                        className="sf-btn-primary"
                        style={{ padding: "6px 14px", fontSize: "12px", backgroundColor: "#F3E8FF", color: "#7E22CE" }}
                      >
                        🔒 Upgrade
                      </Link>
                    ) : isPublished ? (
                      <button
                        type="button"
                        onClick={() => handleToggle(banner.id, banner.status)}
                        className="sf-btn-ghost"
                        style={{ padding: "6px 12px", fontSize: "12px", color: "#64748B" }}
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggle(banner.id, banner.status)}
                        className="sf-btn-primary"
                        style={{ padding: "6px 14px", fontSize: "12px", backgroundColor: "#5B2CFF" }}
                      >
                        🚀 Publish
                      </button>
                    )}

                    {/* Toggle Switch */}
                    <label className="sf-switch">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        disabled={!isUnlocked}
                        onChange={() => {
                          if (isUnlocked) handleToggle(banner.id, banner.status);
                        }}
                      />
                      <span className="sf-slider" style={{ opacity: !isUnlocked ? 0.5 : 1 }}></span>
                    </label>

                    {/* Edit */}
                    {!isUnlocked ? (
                      <Link
                        to="/app/pricing"
                        className="sf-btn-ghost"
                        title="Unlock to edit"
                        style={{ padding: "6px 10px", color: "#94A3B8" }}
                      >
                        🔒 Edit
                      </Link>
                    ) : (
                      <Link
                        to={`/app/banners/${banner.id}`}
                        className="sf-btn-ghost"
                        title="Edit banner"
                        style={{ padding: "6px 10px" }}
                      >
                        ✏️ Edit
                      </Link>
                    )}

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(banner.id)}
                      className="sf-btn-ghost"
                      title="Duplicate banner"
                      style={{ padding: "6px 10px" }}
                    >
                      📋
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(banner.id)}
                      className="sf-btn-ghost"
                      title="Delete banner"
                      style={{ padding: "6px 10px", color: "#EF4444" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTargetId && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(17, 24, 39, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="sf-card" style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
              Delete this banner?
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "24px" }}>
              This action cannot be undone and will remove the banner from your store.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button type="button" onClick={() => setDeleteTargetId(null)} className="sf-btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="sf-btn-primary" style={{ backgroundColor: "#EF4444" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
