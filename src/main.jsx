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
