// app/routes/app.settings.jsx
import { useLoaderData, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import { authenticate } from "../shopify.server";
import { getStoreSettings } from "../utils/db.helpers.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getStoreSettings(session.shop);

  return { settings };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const defaultAnimation = formData.get("defaultAnimation");
  const defaultSpeed = formData.get("defaultSpeed");
  const defaultHeight = Number(formData.get("defaultHeight")) || 40;
  const defaultBgColor = formData.get("defaultBgColor");
  const defaultTextColor = formData.get("defaultTextColor");
  const defaultHoverColor = formData.get("defaultHoverColor");
  const reduceMotion = formData.get("reduceMotion") === "true";
  const pauseOnHover = formData.get("pauseOnHover") === "true";
  const pauseOnFocus = formData.get("pauseOnFocus") === "true";

  await prisma.storeSettings.upsert({
    where: { shopDomain: session.shop },
    update: {
      defaultAnimation,
      defaultSpeed,
      defaultHeight,
      defaultBgColor,
      defaultTextColor,
      defaultHoverColor,
      reduceMotion,
      pauseOnHover,
      pauseOnFocus,
    },
    create: {
      shopDomain: session.shop,
      defaultAnimation,
      defaultSpeed,
      defaultHeight,
      defaultBgColor,
      defaultTextColor,
      defaultHoverColor,
      reduceMotion,
      pauseOnHover,
      pauseOnFocus,
    },
  });

  return { success: true };
};

export default function SettingsPage() {
  const { settings } = useLoaderData();
  const fetcher = useFetcher();
  const [showToast, setShowToast] = useState(false);

  const [form, setForm] = useState({
    defaultAnimation: settings.defaultAnimation || "Right to Left",
    defaultSpeed: settings.defaultSpeed || "Normal",
    defaultHeight: settings.defaultHeight || 40,
    defaultBgColor: settings.defaultBgColor || "#19D8CF",
    defaultTextColor: settings.defaultTextColor || "#111827",
    defaultHoverColor: settings.defaultHoverColor || "#06B6D4",
    reduceMotion: settings.reduceMotion ?? false,
    pauseOnHover: settings.pauseOnHover ?? true,
    pauseOnFocus: settings.pauseOnFocus ?? true,
  });

  useEffect(() => {
    if (fetcher.data?.success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fetcher.data]);

  const handleSubmit = () => {
    fetcher.submit(
      {
        defaultAnimation: form.defaultAnimation,
        defaultSpeed: form.defaultSpeed,
        defaultHeight: form.defaultHeight.toString(),
        defaultBgColor: form.defaultBgColor,
        defaultTextColor: form.defaultTextColor,
        defaultHoverColor: form.defaultHoverColor,
        reduceMotion: form.reduceMotion.toString(),
        pauseOnHover: form.pauseOnHover.toString(),
        pauseOnFocus: form.pauseOnFocus.toString(),
      },
      { method: "POST" }
    );
  };

  const isSaving = fetcher.state === "submitting";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Toast Banner */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#10B981",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
            zIndex: 1000,
          }}
        >
          ✓ Settings saved successfully.
        </div>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
          Settings
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
          Configure your default settings and store preferences.
        </p>
      </div>

      {/* 3 Columns / Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        
        {/* Store Settings Card */}
        <div className="sf-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "18px" }}>
            Store Settings
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                Default Animation
              </label>
              <select
                value={form.defaultAnimation}
                onChange={(e) => setForm({ ...form, defaultAnimation: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
              >
                <option value="Right to Left">Right to Left</option>
                <option value="Left to Right">Left to Right</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                Default Speed
              </label>
              <select
                value={form.defaultSpeed}
                onChange={(e) => setForm({ ...form, defaultSpeed: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
              >
                <option value="Slow">Slow</option>
                <option value="Normal">Normal</option>
                <option value="Fast">Fast</option>
                <option value="Very Fast">Very Fast</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                Default Height
              </label>
              <select
                value={form.defaultHeight}
                onChange={(e) => setForm({ ...form, defaultHeight: Number(e.target.value) })}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
              >
                <option value="30">30px</option>
                <option value="40">40px</option>
                <option value="50">50px</option>
                <option value="60">60px</option>
              </select>
            </div>
          </div>
        </div>

        {/* Colors Card */}
        <div className="sf-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "18px" }}>
            Colors
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                Default Background
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="color"
                  value={form.defaultBgColor}
                  onChange={(e) => setForm({ ...form, defaultBgColor: e.target.value })}
                  style={{ width: "36px", height: "34px", padding: 0, border: "none", cursor: "pointer", borderRadius: "6px" }}
                />
                <input
                  type="text"
                  value={form.defaultBgColor}
                  onChange={(e) => setForm({ ...form, defaultBgColor: e.target.value })}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                Default Text Color
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="color"
                  value={form.defaultTextColor}
                  onChange={(e) => setForm({ ...form, defaultTextColor: e.target.value })}
                  style={{ width: "36px", height: "34px", padding: 0, border: "none", cursor: "pointer", borderRadius: "6px" }}
                />
                <input
                  type="text"
                  value={form.defaultTextColor}
                  onChange={(e) => setForm({ ...form, defaultTextColor: e.target.value })}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                Default Hover Color
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="color"
                  value={form.defaultHoverColor}
                  onChange={(e) => setForm({ ...form, defaultHoverColor: e.target.value })}
                  style={{ width: "36px", height: "34px", padding: 0, border: "none", cursor: "pointer", borderRadius: "6px" }}
                />
                <input
                  type="text"
                  value={form.defaultHoverColor}
                  onChange={(e) => setForm({ ...form, defaultHoverColor: e.target.value })}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Card */}
        <div className="sf-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "18px" }}>
            Accessibility
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>Reduce motion support</div>
                <div style={{ fontSize: "11px", color: "#64748B" }}>Honor OS reduced motion settings</div>
              </div>
              <label className="sf-switch">
                <input
                  type="checkbox"
                  checked={form.reduceMotion}
                  onChange={(e) => setForm({ ...form, reduceMotion: e.target.checked })}
                />
                <span className="sf-slider"></span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>Pause on hover</div>
                <div style={{ fontSize: "11px", color: "#64748B" }}>Pause animation when hovered</div>
              </div>
              <label className="sf-switch">
                <input
                  type="checkbox"
                  checked={form.pauseOnHover}
                  onChange={(e) => setForm({ ...form, pauseOnHover: e.target.checked })}
                />
                <span className="sf-slider"></span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>Pause on focus</div>
                <div style={{ fontSize: "11px", color: "#64748B" }}>Pause animation when focused</div>
              </div>
              <label className="sf-switch">
                <input
                  type="checkbox"
                  checked={form.pauseOnFocus}
                  onChange={(e) => setForm({ ...form, pauseOnFocus: e.target.checked })}
                />
                <span className="sf-slider"></span>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* Save Settings Button at bottom */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSubmit} disabled={isSaving} className="sf-btn-primary" style={{ padding: "10px 24px" }}>
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
