import { api } from "@/utils/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export function WeightChart() {
  const { data = [], isLoading } = api.data.getAll.useQuery({
    userId: "1",
  });

  // Sort data by date (oldest to newest)
  const sortedData = [...data].sort((a, b) => a.date - b.date);

  // Format data for the chart
  const chartData = sortedData.map((entry) => ({
    date: new Date(entry.date),
    weight: entry.weight,
    formattedDate: format(new Date(entry.date), "MMM d, yyyy"),
  }));

  // Calculate min and max weight for Y-axis domain with some padding
  const weights = chartData.map((entry) => entry.weight);
  const minWeight = Math.max(0, Math.min(...weights) - 5);
  const maxWeight = Math.max(...weights) + 5;

  // Chart configuration
  const chartConfig = {
    weight: {
      label: "Weight",
      color: "#8884d8",
    },
  };

  if (isLoading) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-white/5"></div>;
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-white/20 bg-white/5 p-6 text-white">
        <p>No weight data available. Add your weight to see the chart.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-white/20 bg-white/5 p-6 text-white">
      <h2 className="mb-4 text-2xl font-bold">Weight History</h2>
      <div className="h-64">
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date: string) => format(date, "MMM d")}
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis 
              domain={[minWeight, maxWeight]} 
              tick={{ fill: "#9ca3af" }}
              tickFormatter={(value) => `${value} lbs`}
            />
            {/*<ChartTooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(_, payload) => {
                        if (payload[0]) {
                          const p = payload[0]
                          return payload[0].payload.formattedDate;
                        }
                        return "";
                      }}
                    />
                  );
                }
                return null;
              }}
            />*/}
            <Line
              type="monotone"
              dataKey="weight"
              name="weight"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
