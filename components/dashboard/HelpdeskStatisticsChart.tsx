"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";

interface TicketMetric {
  month?: number;    // present for monthly
  quarter?: number;  // present for quarterly
  year: number;
  ticketCount: number;
}

type ChartType = "monthly" | "quarterly" | "yearly";

export default function HelpdeskStatisticsChart() {
  const [chartType, setChartType] = useState<ChartType>("monthly");
  const [chartData, setChartData] = useState<{ label: string; opened: number; resolved: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const formatLabel = useCallback((item: TicketMetric) => {
    if (chartType === "monthly" && item.month) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[item.month - 1]} ${item.year}`;
    }
    if (chartType === "quarterly" && item.quarter) {
      return `Q${item.quarter} ${item.year}`;
    }
    return `${item.year}`;
  }, [chartType]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const [openedRes, resolvedRes]: [TicketMetric[], TicketMetric[]] = await Promise.all([
          fetch(`${baseUrl}/tickets/metrics/time-distribution?type=${chartType}`).then(r => r.json()),
          fetch(`${baseUrl}/tickets/metrics/time-distribution?type=${chartType}&status=resolved`).then(r => r.json()),
        ]);

        const merged = openedRes.map((openedItem) => {
          const label = formatLabel(openedItem);
          const resolvedItem = resolvedRes.find(r => formatLabel(r) === label);
          return {
            label,
            opened: openedItem.ticketCount,
            resolved: resolvedItem ? resolvedItem.ticketCount : 0
          };
        });

        setChartData(merged);
      } catch (err) {
        console.error("Failed to fetch chart data", err);
      }
    };

    fetchData();
  }, [chartType, formatLabel]);

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute scales
  const maxY = Math.max(...chartData.map(d => Math.max(d.opened, d.resolved)), 0) || 1;
  const scaleX = (i: number) =>
    padding.left + (i / Math.max(chartData.length - 1, 1)) * (width - padding.left - padding.right);
  const scaleY = (val: number) =>
    height - padding.bottom - (val / maxY) * (height - padding.top - padding.bottom);

  // Build area path
  const buildAreaPath = (key: "opened" | "resolved") => {
    if (!chartData.length) return "";
    const topLine = chartData.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d[key])}`).join(" ");
    return `${topLine} L ${scaleX(chartData.length - 1)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`;
  };

  // Build line path
  const buildLinePath = (key: "opened" | "resolved") => {
    return chartData.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d[key])}`).join(" ");
  };

  return (
    <div className="rounded-2xl border p-5 bg-white dark:bg-white/[0.03]" ref={containerRef}>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Helpdesk Statistics</h3>
          <p className="text-sm text-gray-500">Overview of opened and resolved tickets</p>
        </div>
        <select
          className="border px-2 py-1 rounded text-sm focus:outline-none focus:ring focus:ring-blue-300"
          value={chartType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
            setChartType(e.target.value as ChartType)
          }
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {chartData.length > 0 && (
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padding.top + (i / 4) * (height - padding.top - padding.bottom);
            const value = Math.round(maxY - (i / 4) * maxY);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#ccc"
                  strokeDasharray="3,3"
                />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize="12"
                  fill="#666"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={scaleX(i)}
              y={height - padding.bottom + 15}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {d.label}
            </text>
          ))}

          {/* Areas */}
          <path d={buildAreaPath("opened")} fill="rgba(255, 87, 51, 0.3)" />
          <path d={buildAreaPath("resolved")} fill="rgba(0, 167, 111, 0.3)" />

          {/* Lines */}
          <path d={buildLinePath("opened")} stroke="#FF5733" strokeWidth={2} fill="none" />
          <path d={buildLinePath("resolved")} stroke="#00A76F" strokeWidth={2} fill="none" />

          {/* Dots */}
          {chartData.map((d, i) => (
            <circle key={`o-${i}`} cx={scaleX(i)} cy={scaleY(d.opened)} r={3} fill="#FF5733" />
          ))}
          {chartData.map((d, i) => (
            <circle key={`r-${i}`} cx={scaleX(i)} cy={scaleY(d.resolved)} r={3} fill="#00A76F" />
          ))}

          {/* Legend */}
          <g transform={`translate(${width - 150}, ${padding.top})`}>
            <circle cx={0} cy={0} r={5} fill="#FF5733" />
            <text x={10} y={4} fontSize="12" fill="#333">Opened</text>
            <circle cx={0} cy={20} r={5} fill="#00A76F" />
            <text x={10} y={24} fontSize="12" fill="#333">Resolved</text>
          </g>
        </svg>
      )}
    </div>
  );
}
