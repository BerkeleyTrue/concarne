"use client";

import { useState } from "react";
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
  const { data: currentFast = initFast } = api.fast.getCurrentFast.useQuery({
    userId: "1",
  });
  const { mutate: startFast } = api.fast.startFast.useMutation();

  const [remainingTime, setRemainingTime] = useState("0:58:52");
  const [elapsedTime, setElapsedTime] = useState("15:01:07");
  const [progress, setProgress] = useState(7);

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
                startFast({
                  userId: "1",
                  duration: fast.duration,
                  startTime: new Date(),
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

  return (
    <Card>
      <CardTitle>You&apos;re fasting!</CardTitle>

      <CardContent>
        <div className="flex items-center justify-center">
          <Badge className="px-4">16:8 INTERMITTENT</Badge>
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
              strokeDashoffset={282.7 - (282.7 * progress) / 100}
              transform="rotate(-90 50 50)"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="mb-1 text-xs text-[#b5bfe2]">REMAINING (7%)</div>
            <div className="text-4xl font-semibold text-[#c6d0f5]">
              {remainingTime}
            </div>
            <div className="mt-1 text-xs text-[#b5bfe2]">
              Elapsed Time (93%)
            </div>
            <div className="text-sm text-[#b5bfe2]">{elapsedTime}</div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center">
          <Button variant="outline">End fast</Button>
        </div>

        <div className="mt-2 flex w-full justify-between gap-2 px-2 text-xs text-[#b5bfe2]">
          <div>
            <div className="uppercase">Started fasting</div>
            <div className="mt-1 flex items-center text-[#f9e2af]">
              <span>Yesterday, 10:22 PM</span>
              <Edit className="ml-1 h-3 w-3" />
            </div>
          </div>

          <div className="text-right">
            <div className="uppercase">Fast ending</div>
            <div className="mt-1 text-[#c6d0f5]">Today, 2:22 PM</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
