"use client";

import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { api } from "@/lib/trpc/client";
import type { Fast } from "@/server/db/schema";

// duration in hours
const fastTypes = [
  {
    name: "Circadian Diet",
    duration: 13,
  },
  {
    name: "16:8 Intermittent",
    duration: 16,
  },
  {
    name: "18:6 Intermittent",
    duration: 18,
  },
  {
    name: "20:4 Intermittent",
    duration: 20,
  },
  {
    name: "20:4 Warrior",
    duration: 20,
  },
  {
    name: "36-Hour Fast",
    duration: 36,
  },
];

export default function FastingTracker({
  initFast,
}: {
  initFast: Fast | undefined;
}) {
  const utils = api.useUtils();
  const { data: currentFast = initFast } = api.fast.getCurrentFast.useQuery({
    userId: "1",
  });
  const { mutate: createFast } = api.fast.createFast.useMutation({
    onSuccess: () => {
      // Refetch the current fast after creating
      void utils.fast.getCurrentFast.invalidate();
    },
  });
  const { mutate: startFast } = api.fast.startFast.useMutation({
    onSuccess: () => {
      // Refetch the current fast after starting
      void utils.fast.getCurrentFast.invalidate();
    },
  });
  const { mutate: endFast } = api.fast.endFast.useMutation({
    onSuccess: () => {
      // Refetch the current fast after ending
      void utils.fast.getCurrentFast.invalidate();
    },
  });

  const [timeState, setTimeState] = useState({
    remainingTime: "0:00:00",
    elapsedTime: "0:00:00",
    progress: 0,
    elapsedPercent: 0,
    remainingPercent: 100,
  });

  // Update timer every second
  useEffect(() => {
    if (!currentFast?.startTime) return;

    const intervalId = setInterval(() => {
      if (!currentFast.startTime) return;

      const startTime = new Date(currentFast.startTime);
      const now = new Date();
      const targetEndTime = new Date(startTime);
      targetEndTime.setHours(
        targetEndTime.getHours() + currentFast.targetHours,
      );

      // If fast is completed
      if (currentFast.endTime) {
        clearInterval(intervalId);
        const endTime = new Date(currentFast.endTime);
        const totalDurationMs = endTime.getTime() - startTime.getTime();
        const totalTargetMs = targetEndTime.getTime() - startTime.getTime();
        const progress = Math.min(
          100,
          Math.round((totalDurationMs / totalTargetMs) * 100),
        );

        setTimeState({
          elapsedTime: formatDuration(totalDurationMs),
          remainingTime: "0:00:00",
          progress: progress,
          elapsedPercent: progress,
          remainingPercent: 0,
        });
        return;
      }

      // For ongoing fast
      const elapsedMs = now.getTime() - startTime.getTime();
      const remainingMs = Math.max(0, targetEndTime.getTime() - now.getTime());
      const totalDurationMs = currentFast.targetHours * 60 * 60 * 1000;
      const progress = Math.min(
        100,
        Math.round((elapsedMs / totalDurationMs) * 100),
      );

      setTimeState({
        elapsedTime: formatDuration(elapsedMs),
        remainingTime: formatDuration(remainingMs),
        progress: progress,
        elapsedPercent: progress,
        remainingPercent: 100 - progress,
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentFast]);

  // Helper function to format duration in HH:MM:SS
  const formatDuration = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper function to format date in "Today/Yesterday, HH:MM AM/PM" format
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    let prefix = "";
    if (date.toDateString() === now.toDateString()) {
      prefix = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      prefix = "Yesterday";
    } else {
      prefix = date.toLocaleDateString();
    }

    return `${prefix}, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  // This would normally be connected to a timer logic
  // but for demo purposes we're keeping it static
  if (!currentFast) {
    return (
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Start a Fast</h1>
        <div className="flex flex-col gap-2">
          {fastTypes.map((fast) => (
            <Button
              key={fast.name}
              onClick={() => {
                createFast({
                  userId: "1",
                  duration: fast.duration,
                });
              }}
            >
              {fast.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // If fast exists but hasn't been started yet
  if (currentFast && !currentFast.startTime) {
    const selectedFastType = fastTypes.find(
      (fast) => fast.duration === currentFast.targetHours,
    );

    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <CardTitle>Ready to Begin Your Fast</CardTitle>

          <Badge className="px-4">
            {selectedFastType?.name ?? `${currentFast.targetHours}-HOUR FAST`}
          </Badge>

          <div className="my-4 text-center">
            <p className="mb-2 text-[#b5bfe2]">
              You&apos;ve selected a {currentFast.targetHours}-hour fast.
            </p>
            <p className="text-[#b5bfe2]">
              Click the button below when you&apos;re ready to start.
            </p>
          </div>

          <Button
            onClick={() => {
              startFast({
                id: currentFast.id ?? "000",
                userId: currentFast.userId,
                startTime: new Date().toISOString(),
              });
            }}
            className="mt-2"
          >
            Start Fasting Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle>You&apos;re fasting!</CardTitle>

      <CardContent>
        <div className="flex items-center justify-center">
          <Badge className="px-4">
            {currentFast.fastType || `${currentFast.targetHours}-HOUR FAST`}
          </Badge>
        </div>

        <div className="relative my-4 flex h-64 w-64 items-center justify-center">
          {/* Progress Circle */}
          <svg className="h-full w-full" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#737994"
              strokeWidth="10"
            />

            {/* Progress Arc - we'll use strokeDasharray and strokeDashoffset to show progress */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f4b8e4"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="282.7"
              strokeDashoffset={282.7 - (282.7 * timeState.progress) / 100}
              transform="rotate(-90 50 50)"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="mb-1 text-xs text-[#b5bfe2]">
              REMAINING ({timeState.remainingPercent}%)
            </div>
            <div className="text-4xl font-semibold text-[#c6d0f5]">
              {timeState.remainingTime}
            </div>
            <div className="mt-1 text-xs text-[#b5bfe2]">
              Elapsed Time ({timeState.elapsedPercent}%)
            </div>
            <div className="text-sm text-[#b5bfe2]">
              {timeState.elapsedTime}
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center">
          <Button
            variant="outline"
            onClick={() => {
              void endFast({
                id: currentFast.id ?? "000",
                userId: currentFast.userId,
                endTime: new Date().toISOString(),
              });
            }}
          >
            End fast
          </Button>
        </div>

        <div className="mt-2 flex w-full justify-between gap-2 px-2 text-xs text-[#b5bfe2]">
          <div>
            <div className="uppercase">Started fasting</div>
            <div className="mt-1 flex items-center text-[#f9e2af]">
              <span>{formatDateTime(currentFast.startTime)}</span>
              <Edit className="ml-1 h-3 w-3" />
            </div>
          </div>

          <div className="text-right">
            <div className="uppercase">Fast ending</div>
            <div className="mt-1 text-[#c6d0f5]">
              {currentFast.startTime
                ? formatDateTime(
                    new Date(
                      new Date(currentFast.startTime).getTime() +
                        currentFast.targetHours * 60 * 60 * 1000,
                    ).toISOString(),
                  )
                : "Not started"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
