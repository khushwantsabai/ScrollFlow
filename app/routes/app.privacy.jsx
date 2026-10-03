import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function EmbeddedPrivacyPolicy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div className="sf-card" style={{ padding: "40px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "24px" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "16px" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#334155" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginTop: "24px", marginBottom: "12px" }}>
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: "16px" }}>
            When you install the Scroll Flow App, we are automatically able to access certain types of information from your Shopify account. We collect your shop domain, shop email, and data necessary to render your scrolling banners (e.g., banner text, settings, and status).
          </p>

          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginTop: "24px", marginBottom: "12px" }}>
            2. How We Use Your Information
          </h2>
          <p style={{ marginBottom: "16px" }}>
            We use the personal information we collect from you and your customers in order to provide the App's functionality, operate our service, and communicate with you about your account. We do not sell your personal information or your store's data to third parties.
          </p>

          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginTop: "24px", marginBottom: "12px" }}>
            3. Data Retention
          </h2>
          <p style={{ marginBottom: "16px" }}>
            When you uninstall the App, we will automatically delete your information and banner settings within 48 hours of receiving the uninstall webhook from Shopify.
          </p>

          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginTop: "24px", marginBottom: "12px" }}>
            4. Changes
          </h2>
          <p style={{ marginBottom: "16px" }}>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
          </p>

          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginTop: "24px", marginBottom: "12px" }}>
            5. Contact Us
          </h2>
          <p style={{ marginBottom: "16px" }}>
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at privacy@scrollflow.com.
          </p>
        </div>
      </div>
    </div>
  );
}
