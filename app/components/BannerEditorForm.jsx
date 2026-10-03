// app/components/BannerEditorForm.jsx
import { useState } from "react";
import { Link, useFetcher, useNavigate } from "react-router";

export default function BannerEditorForm({ initialData, isNew = false, shopPlan = "BASIC" }) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [name, setName] = useState(initialData?.name || "New Announcement Banner");
  const [templateId, setTemplateId] = useState(initialData?.templateId || "template-1");

  // Settings state
  const defaultSettings = {
    messages: ["Summer Sale", "20% Off Today", "Shop Now"],
    direction: "Right to Left",
    speed: "Normal",
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    backgroundColor: "#19D8CF",
    textColor: "#111827",
    hoverColor: "#0FB5AD",
    borderColor: "#19D8CF",
    height: 44,
    topPadding: 10,
    bottomPadding: 10,
    dividerIcon: "•",
    dividerColor: "#111827",
    hasCta: false,
    ctaText: "SHOP NOW",
    ctaUrl: "/collections/all",
    ctaBg: "#5B2CFF",
    ctaColor: "#FFFFFF",
    ctaRadius: 6,
  };

  let initialSettings = defaultSettings;
  if (initialData?.settings) {
    try {
      initialSettings = { ...defaultSettings, ...JSON.parse(initialData.settings) };
    } catch (e) {}
  }

  const [settings, setSettings] = useState(initialSettings);
  const [activeAccordion, setActiveAccordion] = useState("text");

  // Handlers for messages
  const handleMessageChange = (index, value) => {
    const updated = [...settings.messages];
    updated[index] = value;
    setSettings({ ...settings, messages: updated });
  };

  const addMessage = () => {
    setSettings({
      ...settings,
      messages: [...settings.messages, "New Offer Announcement"],
    });
  };

  const deleteMessage = (index) => {
    if (settings.messages.length <= 1) return;
    const updated = settings.messages.filter((_, i) => i !== index);
    setSettings({ ...settings, messages: updated });
  };

  // Speed slider values
  const speedToDuration = {
    Slow: "25s",
    Normal: "15s",
    Fast: "10s",
    "Very Fast": "6s",
  };

  const handleSave = (targetStatus = "PUBLISHED") => {
    fetcher.submit(
      {
        bannerId: initialData?.id || "",
        name,
        templateId,
        settings: JSON.stringify(settings),
        status: targetStatus,
      },
      { method: "POST" }
    );
  };

  const isSaving = fetcher.state === "submitting";

  // Marquee track duplication for seamless scroll
  const doubledMessages = [
    ...settings.messages,
    ...settings.messages,
    ...settings.messages,
    ...settings.messages,
  ];

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
      {/* Top Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <Link to="/app" style={{ fontSize: "13px", color: "#64748B", textDecoration: "none", display: "inline-block", marginBottom: "4px" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>
            {isNew ? "Create Banner" : "Edit Banner"}
          </h1>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
            Customize your scrolling banner and publish it directly to your store.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
            className="sf-btn-ghost"
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            💾 Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={isSaving}
            className="sf-btn-primary"
            style={{ padding: "8px 16px", fontSize: "13px", backgroundColor: "#5B2CFF" }}
          >
            {isSaving ? "Publishing..." : "🚀 Publish Banner"}
          </button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 340px", gap: "20px" }}>
        
        {/* LEFT COLUMN: Content & Direction */}
        <div>
          {/* Content Card */}
          <div className="sf-card" style={{ padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "16px" }}>
              Content
            </h3>

            {/* Banner Name */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                Banner Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  fontSize: "13px",
                  color: "#111827",
                  outline: "none",
                }}
              />
            </div>

            {/* Messages List */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
                Messages
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {settings.messages.map((msg, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#94A3B8", cursor: "grab", fontSize: "14px" }}>⋮⋮</span>
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => handleMessageChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => deleteMessage(index)}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#EF4444", fontSize: "14px" }}
                      title="Delete message"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMessage}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px dashed #5B2CFF",
                  backgroundColor: "#F0EBFF",
                  color: "#5B2CFF",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                + Add Message
              </button>
            </div>
          </div>

          {/* Direction Card */}
          <div className="sf-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "14px" }}>
              Direction
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Right to Left", "Left to Right"].map((dir) => (
                <label key={dir} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="direction"
                    checked={settings.direction === dir}
                    onChange={() => setSettings({ ...settings, direction: dir })}
                    style={{ accentColor: "#5B2CFF" }}
                  />
                  <span style={{ fontWeight: settings.direction === dir ? "600" : "400", color: "#111827" }}>
                    {dir}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Live Preview & Speed */}
        <div>
          <div className="sf-card" style={{ padding: "24px", minHeight: "480px", display: "flex", flexDirection: "column" }}>
            {/* Top Bar Label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "1px", color: "#64748B", textTransform: "uppercase" }}>
                LIVE PREVIEW
              </div>
            </div>

            {/* Live Banner Preview Display Box - Locked to Tablet View Width */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px dashed #CBD5E1", padding: "20px" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                  background: settings.backgroundColor,
                  color: settings.textColor,
                  border: `1px solid ${settings.borderColor || "transparent"}`,
                  paddingTop: `${settings.topPadding}px`,
                  paddingBottom: `${settings.bottomPadding}px`,
                }}
              >
                <div className="sf-marquee-preview-container">
                  <div
                    className={`sf-marquee-track ${settings.direction === "Left to Right" ? "reverse" : ""}`}
                    style={{
                      animationDuration: speedToDuration[settings.speed] || "15s",
                    }}
                  >
                    {doubledMessages.map((msg, i) => (
                      <span
                        key={i}
                        className="sf-marquee-item"
                        style={{
                          fontFamily: settings.fontFamily,
                          fontSize: `${settings.fontSize}px`,
                          fontWeight: settings.fontWeight,
                          letterSpacing: settings.letterSpacing,
                          textTransform: settings.textTransform,
                        }}
                      >
                        {msg}
                        {settings.dividerIcon !== "NONE" && (
                          <span style={{ color: settings.dividerColor, opacity: 0.8, margin: "0 4px" }}>
                            {settings.dividerIcon}
                          </span>
                        )}
                        {settings.hasCta && (
                          <span
                            style={{
                              marginLeft: "8px",
                              padding: "4px 10px",
                              backgroundColor: settings.ctaBg,
                              color: settings.ctaColor,
                              borderRadius: `${settings.ctaRadius}px`,
                              fontSize: "11px",
                              fontWeight: "700",
                              display: "inline-block",
                            }}
                          >
                            {settings.ctaText} →
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Animation Speed Slider */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                  Animation Speed
                </label>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#5B2CFF" }}>
                  {settings.speed}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={
                  settings.speed === "Slow"
                    ? 1
                    : settings.speed === "Normal"
                    ? 2
                    : settings.speed === "Fast"
                    ? 3
                    : 4
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const map = { 1: "Slow", 2: "Normal", 3: "Fast", 4: "Very Fast" };
                  setSettings({ ...settings, speed: map[val] });
                }}
                style={{
                  width: "100%",
                  accentColor: "#5B2CFF",
                  cursor: "pointer",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
                <span>Very Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Design Settings Accordion */}
        <div>
          <div className="sf-card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "16px" }}>
              Design Settings
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Text Settings Accordion */}
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "text" ? "" : "text")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    backgroundColor: "#F8FAFC",
                    border: "none",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span>Text Settings</span>
                  <span>{activeAccordion === "text" ? "▲" : "▼"}</span>
                </button>

                {activeAccordion === "text" && (
                  <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Font Family */}
                    <div>
                      <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Font Family</label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                      >
                        <option value="Inter">Inter (Default)</option>
                        <option value="system-ui">System UI</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Playfair Display">Playfair Display</option>
                      </select>
                    </div>

                    {/* Font Size & Weight */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Font Size ({settings.fontSize}px)</label>
                        <input
                          type="number"
                          value={settings.fontSize}
                          onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Font Weight</label>
                        <select
                          value={settings.fontWeight}
                          onChange={(e) => setSettings({ ...settings, fontWeight: e.target.value })}
                          style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                        >
                          <option value="400">Regular (400)</option>
                          <option value="600">SemiBold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">ExtraBold (800)</option>
                        </select>
                      </div>
                    </div>

                    {/* Text Transform */}
                    <div>
                      <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Text Transform</label>
                      <select
                        value={settings.textTransform}
                        onChange={(e) => setSettings({ ...settings, textTransform: e.target.value })}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                      >
                        <option value="uppercase">Uppercase</option>
                        <option value="lowercase">Lowercase</option>
                        <option value="none">Normal</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Colors Accordion */}
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "colors" ? "" : "colors")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    backgroundColor: "#F8FAFC",
                    border: "none",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span>Colors</span>
                  <span>{activeAccordion === "colors" ? "▲" : "▼"}</span>
                </button>

                {activeAccordion === "colors" && (
                  <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Background Color</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="color"
                          value={settings.backgroundColor.startsWith("#") ? settings.backgroundColor : "#19D8CF"}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          style={{ width: "36px", height: "32px", padding: 0, border: "none", cursor: "pointer", borderRadius: "4px" }}
                        />
                        <input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Text Color</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="color"
                          value={settings.textColor.startsWith("#") ? settings.textColor : "#111827"}
                          onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                          style={{ width: "36px", height: "32px", padding: 0, border: "none", cursor: "pointer", borderRadius: "4px" }}
                        />
                        <input
                          type="text"
                          value={settings.textColor}
                          onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                          style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon & Divider Accordion */}
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "divider" ? "" : "divider")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    backgroundColor: "#F8FAFC",
                    border: "none",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span>Icon & Divider</span>
                  <span>{activeAccordion === "divider" ? "▲" : "▼"}</span>
                </button>

                {activeAccordion === "divider" && (
                  <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Divider Symbol</label>
                      <select
                        value={settings.dividerIcon}
                        onChange={(e) => setSettings({ ...settings, dividerIcon: e.target.value })}
                        style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                      >
                        <option value="•">Bullet (•)</option>
                        <option value="★">Star (★)</option>
                        <option value="🔥">Fire (🔥)</option>
                        <option value="⚡">Lightning (⚡)</option>
                        <option value="|">Vertical Line (|)</option>
                        <option value="✦">Sparkle (✦)</option>
                        <option value="NONE">None</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button Accordion */}
              <div style={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "cta" ? "" : "cta")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    backgroundColor: "#F8FAFC",
                    border: "none",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#111827",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span>CTA Button {shopPlan === "FREE" && "🔒"}</span>
                  <span>{activeAccordion === "cta" ? "▲" : "▼"}</span>
                </button>

                {activeAccordion === "cta" && (
                  <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                      <input
                        type="checkbox"
                        checked={settings.hasCta}
                        onChange={(e) => setSettings({ ...settings, hasCta: e.target.checked })}
                      />
                      <span>Enable Button</span>
                    </label>

                    {settings.hasCta && (
                      <>
                        <div>
                          <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Button Text</label>
                          <input
                            type="text"
                            value={settings.ctaText}
                            onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", color: "#64748B", display: "block", marginBottom: "4px" }}>Button URL</label>
                          <input
                            type="text"
                            value={settings.ctaUrl}
                            onChange={(e) => setSettings({ ...settings, ctaUrl: e.target.value })}
                            style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px" }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
