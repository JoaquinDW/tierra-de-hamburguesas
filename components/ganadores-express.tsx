"use client"

import { useState, useEffect } from "react"
import { obtenerGanadoresExpress } from "@/lib/database"
import type { GanadorExpress } from "@/lib/supabase"
import { Trophy } from "lucide-react"
import { CONTENIDO_DEFAULTS, type ContenidoSitio } from "@/lib/contenido"

interface GanadoresExpressProps {
  sorteoId?: string
  contenido?: ContenidoSitio
}

export function GanadoresExpress({
  sorteoId,
  contenido = CONTENIDO_DEFAULTS,
}: GanadoresExpressProps) {
  const [ganadores, setGanadores] = useState<GanadorExpress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarGanadores()
  }, [sorteoId])

  const cargarGanadores = async () => {
    try {
      const data = await obtenerGanadoresExpress(sorteoId)
      setGanadores(data)
    } catch (error) {
      console.error("Error cargando ganadores express:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || ganadores.length === 0) {
    return null
  }

  return (
    <section className="tdh-grill py-14 border-t border-[rgba(255,138,51,0.12)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-9">
          <span className="sticker sticker-ketchup text-[11px] px-3 py-1 mb-4">
            ⚡ {contenido.express_kicker}
          </span>
          <h2 className="font-display text-5xl lg:text-6xl tracking-wide text-[#fdf1e2] uppercase flex items-center justify-center gap-3 mt-2">
            <Trophy className="w-8 h-8 text-[#ff8a33]" />
            {contenido.express_titulo}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {ganadores.map((ganador, index) => (
            <div
              key={ganador.id}
              className="poster-sm px-4 py-3 md:px-5 md:py-4 flex items-center justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-10px_rgba(255,106,19,0.6)]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Número */}
              <div className="bg-gradient-to-b from-[#ff8a33] to-[#ff6a13] border border-[rgba(255,200,140,0.5)] rounded-lg px-3 py-2 flex-shrink-0 min-w-[60px] text-center shadow-[0_0_16px_-4px_rgba(255,106,19,0.7)]">
                <p className="text-[#1a0e03] font-mono font-bold text-base md:text-xl">
                  {ganador.numero_ganador}
                </p>
              </div>

              {/* Premio */}
              <div className="flex-1 text-center">
                <p className="font-display text-lg md:text-xl uppercase tracking-wide text-[#fdf1e2]">
                  {ganador.premio_monto}
                </p>
              </div>

              {/* Nombre */}
              <div className="flex items-center gap-2 flex-shrink-0 max-w-[160px]">
                <p className="text-[#fdf1e2]/65 text-sm font-bold truncate">
                  {ganador.nombre_ganador || "Anónimo"}
                </p>
                <Trophy className="w-4 h-4 text-[#ff8a33] flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
