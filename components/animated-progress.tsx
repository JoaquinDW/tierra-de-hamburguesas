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
        <div className="relative h-6 bg-gray-800 rounded-full border border-gray-700/60 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${clamped}%`,
              background: "linear-gradient(to right, #d4af37, #06b6d4)",
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
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/90 shadow-lg shadow-black/60">
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
