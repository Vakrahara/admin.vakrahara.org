"use client";

import React from "react";

interface MetricGaugeProps {
  label: string;
  value: number; // Current value
  max: number; // Maximum limit
  unit?: string;
  subtext?: string;
  type?: "ram" | "disk" | "general";
}

export function MetricGauge({
  label,
  value,
  max,
  unit = "%",
  subtext,
}: MetricGaugeProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  // Determine health color threshold
  let strokeColor = "#10b981"; // Emerald green (< 70%)
  let glowColor = "rgba(16, 185, 129, 0.25)";
  if (percentage >= 85) {
    strokeColor = "#f43f5e"; // Ruby red (>= 85%)
    glowColor = "rgba(244, 63, 94, 0.35)";
  } else if (percentage >= 70) {
    strokeColor = "#f59e0b"; // Amber warning (70-84%)
    glowColor = "rgba(245, 158, 11, 0.3)";
  }

  // SVG circle calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0d0d15]/80 border border-white/8 backdrop-blur-xl hover:border-[#d4af37]/30 transition-all duration-300">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/5"
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
              transition: "stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease",
            }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-mono text-white tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
            {unit === "%" ? "UTIL" : `${value}/${max}`}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <h4 className="text-sm font-semibold text-white/90">{label}</h4>
        {subtext && <p className="text-xs text-white/40 font-mono mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}
