// app/routes/app.support.jsx
import { useState } from "react";

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
          Help & Support
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
          Need assistance setting up your scrolling announcement bar? We're here to help.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left Column: FAQ Accordion */}
        <div className="sf-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "16px" }}>
            Frequently Asked Questions
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                How do I add ScrollFlow to my theme?
              </div>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                Go to Online Store → Themes → Customize. Click "Add Section" or "Add App Block" and select "ScrollFlow Announcement Bar".
              </p>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                Does ScrollFlow affect store loading speed?
              </div>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                No! ScrollFlow uses lightweight 100% CSS keyframe animations with zero heavy external scripts.
              </p>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                Can I have multiple scrolling banners?
              </div>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
                Yes, on Basic and Premium plans you can create multiple banners and place them on different pages.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Support Form */}
        <div className="sf-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginTop: 0, marginBottom: "16px" }}>
            Contact Support
          </h3>

          {submitted ? (
            <div style={{ padding: "20px", borderRadius: "8px", backgroundColor: "#D1FAE5", color: "#065F46", textCenter: "center" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>✅</div>
              <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "4px" }}>Message Received!</div>
              <div style={{ fontSize: "13px" }}>Our support team will get back to you within 24 hours.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theme integration question"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue or request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <button type="submit" className="sf-btn-primary" style={{ width: "100%" }}>
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
