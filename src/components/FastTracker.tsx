"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { api } from "@/lib/trpc/client";
import type { Fast } from "@/server/db/schema";
import { toast } from "sonner";
import { useBoolean } from "@/hooks/use-boolean";
import { UpdateStart } from "./fasting/update-start";
import { UpdateEnd } from "./fasting/update-end";

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

// Helper function to format duration in HH:MM:SS
const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  // Use date-fns format for consistent formatting
  if (format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
    return `Today, ${format(date, "h:mm a")}`;
  } else if (
    format(date, "yyyy-MM-dd") ===
    format(new Date(now.setDate(now.getDate() - 1)), "yyyy-MM-dd")
  ) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  } else {
    return format(date, "MMM d, h:mm a");
  }
};

export default function FastingTracker({
  initFast,
}: {
  initFast: Fast | null;
}) {
  const utils = api.useUtils();
  const [completedFastId, setCompletedFastId] = useState<number | null>(null);
  const { data: currentFast = initFast } = api.fast.getCurrentFast.useQuery(
    completedFastId ? { id: completedFastId } : undefined
  );
  const {
    value: isUpdatefastOpen,
    setTrue: openUpdateFast,
    setFalse: closeUpateFast,
  } = useBoolean(false);
  const {
    value: isUpdateEndOpen,
    setTrue: openUpdateEnd,
    setFalse: closeUpdateEnd,
  } = useBoolean(false);

  const { mutate: createFast } = api.fast.createFast.useMutation({
    onSuccess: () => {
      // Refetch the current fast after creating
      void utils.fast.getCurrentFast.invalidate();
    },
    onError: (error) => {
      console.error("Error creating fast:", error);
      toast.error("Failed to create fast. Please try again.");
    },
  });

  const startFast = api.fast.startFast.useMutation({
    onSuccess: () => {
      // Refetch the current fast after starting
      void utils.fast.getCurrentFast.invalidate();
    },
    onError: (error) => {
      console.error("Error starting fast:", error);
      toast.error("Failed to start fast. Please try again.");
    },
  });

  const endFast = api.fast.endFast.useMutation({
    onSuccess: () => {
      toast.success("Fast ended successfully!");
      void utils.fast.getCurrentFast.invalidate();
    },
    onError: (error) => {
      console.error("Error ending fast:", error);
      toast.error("Failed to end fast. Please try again.");
    },
  });

  // Check if fast is completed
  const [isCompleted, setIsCompleted] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const [timeState, setTimeState] = useState(() => {
    if (!currentFast?.startTime) {
      return {
        remainingTime: "0:00:00",
        elapsedTime: "0:00:00",
        progress: 0,
        overProgress: 0,
        elapsedPercent: 0,
        remainingPercent: 100,
      };
    }
    const startTime = new Date(currentFast.startTime);
    const now = new Date();
    const targetEndTime = new Date(startTime);
    targetEndTime.setHours(targetEndTime.getHours() + currentFast.targetHours);

    const elapsedMs = now.getTime() - startTime.getTime();
    const remainingMs = Math.max(0, targetEndTime.getTime() - now.getTime());
    const totalDurationMs = currentFast.targetHours * 60 * 60 * 1000;
    const totalProgress = Math.round((elapsedMs / totalDurationMs) * 100);
    const progress = Math.min(100, totalProgress);

    const overProgress = Math.max(0, totalProgress - 100);

    return {
      elapsedTime: formatDuration(elapsedMs),
      remainingTime: formatDuration(remainingMs),
      progress: progress,
      elapsedPercent: progress,
      remainingPercent: 100 - progress,
      overProgress,
    };
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
      if (endTime) {
        clearInterval(intervalId);
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
          overProgress: 0,
        });
        return;
      }

      // For ongoing fast
      const elapsedMs = now.getTime() - startTime.getTime();
      const remainingMs = Math.max(0, targetEndTime.getTime() - now.getTime());
      const totalDurationMs = currentFast.targetHours * 60 * 60 * 1000;
      const totalProgress = Math.round((elapsedMs / totalDurationMs) * 100);

      const progress = Math.min(100, totalProgress);
      const overProgress = Math.max(0, totalProgress - 100);

      setTimeState({
        elapsedTime: formatDuration(elapsedMs),
        remainingTime: formatDuration(remainingMs),
        progress: progress,
        elapsedPercent: progress,
        remainingPercent: 100 - progress,
        overProgress,
      });
    }, 500);

    return () => clearInterval(intervalId);
  }, [currentFast, endTime]);

  const handleUpdateStart = useCallback(() => {
    closeUpateFast();
    void utils.fast.getCurrentFast.invalidate();
  }, [closeUpateFast, utils.fast.getCurrentFast]);

  const handleUpdateEnd = useCallback(() => {
    closeUpdateEnd();
    void utils.fast.getCurrentFast.invalidate();
  }, [closeUpdateEnd, utils.fast.getCurrentFast]);

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
        <CardHeader>
          <CardTitle>Ready to Begin Your Fast</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
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
        </CardContent>
        <CardFooter className="justify-center">
          <Button
            disabled={startFast.isPending}
            onClick={() => {
              startFast.mutate({
                fastId: currentFast.id ?? 0,
                startTime: new Date().toISOString(),
              });
            }}
            className="mt-2"
          >
            Start Fasting Now
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          {isCompleted ? "Fast Completed!" : "You're fasting!"}
        </CardTitle>
        <CardDescription className="flex justify-center">
          <Badge className="px-4">
            {currentFast.fastType || `${currentFast.targetHours}-HOUR FAST`}
          </Badge>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="relative my-4 flex size-64 items-center justify-center md:size-72">
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
              stroke={isCompleted ? "#a6d189" : "#f4b8e4"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="282.7"
              strokeDashoffset={282.7 - (282.7 * timeState.progress) / 100}
              transform="rotate(-90 50 50)"
            />

            {/* overprogress arc */}
            {timeState.overProgress > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={"#ea999c"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="282.7"
                strokeDashoffset={(282.7 * timeState.overProgress) / 100}
                transform="rotate(-90 50 50)"
              />
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            {isCompleted ? (
              <>
                <div className="mb-1 text-xs text-[#b5bfe2]">COMPLETED</div>
                <div className="text-4xl font-semibold text-[#c6d0f5]">
                  {timeState.elapsedTime}
                </div>
                <div className="mt-1 text-xs text-[#b5bfe2]">
                  {timeState.progress}% of Target
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center">
          {isCompleted ? (
            <Button
              onClick={() => {
                // Clear the completed state and completed fast ID
                setIsCompleted(false);
                setEndTime(null);
                setCompletedFastId(null);
                // Invalidate query to fetch fresh data (will now look for active fasts)
                void utils.fast.getCurrentFast.invalidate();
              }}
            >
              Start New Fast
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={endFast.isPending}
              onClick={() => {
                const endTime = new Date();
                endFast.mutate({
                  fastId: currentFast.id ?? 0,
                  endTime: endTime.toISOString(),
                });
                setIsCompleted(true);
                setEndTime(endTime);
                setCompletedFastId(currentFast.id ?? 0);
              }}
            >
              End Fast
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-2 justify-between gap-2 px-2 text-xs text-[#b5bfe2]">
        <div>
          <div className="uppercase">Started fasting</div>
          <div className="mt-1 flex items-center text-[#f9e2af]">
            <span>{formatDateTime(currentFast.startTime)}</span>
            {!isCompleted && (
              <Button variant="link" onClick={openUpdateFast}>
                <Edit className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="uppercase">
            {isCompleted ? "Ended fasting" : "Fast ending"}
          </div>
          <div className="mt-1 flex items-center text-[#c6d0f5]">
            <span>
              {endTime
                ? formatDateTime(endTime.toISOString())
                : currentFast.startTime
                  ? formatDateTime(
                      new Date(
                        new Date(currentFast.startTime).getTime() +
                          currentFast.targetHours * 60 * 60 * 1000,
                      ).toISOString(),
                    )
                  : "Not started"}
            </span>
            {isCompleted && endTime && (
              <Button variant="link" onClick={openUpdateEnd}>
                <Edit className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
      {currentFast.startTime && (
        <UpdateStart
          fastId={currentFast.id ?? 0}
          isOpen={isUpdatefastOpen}
          initialStartTime={new Date(currentFast.startTime)}
          onClose={closeUpateFast}
          onUpdated={handleUpdateStart}
        />
      )}
      {endTime && (
        <UpdateEnd
          fastId={currentFast.id ?? 0}
          isOpen={isUpdateEndOpen}
          initialEndTime={endTime}
          onClose={closeUpdateEnd}
          onUpdated={handleUpdateEnd}
        />
      )}
    </Card>
  );
}
