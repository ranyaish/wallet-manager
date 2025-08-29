import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchLedgerByCustomer } from "../lib/walletApi.js";

export default function CustomerDetails() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchLedgerByCustomer(id);
        setRows(data);
      } catch (e) {
        console.error(e);
        alert("שגיאה בטעינת תנועות הלקוח");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div dir="rtl" className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">פירוט תנועות לקוח</h1>
        <Link to="/" className="underline">חזרה לרשימה</Link>
      </div>

      {loading ? (
        <div>טוען…</div>
      ) : rows.length === 0 ? (
        <div>אין תנועות ללקוח זה</div>
      ) : (
        <div className="overflow-auto border rounded-xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-right">סוג</th>
                <th className="p-2 text-right">סכום</th>
                <th className="p-2 text-right">אסמכתא</th>
                <th className="p-2 text-right">תאריך</th>
                <th className="p-2 text-right">הערות</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.kind === "topup" ? "טעינה" : "משיכה"}</td>
                  <td className="p-2">₪{Number(r.amount).toFixed(2)}</td>
                  <td className="p-2">{r.reference || "—"}</td>
                  <td className="p-2">{new Date(r.executed_at).toLocaleString("he-IL")}</td>
                  <td className="p-2">{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
