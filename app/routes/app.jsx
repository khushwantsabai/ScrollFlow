// app/routes/app.jsx
import { useEffect, useRef } from "react";
import { Outlet, useLoaderData, Link, useRouteError } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { NavMenu } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getShopData, seedTemplatesIfEmpty } from "../utils/db.helpers.server";
import themeStyles from "../styles/scroll-flow-theme.css?url";

export const links = () => [
  { rel: "stylesheet", href: themeStyles }
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  await seedTemplatesIfEmpty();
  
  const shopData = await getShopData(session.shop);
  
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shopDomain: session.shop || "my-store.myshopify.com",
    plan: shopData.plan || "BASIC",
  };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      {/* Native Shopify Admin App Navigation */}
      <NavMenu>
        <Link to="/app" rel="home">Dashboard</Link>
        <Link to="/app/templates">Templates</Link>
        <Link to="/app/banners/new">Create Banner</Link>
        <Link to="/app/pricing">Pricing</Link>
        <Link to="/app/settings">Settings</Link>
        <Link to="/app/privacy">Privacy</Link>
      </NavMenu>

      <div className="sf-content-area">
        <Outlet />
      </div>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const bounceRef = useRef(null);
  
  useEffect(() => {
    if (error && error.status === 200 && bounceRef.current) {
      const scriptElement = bounceRef.current.querySelector("script");
      if (scriptElement && scriptElement.text) {
        // dangerouslySetInnerHTML does not execute scripts for security reasons.
        // We must manually create a script tag to force the App Bridge redirect.
        const newScript = document.createElement("script");
        newScript.text = scriptElement.text;
        document.head.appendChild(newScript);
      }
    }
  }, [error]);

  // React Router v7 changed the internal ErrorResponse constructor name, 
  // causing Shopify's boundary.error to fail and render "200" on the screen.
  // We manually handle the bounce response here.
  if (error && error.status === 200) {
    return (
      <div 
        ref={bounceRef}
        dangerouslySetInnerHTML={{ __html: error.data || "Redirecting to Shopify Admin..." }} 
        suppressHydrationWarning={true}
      />
    );
  }

  // For other errors, try the default Shopify boundary, but don't let it crash the app
  try {
    return boundary.error(error);
  } catch (e) {
    console.error("Shopify boundary failed:", e);
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h2>App Error</h2>
        <p>{error?.message || "An unexpected error occurred."}</p>
      </div>
    );
  }
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

