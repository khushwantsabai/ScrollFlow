// app/routes/app.pricing.jsx
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { getShopData } from "../utils/db.helpers.server";
import { requestSubscription } from "../utils/billing.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopData = await getShopData(session.shop);

  return {
    currentPlan: shopData.plan || "BASIC",
  };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const targetPlan = formData.get("plan");

  const result = await requestSubscription(request, targetPlan);
  
  if (result.confirmationUrl) {
    return { redirectUrl: result.confirmationUrl };
  }

  return { success: true, plan: targetPlan };
};

export default function PricingPage() {
  const { currentPlan } = useLoaderData();
  const fetcher = useFetcher();

  const handleSelectPlan = (planName) => {
    fetcher.submit({ plan: planName }, { method: "POST" });
  };

  const isSubmitting = fetcher.state === "submitting";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header & Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
            Pricing
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
            Choose the perfect plan for your store.
          </p>
        </div>
      </div>

      {/* 3 Pricing Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "stretch" }}>
        
        {/* FREE CARD */}
        <div
          className="sf-card"
          style={{
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>🪶</span>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Free</h3>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "36px", fontWeight: "800", color: "#111827" }}>$0</span>
              <span style={{ fontSize: "14px", color: "#64748B" }}> /month</span>
            </div>

            <div style={{ fontSize: "13px", fontWeight: "600", color: "#2563EB", marginBottom: "20px" }}>
              3 Free Templates
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "#475569" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> 3 Free scrolling banner templates</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Custom text & icon dividers</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Direction & speed control</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Color customization</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Responsive mobile design</li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan("FREE")}
            disabled={currentPlan === "FREE" || isSubmitting}
            className="sf-btn-ghost"
            style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: currentPlan === "FREE" ? 0.7 : 1 }}
          >
            {currentPlan === "FREE" ? "Current Plan" : "Downgrade to Free"}
          </button>
        </div>

        {/* BASIC CARD (MOST POPULAR) */}
        <div
          className="sf-card"
          style={{
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "2px solid #5B2CFF",
            boxShadow: "0 8px 24px rgba(91, 44, 255, 0.12)",
            position: "relative",
          }}
        >
          {/* Most Popular Badge */}
          <div
            style={{
              position: "absolute",
              top: "-14px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#5B2CFF",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: "700",
              padding: "4px 14px",
              borderRadius: "9999px",
              letterSpacing: "0.5px",
            }}
          >
            Most Popular
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>⚡</span>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Basic</h3>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "36px", fontWeight: "800", color: "#111827" }}>$9</span>
              <span style={{ fontSize: "14px", color: "#64748B" }}> /month</span>
            </div>

            <div style={{ fontSize: "13px", fontWeight: "600", color: "#2563EB", marginBottom: "20px" }}>
              7 Templates (3 Free + 4 Basic)
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "#475569" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> All Free features</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> 4 Exclusive Basic templates</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Up to 10 active banners</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Multiple messages & divider icons</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Advanced typography & styling</li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan("BASIC")}
            disabled={currentPlan === "BASIC" || isSubmitting}
            className="sf-btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: currentPlan === "BASIC" ? 0.7 : 1 }}
          >
            {currentPlan === "BASIC" ? "Current Plan" : "Upgrade to Basic"}
          </button>
        </div>

        {/* PREMIUM CARD */}
        <div
          className="sf-card"
          style={{
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>👑</span>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>Premium</h3>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "36px", fontWeight: "800", color: "#111827" }}>$19</span>
              <span style={{ fontSize: "14px", color: "#64748B" }}> /month</span>
            </div>

            <div style={{ fontSize: "13px", fontWeight: "600", color: "#2563EB", marginBottom: "20px" }}>
              All 12 Templates (Full Unlocked)
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "#475569" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> All Basic & Free features</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> 5 Exclusive Premium templates</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> High-converting Call-to-Action (CTA) buttons</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Vibrant multi-color gradient backgrounds</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#10B981" }}>✓</span> Up to 50 active banners</li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan("PREMIUM")}
            disabled={currentPlan === "PREMIUM" || isSubmitting}
            className="sf-btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", backgroundColor: "#5B2CFF", opacity: currentPlan === "PREMIUM" ? 0.7 : 1 }}
          >
            {currentPlan === "PREMIUM" ? "Current Plan" : "Upgrade to Premium"}
          </button>
        </div>

      </div>
    </div>
  );
}
