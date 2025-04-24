"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export default function FastingTracker() {
  const [remainingTime, setRemainingTime] = useState("0:58:52");
  const [elapsedTime, setElapsedTime] = useState("15:01:07");
  const [progress, setProgress] = useState(7);

  // This would normally be connected to a timer logic
  // but for demo purposes we're keeping it static

  return (
    <Card>
      <CardTitle className="px-6">You&apos;re fasting!</CardTitle>

      <CardContent>
        <div className="flex items-center justify-center">
          <Badge>16:8 INTERMITTENT</Badge>
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

        <button className="my-4 w-full rounded-full border border-[#e78284] bg-[#414559] py-3 font-medium text-[#e78284] transition-colors hover:bg-[#51576d]">
          End fast
        </button>

        <div className="mt-2 flex w-full justify-between px-2 text-xs text-[#b5bfe2]">
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
