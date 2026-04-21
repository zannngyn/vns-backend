import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/line-charts-6";

const chartData = [
  { month: "Jan", revenue: 15 },
  { month: "Feb", revenue: 22 },
  { month: "Mar", revenue: 19 },
  { month: "Apr", revenue: 35 },
  { month: "May", revenue: 28 },
  { month: "Jun", revenue: 45 },
  { month: "Jul", revenue: 42 },
];

const chartConfig = {
  revenue: {
    label: "Revenue (Mil VND)",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

export function DashboardOverview() {
  return (
    <div className="w-full flex flex-col gap-10 font-sans text-zinc-950 pb-10">
      {/* Header section with brutalist/minimalist aesthetics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
            Dashboard
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            Real-time fulfillment & Commerce telemetry
          </p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            System Status
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-950"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase">
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics (Rule of 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="flex flex-col border-[3px] border-zinc-950 p-6 bg-white relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase z-10">
            Total Revenue
          </h3>
          <p className="text-5xl font-black mt-4 tracking-tighter z-10">
            45 <span className="text-2xl text-zinc-400">M</span>
          </p>
          <div className="mt-8 flex items-center justify-between z-10">
            <span className="text-xs font-bold bg-zinc-950 text-white px-3 py-1.5 uppercase tracking-widest">
              +12.5% M/M
            </span>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Updated 1h ago
            </span>
          </div>
          <div className="absolute inset-0 bg-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col border-[3px] border-zinc-950 p-6 bg-white relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase z-10">
            Total Orders
          </h3>
          <p className="text-5xl font-black mt-4 tracking-tighter z-10">
            1,234
          </p>
          <div className="mt-8 flex items-center justify-between z-10">
            <span className="text-xs font-bold bg-zinc-950 text-white px-3 py-1.5 uppercase tracking-widest">
              +5.2% M/M
            </span>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Processing 12
            </span>
          </div>
          <div className="absolute inset-0 bg-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Metric 3 - Inverted block for contrast (Hick's / Von Restorff effect) */}
        <div className="flex flex-col border-[3px] border-zinc-950 p-6 bg-zinc-950 text-white relative hover:-translate-y-1 transition-transform cursor-default">
          <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase z-10">
            Active Products
          </h3>
          <p className="text-5xl font-black mt-4 tracking-tighter z-10">156</p>
          <div className="mt-8 flex items-center justify-between z-10 border-t border-zinc-800 pt-3">
            <span className="text-[10px] font-bold tracking-widest uppercase border border-zinc-700 px-2 py-1">
              2 OUT OF STOCK
            </span>
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              Catalog synced
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-4 border-[3px] border-zinc-950 pt-10 pb-6 px-4 md:px-8 relative bg-white">
        <div className="absolute top-0 left-0 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 border-r-[3px] border-b-[3px] border-zinc-950">
          Revenue Trajectory (Millions VND)
        </div>

        <div className="mt-8 w-full h-[400px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 10, left: -20, right: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--foreground))"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--foreground))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                horizontal={true}
                strokeDasharray="3 3"
                stroke="#f4f4f5"
                strokeWidth={2}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={16}
                tickFormatter={(value) => value.slice(0, 3)}
                className="text-xs font-bold font-mono tracking-widest uppercase fill-zinc-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={16}
                tickFormatter={(value) => `${value}M`}
                className="text-xs font-bold font-mono fill-zinc-400"
              />

              <ChartTooltip
                cursor={{
                  stroke: "#18181b",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                }}
                content={<ChartTooltipContent indicator="line" />}
              />

              {/* Using monotone type for a smooth, readable curve */}
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                stroke="hsl(var(--foreground))"
                strokeWidth={3}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="absolute bottom-4 right-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-950"></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">
              Actual
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
