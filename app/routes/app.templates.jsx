// app/routes/app.templates.jsx
import { useLoaderData, useNavigate, Link } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { getShopData, DEFAULT_TEMPLATES } from "../utils/db.helpers.server";
import { canAccessTemplate } from "../utils/permissions";
import { verifyAndSyncSubscription } from "../utils/billing.server";

export const loader = async ({ request }) => {
  const { session, redirect } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");
  if (chargeId) {
    await verifyAndSyncSubscription(request, chargeId);
    // Removed redirect here to avoid breaking App Bridge iframe context on load
  }

  const shopData = await getShopData(session.shop);

  return {
    shopPlan: shopData.plan || "BASIC",
    templates: DEFAULT_TEMPLATES,
  };
};

export default function TemplatesPage() {
  const { shopPlan, templates } = useLoaderData();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredTemplates = templates.filter((t) => {
    if (activeFilter === "ALL") return true;
    return t.plan === activeFilter;
  });

  const counts = {
    ALL: templates.length,
    FREE: templates.filter((t) => t.plan === "FREE").length,
    BASIC: templates.filter((t) => t.plan === "BASIC").length,
    PREMIUM: templates.filter((t) => t.plan === "PREMIUM").length,
  };

  return (
    <div style={{ maxWidth: "1160px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>🎨</span>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
            Banner Templates
          </h1>
        </div>
        <p style={{ fontSize: "14px", color: "#64748B", margin: 0, maxWidth: "650px" }}>
          Choose from our library of high-converting, animated announcement banners. Filter by your subscription plan to unlock features like gradient backgrounds and CTA buttons.
        </p>
      </div>

      {/* Top Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
        {[
          { key: "ALL", label: `All Templates (${counts.ALL})`, badgeBg: "#E0E7FF", badgeColor: "#4338CA" },
          { key: "FREE", label: `Free (${counts.FREE})`, badgeBg: "#D1FAE5", badgeColor: "#065F46" },
          { key: "BASIC", label: `Basic (${counts.BASIC})`, badgeBg: "#E0F2FE", badgeColor: "#0369A1" },
          { key: "PREMIUM", label: `Premium (${counts.PREMIUM})`, badgeBg: "#F3E8FF", badgeColor: "#7E22CE" },
        ].map((f) => {
          const isSelected = activeFilter === f.key;
          return (
            <button
              type="button"
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: "8px 18px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: isSelected ? "#5B2CFF" : "#FFFFFF",
                color: isSelected ? "#FFFFFF" : "#475569",
                boxShadow: isSelected ? "0 4px 12px rgba(91, 44, 255, 0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
                border: isSelected ? "1px solid #5B2CFF" : "1px solid #E2E8F0",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Templates Grid - 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {filteredTemplates.map((template) => {
          const isUnlocked = canAccessTemplate(shopPlan, template.id);
          let s = {
            messages: ["ANNOUNCEMENT"],
            backgroundColor: "#19D8CF",
            textColor: "#111827",
            direction: "Right to Left",
            dividerIcon: "•",
            hasCta: false,
          };

          try {
            s = JSON.parse(template.settings);
          } catch (e) {}

          const messages = s.messages || ["ANNOUNCEMENT"];
          const doubledMessages = [...messages, ...messages, ...messages];
          const isGradient = s.backgroundColor && s.backgroundColor.includes("gradient");

          return (
            <div
              key={template.id}
              className="sf-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: isUnlocked ? "#FFFFFF" : "#FAFBFD",
                borderRadius: "14px",
                border: template.plan === "PREMIUM" ? "1px solid #E9D5FF" : "1px solid #E2E8F0",
                boxShadow: template.plan === "PREMIUM" ? "0 4px 20px rgba(124, 58, 237, 0.08)" : "0 2px 8px rgba(15, 23, 42, 0.04)",
                position: "relative",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <div>
                {/* Header: Title & Badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>
                      {template.name}
                    </h3>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {s.hasCta && (
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#FEF3C7", color: "#D97706" }}>
                          ⚡ CTA Button
                        </span>
                      )}
                      {isGradient && (
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#F3E8FF", color: "#7E22CE" }}>
                          🌈 Gradient
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`sf-badge ${
                      template.plan === "FREE"
                        ? "sf-badge-free"
                        : template.plan === "BASIC"
                        ? "sf-badge-basic"
                        : "sf-badge-premium"
                    }`}
                  >
                    {template.plan}
                  </span>
                </div>

                {/* Marquee Live Banner Preview Box */}
                <div
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "8px",
                    background: s.backgroundColor || "#0D1117",
                    color: s.textColor || "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    marginBottom: "16px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    position: "relative",
                  }}
                >
                  <div className="sf-marquee-preview-container">
                    <div className="sf-marquee-track">
                      {doubledMessages.map((msg, i) => (
                        <span key={i} className="sf-marquee-item" style={{ fontSize: "12px", fontWeight: s.fontWeight || "700", letterSpacing: s.letterSpacing || "1px" }}>
                          <span>{msg}</span>
                          {s.dividerIcon && (
                            <span style={{ opacity: 0.8, color: s.dividerColor || s.textColor, margin: "0 4px" }}>
                              {s.dividerIcon}
                            </span>
                          )}
                          {s.hasCta && (
                            <span
                              style={{
                                display: "inline-block",
                                marginLeft: "8px",
                                padding: "3px 10px",
                                borderRadius: `${s.ctaRadius || 6}px`,
                                backgroundColor: s.ctaBg || "#FFFFFF",
                                color: s.ctaColor || "#111827",
                                fontSize: "10px",
                                fontWeight: "800",
                                textTransform: "uppercase",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                              }}
                            >
                              {s.ctaText || "CLICK"}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "20px", lineHeight: "1.4" }}>
                  {template.description || "Clean and customizable scrolling banner template."}
                </p>
              </div>

              {/* Action Button */}
              {isUnlocked ? (
                <button
                  type="button"
                  onClick={() => navigate(`/app/banners/new?templateId=${template.id}`)}
                  className="sf-btn-primary"
                  style={{ width: "100%", padding: "10px 14px", fontSize: "13px" }}
                >
                  Use Template
                </button>
              ) : (
                <Link
                  to="/app/pricing"
                  className="sf-btn-ghost"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: "13px",
                    justifyContent: "center",
                    backgroundColor: "#FFFFFF",
                    color: "#5B2CFF",
                    borderColor: "#CBD5E1",
                    fontWeight: "600",
                  }}
                >
                  🔒 Upgrade Plan to Unlock
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

