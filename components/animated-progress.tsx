"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps {
  value: number
  logoSrc?: string
  className?: string
}

export function AnimatedProgress({
  value,
  logoSrc,
  className,
}: AnimatedProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn("relative w-full", className)}>
      {/* py-3 creates vertical room for the logo to protrude above/below the track */}
      <div className="relative py-3">
        {/* Track */}
        <div className="relative h-6 bg-[#0f0a07] rounded-full border border-[rgba(255,138,51,0.2)] overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${clamped}%`,
              background: "linear-gradient(to right, #c24a00, #ff6a13, #ffb347)",
              boxShadow: "0 0 18px 1px rgba(255,106,19,0.65)",
            }}
          />
        </div>

        {/* Logo centered on the bar at the fill endpoint */}
        {logoSrc && (
          <div
            className="absolute top-1/2 z-10 transition-all duration-1000 ease-out"
            style={{
              left: `${clamped}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#ffb347] shadow-[0_0_16px_2px_rgba(255,106,19,0.75)]">
              <Image
                src={logoSrc}
                alt="logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
