import React, { useEffect, useMemo, useState } from "react";
import { fetchLedger } from "../lib/walletApi.js";

// חילוץ מזהה מה-hash במקרה שאין prop
function getIdFromHash() {
  const clean = (window.location.hash || "#/").replace(/^#/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "customer" && parts[1]) return parts[1];
  return null;
}

export default function CustomerDetails({ customerId }) {
  const id = customerId || getIdFromHash();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchLedger(id);
        setRows(data);
      } catch (e) {
        console.error(e);
        alert(e.message || "שגיאה בטעינת תנועות הלקוח");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const balance = useMemo(() => rows.reduce((acc, r) => acc + Number(r.amount || 0), 0), [rows]);

  return (
    <div dir="rtl" className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">פירוט תנועות לקוח</h1>
        <a href="#/" className="px-3 py-2 border rounded-xl">חזרה</a>
      </div>

      <div className="mb-2 text-sm text-gray-600">
        יתרה מחושבת מתצוגה זו: <b>₪{balance.toFixed(2)}</b>
      </div>

      <div className="overflow-auto border rounded-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-2">תאריך ביצוע</th>
              <th className="text-right p-2">סוג</th>
              <th className="text-right p-2">סכום</th>
              <th className="text-right p-2">אמצעי</th>
              <th className="text-right p-2">אסמכתא</th>
              <th className="text-right p-2">הערות</th>
              <th className="text-right p-2">מבצע</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-4">טוען…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="7" className="p-4">אין תנועות</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.executed_at ? new Date(r.executed_at).toLocaleString("he-IL") : "—"}</td>
                <td className="p-2">{r.kind}</td>
                <td className="p-2 font-bold">₪{Number(r.amount ?? 0).toFixed(2)}</td>
                <td className="p-2">{r.method || "—"}</td>
                <td className="p-2">{r.reference || ""}</td>
                <td className="p-2">{r.notes || ""}</td>
                <td className="p-2">{r.operator || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
