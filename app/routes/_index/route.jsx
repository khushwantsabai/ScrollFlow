import { redirect, Form, useLoaderData } from "react-router";
import { useState } from "react";
import { login } from "../../shopify.server";

export const links = () => [
  { rel: "stylesheet", href: "/login.css" },
];

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function Index() {
  const { showForm } = useLoaderData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // 'default', 'loading', 'error', 'success', 'shopify'
  const [loginState, setLoginState] = useState("default");
  
  // Real Shopify shop input
  const [shop, setShop] = useState("");

  // Handle fake email/password login
  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoginState("loading");
    
    // Simulate network delay and error
    setTimeout(() => {
      setLoginState("error");
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* Background Effects */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="noise-overlay"></div>
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Login Card */}
      <div className={`login-card ${loginState === 'error' ? 'shake' : ''}`}>
        
        {/* Logo Section */}
        <div className="logo-container">
          <div className="logo-glow">
            {/* Custom SVG Logo matching prompt image */}
            <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <path d="M20,60 C20,30 40,20 60,20 L60,10 L85,25 L60,40 L60,30 C45,30 35,40 35,60" fill="url(#grad1)"/>
              <path d="M80,40 C80,70 60,80 40,80 L40,90 L15,75 L40,60 L40,70 C55,70 65,60 65,40" fill="url(#grad2)"/>
            </svg>
          </div>
          <h1 className="welcome-title">Welcome back</h1>
          <p className="welcome-subtitle">Sign in to manage your scrolling templates and store content.</p>
        </div>

        {loginState === "shopify" && showForm ? (
          /* Actual Shopify Auth Form */
          <Form method="post" action="/auth/login" className="shopify-form" style={{ animation: "fadeInStagger 0.4s ease forwards" }}>
            <div className="form-group" style={{ animationDelay: "0.1s" }}>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <input 
                  type="text" 
                  name="shop"
                  className="sf-input" 
                  placeholder="example.myshopify.com" 
                  value={shop}
                  onChange={(e) => setShop(e.currentTarget.value)}
                  autoComplete="on"
                  autoFocus
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" style={{ animationDelay: "0.2s" }}>
              Log in to Shopify
            </button>

            <div className="divider" style={{ animationDelay: "0.3s" }}>
              <span>OR</span>
            </div>

            <button 
              type="button" 
              className="btn-secondary" 
              style={{ animationDelay: "0.4s" }}
              onClick={() => setLoginState("default")}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Email Login
            </button>
          </Form>
        ) : (
          /* Fake Email/Password Form for UI Spec */
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <input 
                  type="email" 
                  className="sf-input" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginState("default"); }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="sf-input" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginState("default"); }}
                  required
                />
                <button type="button" className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29"></path></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" />
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            {loginState === "error" && (
              <div className="error-message" style={{ marginBottom: "20px" }}>
                Invalid email or password. Please try again.
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loginState === "loading" || loginState === "success"}>
              {loginState === "loading" ? (
                <><div className="spinner"></div> Signing in...</>
              ) : loginState === "success" ? (
                <><div className="check-animation"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div> Success!</>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <button type="button" className="btn-secondary" onClick={() => setLoginState("shopify")}>
              <svg width="20" height="20" viewBox="0 0 30 30" fill="currentColor">
                <path d="M22.84 8.78c-.22-.72-1.35-3.08-1.58-3.52-.77-1.48-1.63-2.61-3.6-2.52h-.05c-1.28.06-4.52 1.34-6.61 2.33C9.09 5.96 7 7.02 6.57 7.29c-1.39.86-1.78 1.95-1.92 3.01-.19 1.4.15 6.44.29 7.7.13 1.13.78 2.05 1.5 2.56.76.54 3.03 2.11 3.52 2.45 2.15 1.49 4.34 2.87 4.54 2.99.6.35 1.36.43 2.01.2 1.16-.42 5.06-2.73 5.4-2.92 1.05-.6 1.76-1.61 1.88-2.68.22-1.89.57-7.22.62-8.31.02-.73-.59-2.31-1.57-3.51zm-7.66 16.7c-.55 0-3.32-2.12-3.8-2.45-1.07-.75-2.07-1.48-2.31-1.65-.67-.47-1.3-1.39-1.39-2.35-.11-.97-.24-5.22-.38-7 .01-.13 1.38-.85 1.38-.85.76-.43 2.3-1.12 3.14-1.36 1.09-.32 1.95.42 2.12.58.55.51.58 1.45.1 2.1-.22.3-.98 1.12-2.31 2.22l2.36 1.09 2.11 2.4-5.11-2.12c1.47-1.27 2.07-1.87 2.21-2.04.14-.17.2-.68.14-1.07l2.84 1.36 1.1 1.16-5.06-2.04c.05-.03.09-.07.13-.1 1.12-.95 1.14-1.95.95-2.41-.18-.46-.72-.75-1.18-.75-.24 0-.48.06-.69.17-.66.36-4.57 2.48-4.57 2.48l-.02-.8c.45-.29 3.55-2.07 4.79-2.7 1.55-.78 4.74-2.07 5.51-2.12.87-.06 1.42.49 1.95 1.5.17.32.96 2 1.09 2.51.68 2.65-.29 6.22-2.22 7.73-1.19.93-2.12 1.5-2.58 1.76z"></path>
              </svg>
              Continue with Shopify
            </button>

            <div className="signup-section">
              Don't have an account?
              <a href="#" className="signup-link">Create an account</a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
