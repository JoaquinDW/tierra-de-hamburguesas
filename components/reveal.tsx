"use client"

import { useEffect, useRef, useState } from "react"

interface RevealProps {
  children: React.ReactNode
  /** Retardo de entrada en ms (para escalonar varios elementos). */
  delay?: number
  /** Etiqueta del elemento contenedor. Por defecto `div`. */
  as?: "div" | "section"
  className?: string
}

/**
 * Envuelve contenido para que aparezca con un fade + slide sutil
 * cuando entra en el viewport. Se revela una sola vez.
 * Respeta `prefers-reduced-motion` vía la clase `.reveal` en globals.css.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Si IntersectionObserver no está disponible, mostrar directo.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
