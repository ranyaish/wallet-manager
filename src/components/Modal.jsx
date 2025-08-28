import React from "react";

export default function Modal({ title, children, onClose, actions }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-4 w-[440px]" dir="rtl" onClick={(e)=>e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        {children}
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="px-3 py-2 border rounded-xl">בטל</button>
          <div className="flex gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
}
