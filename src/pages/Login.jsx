import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setErr(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setErr(error.message);
    else onLogin(data.user);
  }

  return (
    <div dir="rtl" className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h1 className="text-xl font-bold mb-4">כניסה</h1>
        <input
          type="email"
          placeholder="אימייל"
          className="border rounded-xl px-3 py-2 w-full mb-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="סיסמה"
          className="border rounded-xl px-3 py-2 w-full mb-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
        <button className="px-3 py-2 w-full rounded-xl bg-black text-white">
          כניסה
        </button>
      </form>
    </div>
  );
}
