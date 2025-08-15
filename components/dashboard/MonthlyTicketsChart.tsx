"use client";

import { useEffect, useState } from "react";

interface MonthlyResolvedData {
  month: number;
  resolvedCount: number;
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function MonthlyTicketsChartTemplate() {
  const [monthlyData, setMonthlyData] = useState<{ month: string; resolved: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMonthlyData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/metrics/monthly-resolved`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MonthlyResolvedData[] = await res.json();

        const resolvedPerMonth = monthNames.map((name, i) => {
          const found = data.find((item) => item.month === i + 1);
          return { month: name, resolved: found ? found.resolvedCount : 0 };
        });

        setMonthlyData(resolvedPerMonth);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Failed to fetch monthly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
    return () => controller.abort();
  }, []);

  // Find max value for scaling
  const maxResolved = Math.max(...monthlyData.map(d => d.resolved), 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Tickets
        </h3>
        <details className="relative">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-800">⋮</summary>
          <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg z-10">
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => alert("View Details")}
            >
              View Details
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => alert("Export Data")}
            >
              Export Data
            </button>
          </div>
        </details>
      </div>

      {loading ? (
        <p className="text-gray-500 mt-4">Loading chart...</p>
      ) : (
        <div className="mt-4" style={{ width: "100%", height: 250 }}>
          <svg width="100%" height="100%" viewBox="0 0 600 250">
            {/* Y-axis lines */}
            {[0.25, 0.5, 0.75, 1].map((p, i) => {
              const y = 250 - p * 200 - 20;
              return (
                <line key={i} x1={50} y1={y} x2={580} y2={y} stroke="#ddd" strokeDasharray="3 3" />
              );
            })}

            {/* Bars */}
            {monthlyData.map((d, i) => {
              const barHeight = (d.resolved / (maxResolved || 1)) * 200;
              return (
                <g key={i}>
                  <rect
                    x={60 + i * 40}
                    y={230 - barHeight}
                    width={30}
                    height={barHeight}
                    fill="#00A76F"
                    rx={5}
                  />
                  <text
                    x={75 + i * 40}
                    y={245}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#555"
                  >
                    {d.month}
                  </text>
                  <text
                    x={75 + i * 40}
                    y={225 - barHeight}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#000"
                  >
                    {d.resolved}
                  </text>
                </g>
              );
            })}

            {/* Y-axis labels */}
            {[0.25, 0.5, 0.75, 1].map((p, i) => {
              const value = Math.round(maxResolved * p);
              const y = 230 - p * 200;
              return (
                <text key={i} x={30} y={y + 5} fontSize="10" fill="#555" textAnchor="end">
                  {value}
                </text>
              );
            })}

            {/* X-axis line */}
            <line x1={50} y1={230} x2={580} y2={230} stroke="#000" />
          </svg>
        </div>
      )}
    </div>
  );
}
