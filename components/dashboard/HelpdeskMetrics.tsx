"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowDown, ArrowUp, Ticket, CheckCircle } from "lucide-react";

interface Metrics {
  totalTickets: number;
  resolvedTickets: number;
}

export const HelpdeskMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({ totalTickets: 0, resolvedTickets: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/metrics/counts`
      );
      if (!response.ok) throw new Error("Failed to fetch metrics");

      const data: Metrics = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) return <p>Loading metrics...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Tickets */}
      <MetricCard
        icon={<Ticket className="text-gray-800 size-6 dark:text-white/90" />}
        label="Total Tickets"
        value={metrics.totalTickets}
        trendIcon={<ArrowUp className="text-green-500" />}
        trendBg="bg-green-100 dark:bg-green-900"
      />

      {/* Resolved Tickets */}
      <MetricCard
        icon={<CheckCircle className="text-gray-800 dark:text-white/90" />}
        label="Resolved Tickets"
        value={metrics.resolvedTickets}
        trendIcon={<ArrowDown className="text-red-500" />}
        trendBg="bg-red-100 dark:bg-red-900"
      />
    </div>
  );
};

// Small reusable component for better maintainability
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  trendIcon: React.ReactNode;
  trendBg: string;
}

const MetricCard = ({ icon, label, value, trendIcon, trendBg }: MetricCardProps) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
      {icon}
    </div>

    <div className="flex items-end justify-between mt-5">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
          {value}
        </h4>
      </div>

      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${trendBg}`}
      >
        {trendIcon}
      </span>
    </div>
  </div>
);
