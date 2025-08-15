'use client';

import { useEffect, useState, useCallback } from "react";

interface DepartmentData {
  department: string;
  ticketCount: number;
}

export default function DepartmentTicketBreakdown() {
  const [data, setData] = useState<DepartmentData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchDepartmentData = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/metrics/department-breakdown`
      );
      if (!res.ok) throw new Error("Failed to fetch data");

      const result: DepartmentData[] = await res.json();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch department breakdown:", err);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  // Chart dimensions
  const chartWidth = 500;
  const chartHeight = 300;
  const barHeight = 30;
  const gap = 10;
  const maxValue = Math.max(...data.map(d => d.ticketCount), 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Department Ticket Breakdown
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Number of tickets per department
            </p>
          </div>

          {/* Lightweight Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ⋮
            </button>
            {isOpen && (
              <div
                className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg dark:bg-gray-800 z-50"
                onMouseLeave={() => setIsOpen(false)}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View More
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export Data
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pure SVG Chart */}
        <div className="relative mt-5 overflow-x-auto">
          <svg
            width={chartWidth}
            height={data.length * (barHeight + gap)}
            className="bg-transparent"
          >
            {data.map((d, i) => {
              const barWidth = maxValue ? (d.ticketCount / maxValue) * (chartWidth - 150) : 0;
              const y = i * (barHeight + gap);

              return (
                <g key={d.department} transform={`translate(100, ${y})`}>
                  {/* Department label */}
                  <text
                    x={-10}
                    y={barHeight / 2}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fontSize="12"
                    fill="#555"
                  >
                    {d.department}
                  </text>

                  {/* Bar */}
                  <rect
                    x={0}
                    y={0}
                    width={barWidth}
                    height={barHeight}
                    fill="#465FFF"
                    rx={4}
                    ry={4}
                  />

                  {/* Ticket count label */}
                  <text
                    x={barWidth + 5}
                    y={barHeight / 2}
                    alignmentBaseline="middle"
                    fontSize="12"
                    fill="#333"
                  >
                    {d.ticketCount}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
