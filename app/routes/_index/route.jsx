import { redirect, Form, useLoaderData, useNavigation } from "react-router";
import { useState } from "react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

// Inline SVG for the 'S with arrows' Logo
const ScrollFlowLogo = () => (
  <svg className={styles.logoSvg} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#16C7FF" />
        <stop offset="50%" stopColor="#287BFF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    <g filter="url(#logoGlow)">
      {/* Top arrow curving right */}
      <path d="M30 45 C30 25, 45 20, 65 20 L65 10 L85 25 L65 40 L65 30 C50 30, 42 35, 42 45 Z" fill="url(#logoGrad)" />
      {/* Bottom arrow curving left */}
      <path d="M70 55 C70 75, 55 80, 35 80 L35 90 L15 75 L35 60 L35 70 C50 70, 58 65, 58 55 Z" fill="url(#logoGrad)" />
    </g>
  </svg>
);

export default function App() {
  const { showForm } = useLoaderData();
  const navigation = useNavigation();
  const [domainError, setDomainError] = useState(false);
  
  const isSubmitting = navigation.state === "submitting";

  const handleSubmit = (e) => {
    const formData = new FormData(e.currentTarget);
    const shop = formData.get("shop");
    if (!shop || !shop.includes(".myshopify.com")) {
      e.preventDefault();
      setDomainError(true);
      setTimeout(() => setDomainError(false), 2000);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Background Effects */}
      <div className={styles.bgGlowCyan} />
      <div className={styles.bgGlowPurple} />
      <div className={styles.bgGrid} />

      <div className={styles.content}>
        
        {/* Header / Logo */}
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <ScrollFlowLogo />
            <h1 className={styles.brandName}>
              Scroll <span className={styles.textGradient}>Flow</span>
            </h1>
          </div>
          <p className={styles.headerTagline}>
            Create beautiful scrolling experiences for your Shopify store.
          </p>
        </header>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.badge}>
            ✦ Shopify Store Enhancement
          </div>
          <h2 className={styles.heroHeading}>
            Make Your Store <span className={styles.textGradient}>Flow.</span>
          </h2>
          <p className={styles.heroSubtitle}>
            Create engaging scrolling banners and animated content for your Shopify store — without complicated setup.
          </p>
        </section>

        {/* Login Card */}
        {showForm && (
          <div className={styles.loginCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Connect Your Store</h3>
              <p className={styles.cardSubtitle}>Enter your Shopify store domain to continue.</p>
            </div>

            <Form className={styles.form} method="post" action="/auth/login" onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Shop domain</label>
                <div className={styles.inputWrapper}>
                  {/* Shopify Icon SVG */}
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.8 6.4L16 2.1c-.2-.3-.6-.4-.9-.2l-3.1 2-3.1-2c-.3-.2-.7-.1-.9.2L5.2 6.4C4.5 6.7 4 7.4 4 8.2v10.6c0 1.2 1 2.2 2.2 2.2h11.6c1.2 0 2.2-1 2.2-2.2V8.2c0-.8-.5-1.5-1.2-1.8zM12 4.4l1.6 1.1c.3.2.7.1.9-.2l1.2-1.8L17.5 6H6.5l1.8-2.5 1.2 1.8c.2.3.6.4.9.2L12 4.4zM18 18.8c0 .1-.1.2-.2.2H6.2c-.1 0-.2-.1-.2-.2V8h12v10.8z"/>
                    <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5z"/>
                  </svg>
                  <input
                    className={`${styles.input} ${domainError ? styles.inputError : ''}`}
                    type="text"
                    name="shop"
                    placeholder="your-store.myshopify.com"
                  />
                </div>
                {domainError ? (
                  <span className={styles.errorMessage}>Please enter a valid Shopify store domain.</span>
                ) : (
                  <span className={styles.inputHint}>Example: my-shop-domain.myshopify.com</span>
                )}
              </div>

              <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Shopify</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
              
              <div className={styles.trustMessage}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Your store connection is securely handled through Shopify.
              </div>
            </Form>
          </div>
        )}

        {/* Animated Marquee Preview */}
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeTrack}>
            <span className={styles.marqueeItem}>NEW ARRIVALS ✦</span>
            <span className={styles.marqueeItem}>LIMITED OFFER ✦</span>
            <span className={styles.marqueeItem}>FREE SHIPPING ✦</span>
            <span className={styles.marqueeItem}>SHOP NOW ✦</span>
            <span className={styles.marqueeItem}>NEW ARRIVALS ✦</span>
            <span className={styles.marqueeItem}>LIMITED OFFER ✦</span>
            <span className={styles.marqueeItem}>FREE SHIPPING ✦</span>
            <span className={styles.marqueeItem}>SHOP NOW ✦</span>
          </div>
        </div>

        {/* Features */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h4 className={styles.featureTitle}>Smooth Scrolling</h4>
            <p className={styles.featureDesc}>
              Create fast, smooth scrolling content that looks great on every device.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h4 className={styles.featureTitle}>Beautiful Templates</h4>
            <p className={styles.featureDesc}>
              Choose from professionally designed scrolling templates for your store.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📱</div>
            <h4 className={styles.featureTitle}>Mobile Responsive</h4>
            <p className={styles.featureDesc}>
              Deliver a consistent experience across desktop, tablet and mobile.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div>&copy; 2026 Scroll Flow</div>
          <div className={styles.footerLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
