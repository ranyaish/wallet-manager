import { supabase } from "./supabaseClient.js";

export async function fetchBalances(search) {
  let q = supabase.from("wallet.balance_view").select("*");
  if (search) {
    q = q.ilike("full_name", `%${search}%`).or(`phone.ilike.%${search}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchLedger(customer_id) {
  const { data, error } = await supabase
    .from("wallet.ledger")
    .select("*")
    .eq("customer_id", customer_id)
    .order("executed_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function topup({ customer_id, amount, method, reference, notes, operator, executed_at }) {
  const { error } = await supabase.from("wallet.ledger").insert({
    customer_id, kind: "topup", amount, method, reference, notes, operator, executed_at,
  });
  if (error) throw error;
}

export async function redeem({ customer_id, amount, reference, notes, operator, executed_at }) {
  const { error } = await supabase.from("wallet.ledger").insert({
    customer_id, kind: "redeem", amount: -Math.abs(amount), reference, notes, operator, executed_at,
  });
  if (error) throw error;
}

export async function createCustomer({ full_name, phone, email, notes }) {
  const { error } = await supabase.from("wallet.customers").insert({ full_name, phone, email, notes });
  if (error) throw error;
}
