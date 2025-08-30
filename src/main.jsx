import React, { useMemo } from "react";
import WalletPage from "./pages/WalletPage.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";

function useHashRoute() {
  const [hash, setHash] = React.useState(window.location.hash || "#/");
  React.useEffect(() => {
    const h = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return hash;
}

export function RouterProvider() {
  const hash = useHashRoute();
  const route = useMemo(() => {
    const clean = hash.replace(/^#/, "");
    const parts = clean.split("/").filter(Boolean);
    // routes: "/" , "/customer/:id"
    if (parts[0] === "customer" && parts[1]) {
      return { name: "customer", params: { id: parts[1] } };
    }
    return { name: "home" };
  }, [hash]);

  if (route.name === "customer") return <CustomerDetails customerId={route.params.id} />;
  return <WalletPage />;
}
import React from "react";
import ReactDOM from "react-dom/client";
import WalletPage from "./pages/WalletPage.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";

console.log("[BOOT] main.jsx loaded"); // דיבוג

function App() {
  const hash = window.location.hash || "#/";
  if (hash.startsWith("#/customer/")) {
    const id = hash.replace("#/customer/", "");
    return <CustomerDetails customerId={id} />;
  }
  return <WalletPage />;
}

// ודא שה-id תואם ל-index.html
const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("Root element #root not found");
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
