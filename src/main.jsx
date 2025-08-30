import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./lib/supabaseClient.js";
import WalletPage from "./pages/WalletPage.jsx";
import CustomerCard from "./pages/CustomerCard.jsx";
import Login from "./pages/Login.jsx";

function useHash() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash;
}

function App() {
  const [user, setUser] = useState(null);
  const hash = useHash();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );
  }, []);

  if (!user) return <Login onLogin={setUser} />;

  if (hash.startsWith("#/customer/")) {
    const id = decodeURIComponent(hash.slice("#/customer/".length));
    return <CustomerCard customerId={id} />;
  }
  return <WalletPage />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
