import React, { useEffect, useState } from "react";
import Modal from "../components/Modal.jsx";
import { fetchBalances, topup, redeem, createCustomer } from "../lib/walletApi.js";

export default function WalletPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null); // "topup" | "redeem"
  const [showNew, setShowNew] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchBalances(search);
      setRows(data);
    } catch (e) {
      alert(e.message || e);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { const id = setTimeout(load, 300); return () => clearTimeout(id); }, [search]);

  return (
    <div dir="rtl" className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">ניהול יתרות לקוחות</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded-xl" onClick={()=>setShowNew(true)}>לקוח חדש</button>
          <button className="px-3 py-2 border rounded-xl" onClick={load}>רענן</button>
        </div>
      </div>

      <div className="flex gap-2 items-center mb-3">
        <input
          className="border rounded-xl px-3 py-2 w-72"
          placeholder="חיפוש לקוח / טלפון"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-auto border rounded-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-2">שם</th>
              <th className="text-right p-2">טלפון</th>
              <th className="text-right p-2">יתרה</th>
              <th className="text-right p-2">תנועה אחרונה</th>
              <th className="text-right p-2">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-4">טוען…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="5" className="p-4">אין נתונים</td></tr>
            ) : rows.map(r => (
              <tr key={r.customer_id} className="border-t">
                <td className="p-2">{r.full_name ?? "—"}</td>
                <td className="p-2">{r.phone ?? "—"}</td>
                <td className="p-2 font-bold">₪{Number(r.balance ?? 0).toFixed(2)}</td>
                <td className="p-2">{r.last_executed_at ? new Date(r.last_executed_at).toLocaleString("he-IL") : "—"}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 border rounded-lg" onClick={()=>{ setSelected(r); setMode("topup"); }}>טעינה</button>
                  <button className="px-2 py-1 border rounded-lg" onClick={()=>{ setSelected(r); setMode("redeem"); }}>משיכה</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && mode && (
        <ActionModal
          mode={mode}
          customer={selected}
          onClose={()=>{ setSelected(null); setMode(null); }}
          onDone={()=>{ setSelected(null); setMode(null); load(); }}
        />
      )}

      {showNew && (
        <NewCustomerModal onClose={()=>setShowNew(false)} onDone={()=>{ setShowNew(false); load(); }} />
      )}
    </div>
  );
}

function ActionModal({ mode, customer, onClose, onDone }) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("in_restaurant"); // ten_bis | cibus | goodi | in_restaurant
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [executedAt, setExecutedAt] = useState(new Date().toISOString().slice(0,16));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit() {
    setBusy(true); setErr(null);
    try {
      if (!amount || amount <= 0) throw new Error("סכום חייב להיות גדול מ-0");
      const iso = executedAt && executedAt.length===16 ? new Date(executedAt).toISOString() : new Date().toISOString();
      if (mode === "topup") {
        await topup({ customer_id: customer.customer_id, amount: Number(amount), method, reference, notes, operator: "Ran", executed_at: iso });
      } else {
        await redeem({ customer_id: customer.customer_id, amount: Number(amount), reference, notes, operator: "Ran", executed_at: iso });
      }
      onDone();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`${mode === "topup" ? "טעינה ללקוח" : "משיכה מיתרה"} — ${customer.full_name || "לקוח"}`} onClose={onClose}
      actions={<button onClick={submit} disabled={busy} className="px-3 py-2 border rounded-xl bg-black text-white">{busy ? "שומר..." : "שמור"}</button>}>
      <label className="block text-sm mt-2">סכום (₪)</label>
      <input type="number" value={amount} onChange={e=>setAmount(parseFloat(e.target.value))} className="border rounded-xl px-3 py-2 w-full" />

      {mode === "topup" && (
        <>
          <label className="block text-sm mt-2">אמצעי טעינה</label>
          <select value={method} onChange={e=>setMethod(e.target.value)} className="border rounded-xl px-3 py-2 w-full">
            <option value="in_restaurant">תשלום במסעדה</option>
            <option value="ten_bis">תן ביס</option>
            <option value="cibus">סיבוס</option>
            <option value="goodi">גודי</option>
          </select>
        </>
      )}

      <label className="block text-sm mt-2">אסמכתא (לא חובה)</label>
      <input value={reference} onChange={e=>setReference(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />

      <label className="block text-sm mt-2">הערה (לא חובה)</label>
      <input value={notes} onChange={e=>setNotes(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />

      <label className="block text-sm mt-2">תאריך ביצוע</label>
      <input type="datetime-local" value={executedAt} onChange={e=>setExecutedAt(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />

      {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
    </Modal>
  );
}

function NewCustomerModal({ onClose, onDone }) {
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit() {
    setBusy(true); setErr(null);
    try {
      if (!full_name.trim()) throw new Error("שם לקוח נדרש");
      await createCustomer({ full_name, phone, email, notes });
      onDone();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="לקוח חדש" onClose={onClose}
      actions={<button onClick={submit} disabled={busy} className="px-3 py-2 border rounded-xl bg-black text-white">{busy ? "שומר..." : "שמור"}</button>}>
      <label className="block text-sm mt-2">שם לקוח</label>
      <input value={full_name} onChange={e=>setFullName(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />
      <label className="block text-sm mt-2">טלפון</label>
      <input value={phone} onChange={e=>setPhone(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />
      <label className="block text-sm mt-2">אימייל (לא חובה)</label>
      <input value={email} onChange={e=>setEmail(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />
      <label className="block text-sm mt-2">הערות (לא חובה)</label>
      <input value={notes} onChange={e=>setNotes(e.target.value)} className="border rounded-xl px-3 py-2 w-full" />
      {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
    </Modal>
  );
}
