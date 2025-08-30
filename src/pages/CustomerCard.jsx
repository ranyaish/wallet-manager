// src/pages/CustomerCard.jsx
import React, { useEffect, useState } from "react";
import { getCustomer, fetchLedger } from "../lib/walletApi.js";

export default function CustomerCard({ customerId }) {
  const [customer, setCustomer] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [c, tx] = await Promise.all([
          getCustomer(customerId),
          fetchLedger(customerId),
        ]);
        if (!cancelled) {
          setCustomer(c || null);
          setRows(tx || []);
        }
      } catch (e) {
        console.error(e);
        alert(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [customerId]);

  return (
    <div dir="rtl" className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button
          className="px-3 py-2 border rounded-xl"
          onClick={() => (window.location.hash = "#/")}
        >
          ← חזרה לרשימה
        </button>
        <h1 className="text-2xl font-bold">כרטיס לקוח</h1>
      </div>

      {customer ? (
        <div className="bg-white border rounded-xl p-4 mb-4">
          <div className="text-lg font-semibold">{customer.full_name}</div>
          <div className="text-gray-700">טלפון: {customer.phone || "—"}</div>
          {customer.email && <div className="text-gray-700">אימייל: {customer.email}</div>}
          {customer.notes && <div className="text-gray-700">הערות: {customer.notes}</div>}
        </div>
      ) : (
        <div className="text-gray-600 mb-4">טוען פרטי לקוח…</div>
      )}

      <h2 className="text-xl font-semibold mb-2">תנועות</h2>

      <div className="overflow-auto border rounded-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="p-2">תאריך ביצוע</th>
              <th className="p-2">סוג</th>
              <th className="p-2">סכום</th>
              <th className="p-2">אמצעי</th>
              <th className="p-2">אסמכתא</th>
              <th className="p-2">הערה</th>
              <th className="p-2">בוצע ע״י</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-4">טוען…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="7" className="p-4">אין תנועות ללקוח זה</td></tr>
            ) : (
              rows.map((t) => (
                <tr key={t.id} className="text-right border-t">
                  <td className="p-2">{new Date(t.executed_at || t.created_at).toLocaleString("he-IL")}</td>
                  <td className="p-2">{t.kind === "topup" ? "טעינה" : "משיכה"}</td>
                  <td className={`p-2 font-semibold ${t.kind === "topup" ? "text-green-700" : "text-red-700"}`}>
                    ₪{Number(t.amount).toFixed(2)}
                  </td>
                  <td className="p-2">{t.method || "—"}</td>
                  <td className="p-2">{t.reference || "—"}</td>
                  <td className="p-2">{t.notes || "—"}</td>
                  <td className="p-2">{t.operator || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
