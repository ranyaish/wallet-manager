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
