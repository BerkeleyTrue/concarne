"use client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardTitle } from "./ui/card";
import { api } from "@/lib/trpc/client";

type Payload = {
  date: Date;
  weight: number;
  formattedDate: string;
};

export function WeightChart() {
  const { data = [], isLoading } = api.data.getAll.useQuery({
    userId: "1",
  });
  const { data: user } = api.auth.getUser.useQuery({
    userId: "1",
  });

  // Sort data by date (oldest to newest)
  const sortedData = [...data].sort((a, b) => +a.date - +b.date);

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

  // Calculate BMI threshold weights based on user's height (in inches)
  // Using the formula: BMI = (weight in pounds * 703) / (height in inches)²
  // Rearranged to solve for weight: weight = (BMI * height²) / 703
  const heightInInches = user?.height ?? 0;
  const bmi30Weight =
    heightInInches > 0
      ? Math.round((30 * heightInInches * heightInInches) / 703)
      : 0;
  const bmi35Weight =
    heightInInches > 0
      ? Math.round((35 * heightInInches * heightInInches) / 703)
      : 0;

  // Chart configuration
  const chartConfig = {
    weight: {
      label: "Weight",
      color: "#ca9ee6",
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <div className="h-80 w-full animate-pulse rounded-lg bg-white/5"></div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-card text-card-foreground flex h-80 w-full items-center justify-center border border-[var(--ctp-text)]/20 p-6">
        <p>No weight data available. Add your weight to see the chart.</p>
      </div>
    );
  }

  return (
    <Card className="bg-card text-card-foreground w-full rounded-lg border border-[var(--ctp-text)]/20 p-6">
      <CardTitle>Weight History</CardTitle>
      <CardContent className="h-full min-h-80 overflow-x-auto overflow-y-auto">
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 30, left: 30 }}
            height={500}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={(date: string) => format(date, "MMM d")}
              tick={{ fill: "#949cbb" }}
            />
            <YAxis
              domain={[
                Math.min(
                  minWeight,
                  bmi30Weight > 0 ? bmi30Weight - 20 : minWeight,
                ),
                Math.max(
                  maxWeight,
                  bmi35Weight > 0 ? bmi35Weight + 20 : maxWeight,
                ),
              ]}
              tick={{ fill: "#949cbb" }}
              tickFormatter={(value) => `${value} lbs`}
              padding={{ top: 20, bottom: 20 }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelFormatter={(_, payload) => {
                        if (payload[0]) {
                          return (payload[0].payload as Payload).formattedDate;
                        }
                        return "";
                      }}
                    />
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              name="weight"
              stroke="#babbf1"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {heightInInches > 0 && bmi30Weight > 0 && (
              <ReferenceLine
                y={bmi30Weight}
                stroke="#ef9f76"
                strokeDasharray="3 3"
                label={{
                  value: `BMI 30 (${bmi30Weight} lbs) Class 1`,
                  position: "insideBottomRight",
                  fill: "#ef9f76",
                }}
              />
            )}
            {heightInInches > 0 && bmi35Weight > 0 && (
              <ReferenceLine
                y={bmi35Weight}
                stroke="#e78284"
                strokeDasharray="3 3"
                label={{
                  value: `BMI 35 (${bmi35Weight} lbs) Class 2`,
                  position: "insideBottomRight",
                  fill: "#e78284",
                }}
              />
            )}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
