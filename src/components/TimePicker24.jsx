"use client";
import { useRef } from "react";

export default function TimeInput24({ value, onChange, error }) {
  const minuteRef = useRef(null);

  const [hour = "", minute = ""] = value ? value.split(":") : ["", ""];

  const handleHourChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    if (val.length > 2) val = val.slice(0, 2);

    if (val.length === 2) {
      const num = parseInt(val, 10);
      if (num > 23) val = "23";
      if (num < 0) val = "00";
      minuteRef.current?.focus();
    }

    onChange(`${val}${minute ? ":" + minute : ""}`);
  };

  const handleMinuteChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    if (val.length > 2) val = val.slice(0, 2);

    if (val.length === 2) {
      const num = parseInt(val, 10);
      if (num > 59) val = "59";
      if (num < 0) val = "00";
    }

    onChange(`${hour || "00"}:${val}`);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Hour */}
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={hour}
        onChange={handleHourChange}
        placeholder="HH"
        className={`w-10 px-1.5 py-1.5 text-xs text-center border rounded-md focus:outline-none focus:ring-1 text-gray-800 ${
          error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-gray-400"
        }`}
      />

      <span className="text-xs font-medium">:</span>

      {/* Minute */}
      <input
        ref={minuteRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={minute}
        onChange={handleMinuteChange}
        placeholder="MM"
        className={`w-10 px-1.5 py-1.5 text-xs text-center border rounded-md focus:outline-none focus:ring-1 text-gray-800 ${
          error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-gray-400"
        }`}
      />

      {error && <p className="text-[10px] text-red-500 ml-2">{error}</p>}
    </div>
  );
}