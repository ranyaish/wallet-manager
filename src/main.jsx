import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import WalletPage from "./pages/WalletPage.jsx";
import CustomerCard from "./pages/CustomerCard.jsx";

console.log("[BOOT] main.jsx loaded");

// הוק קטן שמאזין לשינויים ב-hash ומכריח רנדר
function useHash() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);
  return hash;
}

function App() {
  const hash = useHash();

  // כרטיס לקוח: #/customer/<id>
  if (hash.startsWith("#/customer/")) {
    const id = decodeURIComponent(hash.slice("#/customer/".length));
    return <CustomerCard customerId={id} />;
  }

  // ברירת מחדל: רשימת יתרות
  return <WalletPage />;
}

const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
