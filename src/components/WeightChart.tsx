"use client";
import { useRef, useState, useEffect, useCallback } from "react";
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { api } from "@/lib/trpc/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { WeightForm } from "./WeightForm";

type Payload = {
  date: Date;
  weight: number;
  formattedDate: string;
};

// Number of data points to show in the default view
const DEFAULT_VISIBLE_POINTS = 14; // Show last 2 weeks by default
const POINT_WIDTH = 30; // Width per data point in pixels (reduced from 60)
const CHART_HEIGHT = 400; // Fixed height for the chart
const MAX_CHART_WIDTH = 2000; // Maximum chart width to prevent rendering issues

export function WeightChart() {
  const { data = [], isLoading } = api.data.getAll.useQuery();
  const { data: user } = api.auth.getUser.useQuery();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  // Initialize with a default domain instead of null

  // Sort data by date (newest to oldest)
  const sortedData = [...data].sort((a, b) => +b.date - +a.date);

  // Limit the number of data points to prevent rendering issues
  // If there are too many points, sample them to reduce the total
  let dataToUse = sortedData;
  if (sortedData.length > 100) {
    // For large datasets, sample every nth point but always include the most recent 30 points
    const recentPoints = sortedData.slice(0, 30);
    const olderPoints = sortedData.slice(30);

    // Sample older points at regular intervals
    const samplingRate = Math.ceil(olderPoints.length / 70); // Aim for about 70 older points
    const sampledOlderPoints = olderPoints.filter(
      (_, index) => index % samplingRate === 0,
    );

    dataToUse = [...recentPoints, ...sampledOlderPoints];
    console.log(
      `Reduced data points from ${sortedData.length} to ${dataToUse.length}`,
    );
  }

  // Format data for the chart
  const chartData = dataToUse.map((entry) => ({
    date: new Date(entry.date),
    weight: entry.weight,
    formattedDate: format(new Date(entry.date), "MMM d, yyyy"),
  }));

  // Calculate min and max weight for Y-axis domain with some padding
  const weights = chartData.map((entry) => entry.weight);
  const minWeight =
    weights.length > 0 ? Math.max(0, Math.min(...weights) - 5) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) + 5 : 100;

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

  // Calculate chart width based on number of data points, with a maximum limit
  const chartWidth = Math.min(
    Math.max(chartData.length * POINT_WIDTH, 500),
    MAX_CHART_WIDTH,
  );

  // Track visible data range for y-axis auto-scaling
  const [visibleYDomain, setVisibleYDomain] = useState<[number, number] | null>(
    null,
  );

  // Function to toggle y-axis auto-scaling
  const [autoScaleEnabled, setAutoScaleEnabled] = useState(true);

  // Use a debounced version to prevent excessive calculations
  const updateVisibleYDomain = useCallback(() => {
    if (!containerRef.current || chartData.length === 0 || !autoScaleEnabled)
      return;

    const containerWidth = containerRef.current.clientWidth;
    const scrollLeft = containerRef.current.scrollLeft;

    // Calculate the visible range of data points
    const pointsPerScreen = Math.floor(containerWidth / POINT_WIDTH);
    const startIndex = Math.floor(scrollLeft / POINT_WIDTH);
    const endIndex = Math.min(
      startIndex + pointsPerScreen,
      chartData.length - 1,
    );

    // Skip if we're trying to calculate for too many points
    if (endIndex - startIndex > 100) {
      console.log("Too many points to calculate y-domain, skipping");
      return;
    }

    // Get weights only from visible data points - use a more efficient approach
    let minWeight = Infinity;
    let maxWeight = -Infinity;

    // Manual min/max calculation is faster than using Math.min/max with spread
    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < chartData.length) {
        const weight = chartData?.[i]?.weight ?? 0;
        if (weight < minWeight) minWeight = weight;
        if (weight > maxWeight) maxWeight = weight;
      }
    }

    if (minWeight === Infinity || maxWeight === -Infinity) return;

    // Calculate min and max with minimal padding for tighter focus
    const visibleMin = Math.max(0, minWeight - 2); // Reduced padding from 5 to 2
    const visibleMax = maxWeight + 2; // Reduced padding from 5 to 2

    // Only update if there's a significant change (prevents unnecessary re-renders)
    if (
      !visibleYDomain ||
      Math.abs(visibleYDomain[0] - visibleMin) > 1 ||
      Math.abs(visibleYDomain[1] - visibleMax) > 1
    ) {
      setVisibleYDomain([visibleMin, visibleMax]);
      console.log(
        `Y-axis auto-scaled: [${visibleMin}, ${visibleMax}] (points ${startIndex}-${endIndex})`,
      );
    }
  }, [chartData, autoScaleEnabled, visibleYDomain]);

  // Determine if we need to show scroll hint (if there are more points than visible)
  useEffect(() => {
    console.log("Chart width:", chartWidth); // Debug: Log chart width
    console.log("Chart data length:", chartData.length); // Debug: Log data length

    if (chartData.length > DEFAULT_VISIBLE_POINTS) {
      setShowScrollHint(true);

      // Scroll to the beginning to show most recent data by default
      if (containerRef.current) {
        // Use a single timeout with a longer delay to ensure chart is fully rendered
        const scrollTimer = setTimeout(() => {
          if (containerRef.current) {
            // Scroll to show the most recent data (right side of chart)
            const scrollPosition = Math.max(
              0,
              chartWidth - containerRef.current.clientWidth,
            );
            console.log("Container width:", containerRef.current.clientWidth);
            console.log("Scrolling to:", scrollPosition);
            containerRef.current.scrollLeft = scrollPosition;

            // Y-axis update will happen via the scroll event listener
          }
        }, 600); // Increased timeout to ensure chart is fully rendered

        // Hide the hint after 5 seconds
        const hintTimer = setTimeout(() => {
          setShowScrollHint(false);
        }, 5000);

        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(hintTimer);
        };
      }
    }
  }, [chartData.length, chartWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial update of visible domain
    if (autoScaleEnabled) {
      // Delay initial update to ensure chart is fully rendered
      setTimeout(updateVisibleYDomain, 100);
    }

    // Debounce function to limit how often we update during scrolling
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (!autoScaleEnabled) return;

      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Only update the domain when scrolling stops
      scrollTimeout = setTimeout(() => {
        updateVisibleYDomain();
      }, 150); // Wait 150ms after scrolling stops before updating
    };

    container.addEventListener("scroll", handleScroll);

    // Clean up
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [chartData, autoScaleEnabled, updateVisibleYDomain]);

  // Chart configuration
  const chartConfig = {
    weight: {
      label: "Weight",
      color: "#ca9ee6",
    },
  } satisfies ChartConfig;

  // Toggle auto-scaling function
  const toggleAutoScale = () => {
    if (autoScaleEnabled) {
      // Disable auto-scaling and reset to full range
      setVisibleYDomain(null);
      setAutoScaleEnabled(false);
    } else {
      // Enable auto-scaling and update immediately
      setAutoScaleEnabled(true);
      // Delay the update slightly to ensure state is updated
      setTimeout(updateVisibleYDomain, 50);
    }
  };

  // Function to scroll left
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
      // Update happens automatically via scroll event listener
    }
  };

  // Function to scroll right
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
      // Update happens automatically via scroll event listener
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="">Weight History</CardTitle>
        <CardDescription>
          {isLoading ? (
            <p>Loading...</p>
          ) : chartData.length == 0 ? (
            <p>No data available</p>
          ) : (
            <p>
              {chartData.length} data points over{" "}
              {chartData.length > 0
                ? Math.round(
                    (chartData?.[0]?.date?.getTime() ??
                      0 - (chartData.at(-1)?.date?.getTime() ?? 0)) /
                      (1000 * 60 * 60 * 24),
                  )
                : 0}{" "}
              days
            </p>
          )}
        </CardDescription>
        <CardAction>
          {chartData.length > DEFAULT_VISIBLE_POINTS && (
            <>
              <button
                onClick={scrollLeft}
                className="hover:bg-muted rounded-full p-1 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={scrollRight}
                className="hover:bg-muted rounded-full p-1 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <button
            onClick={toggleAutoScale}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              autoScaleEnabled
                ? "bg-[var(--ctp-mauve)] text-white"
                : "bg-[var(--ctp-surface0)] text-[var(--ctp-text)]"
            }`}
            title={
              autoScaleEnabled ? "Disable auto-scaling" : "Enable auto-scaling"
            }
          >
            {autoScaleEnabled ? "Auto Y" : "Full Y"}
          </button>
        </CardAction>
      </CardHeader>

      <CardContent
        className="relative h-full max-h-[80vh] min-h-80 overflow-x-auto overflow-y-hidden"
        ref={containerRef}
      >
        {showScrollHint && (
          <div className="absolute top-4 right-4 z-10 animate-pulse rounded-md bg-black/70 px-3 py-1 text-xs text-white">
            Scroll to see more data
          </div>
        )}
        <div style={{ width: `${chartWidth}px`, minWidth: "100%" }}>
          {chartData.length > 0 && (
            <ChartContainer config={chartConfig}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, bottom: 30, left: 30 }}
                height={CHART_HEIGHT}
                width={chartWidth}
                className="recharts-wrapper"
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date: string) => format(date, "MMM d")}
                  tick={{ fill: "#949cbb" }}
                  reversed={true} // Reverse the x-axis to maintain chronological order
                />
                <YAxis
                  domain={
                    visibleYDomain ?? [
                      Math.max(
                        0,
                        Math.min(
                          minWeight,
                          bmi30Weight > 0 ? bmi30Weight - 20 : minWeight,
                        ),
                      ),
                      Math.max(
                        maxWeight,
                        bmi35Weight > 0 ? bmi35Weight + 20 : maxWeight,
                      ),
                    ]
                  }
                  tick={{ fill: "#949cbb" }}
                  tickFormatter={(value) => `${value} lbs`}
                  padding={{ top: 10, bottom: 10 }} // Reduced padding
                  width={60}
                  // Limit the number of ticks to prevent overcrowding
                  tickCount={5} // Reduced from 7 to 5 for less crowding
                  // Allow decimal ticks when range is small
                  allowDecimals={true}
                  // Ensure ticks are at nice intervals
                  scale="auto"
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
                              return (payload[0].payload as Payload)
                                .formattedDate;
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
                  dot={chartData.length > 50 ? false : { r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
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
          )}
          {chartData.length === 0 && (
            <div className="flex h-80 items-center justify-center">
              <p>No data to display</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t justify-end">
        <Button asChild={true} variant="destructive" className="mr-4">
          <Link href="/weight/backup">Backup</Link>
        </Button>
        <WeightForm />
      </CardFooter>
    </Card>
  );
}
