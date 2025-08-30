import { createClient } from "@supabase/supabase-js";

// קורא משתני סביבה שהוגדרו ב־workflow (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || window.__SUPABASE_URL__ || "";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || window.__SUPABASE_ANON_KEY__ || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("⚠️ Supabase URL/Key חסרים. ודא שה־Secrets מוגדרים ב־GitHub Actions.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
