// src/lib/walletApi.js
import { supabase } from "./supabaseClient.js";

// עוזר קטן לעבודה מול סכמת wallet
const wallet = () => supabase.schema("wallet");

/** רשימת לקוחות + יתרות (מה-View) עם חיפוש לפי שם או טלפון */
export async function fetchBalances(search) {
  let q = wallet().from("v_customer_balances").select("*");

  if (search && search.trim()) {
    const s = search.trim();
    // חיפוש גם בשם וגם בטלפון
    q = q.or(`full_name.ilike.%${s}%,phone.ilike.%${s}%`);
  }

  const { data, error } = await q.order("balance", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** פרטי לקוח בודד (לכרטיס לקוח) */
export async function getCustomer(customer_id) {
  const { data, error } = await wallet()
    .from("customers")
    .select("id, full_name, phone, email, notes")
    .eq("id", customer_id)
    .single();
  if (error) throw error;
  return data;
}

/** כל התנועות של לקוח (טעינות/משיכות) */
export async function fetchLedger(customer_id) {
  const { data, error } = await wallet()
    .from("ledger")
    .select(
      "id, customer_id, kind, amount, method, reference, notes, operator, executed_at, created_at"
    )
    .eq("customer_id", customer_id)
    .order("executed_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** טעינת יתרה (topup) */
export async function topup({
  customer_id,
  amount,
  method,
  reference,
  notes,
  operator = "Ran",
  executed_at,
}) {
  const { error } = await wallet().from("ledger").insert([
    {
      customer_id,
      kind: "topup",
      amount,
      method,
      reference: reference || null,
      notes: notes || null,
      operator,
      executed_at: executed_at || new Date().toISOString(),
    },
  ]);
  if (error) throw error;
}

/** משיכה מהיתרה (redeem) */
export async function redeem({
  customer_id,
  amount,
  reference,
  notes,
  operator = "Ran",
  executed_at,
}) {
  const { error } = await wallet().from("ledger").insert([
    {
      customer_id,
      kind: "redeem",
      amount,
      reference: reference || null,
      notes: notes || null,
      operator,
      executed_at: executed_at || new Date().toISOString(),
    },
  ]);
  if (error) throw error;
}

/** יצירת לקוח חדש */
export async function createCustomer({ full_name, phone, email, notes }) {
  const { error } = await wallet()
    .from("customers")
    .insert([{ full_name, phone, email, notes }]);
  if (error) throw error;
}
