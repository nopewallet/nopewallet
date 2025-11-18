"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

const RANGE_OPTIONS = [
  { label: "1 Min", value: 60 },
  { label: "2 Min", value: 120 },
  { label: "5 Min", value: 300 },
  { label: "10 Min", value: 600 },
  { label: "15 Min", value: 900 },
  { label: "30 Min", value: 1800 },
  { label: "45 Min", value: 2700 },
  { label: "1 Hour", value: 3600 },
  { label: "4 Hours", value: 14400 },
  { label: "1 Day", value: 86400 },
  { label: "1 Week", value: 604800 },
];

export default function CryptoChart({ cryptoId }: { cryptoId: string }) {
  const [history, setHistory] = useState<{ timestamp: number; price: number }[]>([]);
  const [range, setRange] = useState(RANGE_OPTIONS[3].value); // default 10 min

  const cryptoNames: Record<string, string> = {
    "SOL": "solana",
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "TRX": "tron",
    "BNB": "binancecoin",
    "AVAX": "avalanche",
    "BASE": "base",
  }
  const cryptoName = cryptoNames[cryptoId] || cryptoId;

  // Fetch history on load or crypto change
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`https://paynope.com/v1/prices/history/${cryptoName}`);
        const raw = await res.json();

        const sorted = raw
          .map((item: any) => ({
            price: item.price_usd,
            timestamp: item.recorded_at * 1000,
          }))
          .sort((a: any, b: any) => a.timestamp - b.timestamp);

        setHistory(sorted);
      } catch (e) {
        console.error(e);
        setHistory([]);
      }
    }

    load();
  }, [cryptoName]);

  // Filter history to selected range
  const filtered = useMemo(() => {
    if (!history.length) return [];
    const latestTs = history[history.length - 1].timestamp;
    return history.filter((i) => i.timestamp >= latestTs - range * 1000);
  }, [history, range]);

  // --- LIVE CHART AUTO-UPDATE EVERY 30 SECONDS ---
useEffect(() => {
  if (!cryptoName) return;
  const fetchHistory = async () => {
    try {
      const res = await fetch(`/v1/prices/history/${cryptoName}`);
      const data = await res.json();

      const sorted = data
        .map((item: any) => ({
          price: item.price_usd,
          timestamp: item.recorded_at * 1000,
        }))
        .sort((a: any, b: any) => a.timestamp - b.timestamp);

      setHistory(sorted);
    } catch (err) {
      console.error("Live history fetch failed:", err);
    }
  };

  // Fetch immediately and then every 30 sec
  fetchHistory();
  const interval = setInterval(fetchHistory, 30000);

  return () => clearInterval(interval);
}, [cryptoName]);


  return (
    <div className="w-full">
      {/* Range selector */}
      <div className="flex gap-2 mb-3">
        <select
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="px-3 py-2 rounded border text-sm bg-white dark:bg-stone-900"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64">
        {filtered.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filtered}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} />

              {/* X axis */}
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={[
                  filtered[0]?.timestamp ?? "auto",
                  filtered[filtered.length - 1]?.timestamp ?? "auto",
                ]}
                scale="time"
                tickFormatter={(t) => {
                  const rangeHours = range / 3600;
                  if (rangeHours >= 24)
                    return new Date(t).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });

                  return new Date(t).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }}
              />

              {/* Y axis with exact same logic */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[
                  (min: number) => Math.floor(min * 0.995),
                  (max: number) => Math.ceil(max * 1.005),
                ]}
                tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                ticks={(() => {
                  if (!filtered.length) return [];
                  const prices = filtered.map((d) => d.price);
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);

                  let step = 1;
                  const diff = max - min;

                  if (diff > 1000) step = 500;
                  else if (diff > 100) step = 100;
                  else if (diff > 10) step = 10;
                  else if (diff > 1) step = 1;
                  else step = 0.1;

                  const ticks = [];
                  const start = Math.floor(min / step) * step;
                  const end = Math.ceil(max / step) * step;

                  for (let p = start; p <= end; p += step)
                    ticks.push(Number(p.toFixed(2)));

                  return ticks;
                })()}
              />

              {/* Last price marker */}
              {filtered.length > 1 && (
                <ReferenceDot
                  x={filtered[filtered.length - 1].timestamp}
                  y={filtered[filtered.length - 1].price}
                  yAxisId="right"
                  r={0}
                  isFront
                  label={{
                    value: `$${filtered[
                      filtered.length - 1
                    ].price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    position: "right",
                    fontSize: 10,
                    fontWeight: 600,
                    fill: "#a21caf",
                    offset: 8,
                  }}
                />
              )}

              {/* Tooltip with dark mode logic */}
              <Tooltip
                contentStyle={{
                  background: "var(--tooltip-bg, #fff)",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  color: "var(--tooltip-text, #111)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                labelStyle={{
                  fontSize: 10,
                  fontWeight: 500,
                }}
                formatter={(val: number) => `$${val.toFixed(2)}`}
                labelFormatter={(ts) =>
                  new Date(ts).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                  })
                }
                wrapperStyle={{
                  "--tooltip-bg": "#18181b",
                  "--tooltip-text": "#f3f4f6",
                } as React.CSSProperties}
              />

              {/* The Chart Line / Area */}
              <Area
                dataKey="price"
                type="linear"
                fill="#581c83ff"
                fillOpacity={0.4}
                stroke="#b663f1ff"
                yAxisId="right"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 text-sm pt-10">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
