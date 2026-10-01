// app/routes/app.jsx
import { Outlet, useLoaderData, Link } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
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
        <Link to="/app/support">Support</Link>
      </NavMenu>

      <div className="sf-content-area">
        <Outlet />
      </div>
    </AppProvider>
  );
}

