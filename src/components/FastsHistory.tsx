"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api } from "@/lib/trpc/client";
import type { Fast } from "@/server/db/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface FastProgressBarProps {
  targetHours: number;
  actualHours: number;
}

function FastProgressBar({ targetHours, actualHours }: FastProgressBarProps) {
  const completionPercentage = Math.min((actualHours / targetHours) * 100, 100);
  
  return (
    <div className="w-full h-6 bg-[var(--ctp-overlay0)] rounded-full overflow-hidden relative">
      <div 
        className="h-full bg-[var(--ctp-green)] transition-all duration-300 rounded-full"
        style={{ width: `${completionPercentage}%` }}
      />
    </div>
  );
}

interface FastTableRowProps {
  fast: Fast;
}

function FastTableRow({ fast }: FastTableRowProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const calculateDuration = (fast: Fast) => {
    if (!fast.startTime || !fast.endTime) {
      return 0;
    }
    const start = new Date(fast.startTime);
    const end = new Date(fast.endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not started";
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  const getStatus = (fast: Fast) => {
    if (!fast.startTime) return "Created";
    if (!fast.endTime) return "Active";
    return "Completed";
  };

  const handleClick = useCallback(async () => {
    if (!fast.id) return;
    
    // Set the fast data in cache for getCurrentFast query
    utils.fast.getCurrentFast.setData({ id: fast.id }, fast);
    
    // Navigate to the fast page
    router.push(`/fast?id=${fast.id}`);
  }, [fast, router, utils.fast.getCurrentFast]);

  const actualHours = calculateDuration(fast);
  const status = getStatus(fast);

  return (
    <tr 
      onClick={handleClick}
      className="border-b border-[var(--ctp-surface0)] hover:bg-[var(--ctp-surface0)] transition-colors cursor-pointer"
    >
      <td className="p-4">
        <span className="font-medium text-[var(--ctp-text)]">
          {fast.fastType}
        </span>
      </td>
      <td className="p-4 text-[var(--ctp-subtext1)]">
        {fast.targetHours}h
      </td>
      <td className="p-4 text-[var(--ctp-subtext1)]">
        {status === "Completed" ? formatDuration(actualHours) : "-"}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-[120px]">
            <FastProgressBar 
              targetHours={fast.targetHours} 
              actualHours={actualHours} 
            />
          </div>
          <span className="text-sm text-[var(--ctp-subtext1)] min-w-[40px]">
            {status === "Completed" ? 
              `${Math.round((actualHours / fast.targetHours) * 100)}%` : 
              status === "Active" ? "..." : "0%"
            }
          </span>
        </div>
      </td>
      <td className="p-4 text-[var(--ctp-subtext1)]">
        {formatDate(fast.startTime)}
      </td>
      <td className="p-4 text-[var(--ctp-subtext1)]">
        {formatDate(fast.endTime)}
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "Completed" 
            ? "bg-[var(--ctp-green)] text-[var(--ctp-base)]"
            : status === "Active"
            ? "bg-[var(--ctp-yellow)] text-[var(--ctp-base)]"
            : "bg-[var(--ctp-overlay0)] text-[var(--ctp-text)]"
        }`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

interface FastsHistoryProps {
  initFasts: Fast[];
}

export function FastsHistory({ initFasts }: FastsHistoryProps) {
  const { data: fasts = initFasts } = api.fast.getAllFasts.useQuery();

  if (fasts.length === 0) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-[var(--ctp-subtext1)]">No fasts found. Start your first fast to see your history!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle>Your Fasting History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 bg-[var(--ctp-surface0)] z-10">
              <tr className="border-b border-[var(--ctp-surface1)]">
                <th className="text-left p-4 font-medium text-[var(--ctp-subtext1)]">Type</th>
                <th className="text-left p-4 font-medium text-[var(--ctp-subtext1)]">Target</th>
                <th className="text-left p-4 font-medium text-[var(--ctp-subtext1)]">Duration</th>
                <th className="text-left p-4 font-medium text-[var(--ctp-subtext1)]">Progress</th>
                <th className="text-left p-4 font-medium text-[var(--ctp-subtext1)]">Started</th>
                <th className="text-left p-4 font-medium text-[var(--ctp-subtext1)]">Ended</th>
                <th className="text-left p-4 font-medium text-[var(--ctp-subtext1)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {fasts.map((fast) => (
                <FastTableRow 
                  key={fast.id} 
                  fast={fast} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
