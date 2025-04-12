"use client"

import { useState } from "react"
import { Clock, BarChart2, History, BookOpen, Edit } from "lucide-react"

export default function FastingTracker() {
  const [remainingTime, setRemainingTime] = useState("0:58:52")
  const [elapsedTime, setElapsedTime] = useState("15:01:07")
  const [progress, setProgress] = useState(7)

  // This would normally be connected to a timer logic
  // but for demo purposes we're keeping it static

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md bg-[#414559] rounded-3xl shadow-sm overflow-hidden flex flex-col items-center px-6 pt-10 pb-4">
        <div className="text-center mb-1">
          <h1 className="text-[#c6d0f5] text-xl font-semibold">You&apos;re fasting!</h1>
          <p className="text-[#b5bfe2] text-sm">125,671 people are fasting right now</p>
        </div>

        <div className="bg-[#51576d] text-[#c6d0f5] text-xs font-medium px-4 py-1.5 rounded-full my-4">
          16:8 INTERMITTENT
        </div>

        <div className="relative flex items-center justify-center w-64 h-64 my-4">
          {/* Progress Circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#737994" strokeWidth="10" />

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
            <div className="text-[#b5bfe2] text-xs mb-1">REMAINING (7%)</div>
            <div className="text-[#c6d0f5] text-4xl font-semibold">{remainingTime}</div>
            <div className="text-[#b5bfe2] text-xs mt-1">Elapsed Time (93%)</div>
            <div className="text-[#b5bfe2] text-sm">{elapsedTime}</div>
          </div>
        </div>

        <button className="w-full bg-[#414559] text-[#e78284] border border-[#e78284] rounded-full py-3 font-medium my-4 hover:bg-[#51576d] transition-colors">
          End fast
        </button>

        <div className="w-full flex justify-between text-xs text-[#b5bfe2] mt-2 px-2">
          <div>
            <div className="uppercase">Started fasting</div>
            <div className="flex items-center text-[#f9e2af] mt-1">
              <span>Yesterday, 10:22 PM</span>
              <Edit className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div className="text-right">
            <div className="uppercase">Fast ending</div>
            <div className="text-[#c6d0f5] mt-1">Today, 2:22 PM</div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation       
      <div className="fixed bottom-0 w-full max-w-md bg-[#414559] border-t border-[#51576d] flex justify-around py-3">
        <div className="flex flex-col items-center text-[#f4b8e4]">
          <Clock className="w-5 h-5" />
          <span className="text-xs mt-1">Timer</span>
        </div>
        <div className="flex flex-col items-center text-[#b5bfe2]">
          <BarChart2 className="w-5 h-5" />
          <span className="text-xs mt-1">Fasts</span>
        </div>
        <div className="flex flex-col items-center text-[#b5bfe2]">
          <History className="w-5 h-5" />
          <span className="text-xs mt-1">History</span>
        </div>
        <div className="flex flex-col items-center text-[#b5bfe2]">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs mt-1">Learn</span>
        </div>
      </div>
        */}
    </div>
  )
}
