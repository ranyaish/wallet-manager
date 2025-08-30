import { supabase } from "./supabaseClient.js";

// קריאת ה-View הנכון
export async function fetchBalances(search) {
  let q = supabase.from("wallet.v_customer_balances").select("*");
  if (search && search.trim()) {
    // סינון בשם (אפשר להרחיב לטלפון אם תרצה)
    q = q.ilike("full_name", `%${search}%`);
  }
  const { data, error } = await q.order("balance", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchLedger(customer_id) {
  const { data, error } = await supabase
    .from("wallet.ledger")
    .select("id, executed_at, kind, amount, method, reference, notes, operator, created_at")
    .eq("customer_id", customer_id)
    .order("executed_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function topup({ customer_id, amount, method, reference, notes, operator = "Ran", executed_at }) {
  const { error } = await supabase.from("wallet.ledger").insert([{
    customer_id, kind: "topup", amount, method, reference: reference || null, notes: notes || null, operator, executed_at: executed_at || new Date().toISOString()
  }]);
  if (error) throw error;
}

export async function redeem({ customer_id, amount, reference, notes, operator = "Ran", executed_at }) {
  const { error } = await supabase.from("wallet.ledger").insert([{
    customer_id, kind: "redeem", amount, reference: reference || null, notes: notes || null, operator, executed_at: executed_at || new Date().toISOString()
  }]);
  if (error) throw error;
}

export async function createCustomer({ full_name, phone, email, notes }) {
  const { error } = await supabase.from("wallet.customers").insert([{ full_name, phone, email, notes }]);
  if (error) throw error;
}
