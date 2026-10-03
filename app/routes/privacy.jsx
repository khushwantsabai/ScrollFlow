import styles from "./_index/styles.module.css";

export default function PublicPrivacyPolicy() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bgGlowCyan} />
      <div className={styles.bgGlowPurple} />
      <div className={styles.bgGrid} />
      
      <div className={styles.content} style={{ marginTop: "40px" }}>
        <div className={styles.loginCard} style={{ maxWidth: "800px" }}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Privacy Policy</h1>
            <p className={styles.cardSubtitle}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div style={{ color: "#E2E8F0", lineHeight: "1.6", fontSize: "15px" }}>
            <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginTop: "24px", marginBottom: "12px" }}>1. Information We Collect</h2>
            <p style={{ marginBottom: "16px" }}>
              When you install the Scroll Flow App, we are automatically able to access certain types of information from your Shopify account. We collect your shop domain, shop email, and data necessary to render your scrolling banners (e.g., banner text, settings, and status).
            </p>

            <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginTop: "24px", marginBottom: "12px" }}>2. How We Use Your Information</h2>
            <p style={{ marginBottom: "16px" }}>
              We use the personal information we collect from you and your customers in order to provide the App's functionality, operate our service, and communicate with you about your account. We do not sell your personal information or your store's data to third parties.
            </p>

            <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginTop: "24px", marginBottom: "12px" }}>3. Data Retention</h2>
            <p style={{ marginBottom: "16px" }}>
              When you uninstall the App, we will automatically delete your information and banner settings within 48 hours of receiving the uninstall webhook from Shopify.
            </p>

            <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginTop: "24px", marginBottom: "12px" }}>4. Changes</h2>
            <p style={{ marginBottom: "16px" }}>
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
            </p>

            <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginTop: "24px", marginBottom: "12px" }}>5. Contact Us</h2>
            <p style={{ marginBottom: "16px" }}>
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at privacy@scrollflow.com.
            </p>
          </div>
          
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <a href="/" style={{ color: "#16C7FF", textDecoration: "none", fontWeight: "600" }}>← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
