import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function CustomerCard() {
  const { id } = useParams(); // מזהה הלקוח ב־URL
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // שליפת פרטי לקוח
    const fetchCustomer = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();
      if (error) console.error(error);
      else setCustomer(data);
    };

    // שליפת פעולות מה־ledger
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("ledger")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      else setTransactions(data);
    };

    fetchCustomer();
    fetchTransactions();
  }, [id]);

  return (
    <div className="p-6">
      <Link to="/" className="text-blue-600 underline">
        ← חזרה לרשימת לקוחות
      </Link>

      {customer ? (
        <div className="mt-4">
          <h1 className="text-2xl font-bold mb-2">
            כרטיס לקוח – {customer.name}
          </h1>
          <p className="text-gray-700 mb-6">טלפון: {customer.phone}</p>
        </div>
      ) : (
        <p>טוען נתוני לקוח...</p>
      )}

      <h2 className="text-xl font-semibold mb-3">פעולות</h2>
      <table className="min-w-full bg-white border rounded-lg shadow">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="px-4 py-2 border">תאריך</th>
            <th className="px-4 py-2 border">סכום</th>
            <th className="px-4 py-2 border">אמצעי</th>
            <th className="px-4 py-2 border">הערה</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="px-4 py-2 border">
                  {new Date(t.created_at).toLocaleString("he-IL")}
                </td>
                <td
                  className={`px-4 py-2 border ${
                    t.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.amount} ₪
                </td>
                <td className="px-4 py-2 border">{t.method}</td>
                <td className="px-4 py-2 border">{t.note || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-4 py-2 border text-gray-500">
                אין פעולות להצגה
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
