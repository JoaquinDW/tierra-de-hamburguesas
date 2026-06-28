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
    <section className="tdh-grill py-14 border-t-[3px] border-[#120c08]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-9">
          <span className="sticker sticker-ketchup text-[11px] px-3 py-1 mb-4">
            ⚡ {contenido.express_kicker}
          </span>
          <h2 className="font-display text-5xl lg:text-6xl tracking-wide text-[#fff3df] uppercase flex items-center justify-center gap-3 mt-2">
            <Trophy className="w-8 h-8 text-[#f4b400]" />
            {contenido.express_titulo}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {ganadores.map((ganador, index) => (
            <div
              key={ganador.id}
              className="poster-sm poster-cream px-4 py-3 md:px-5 md:py-4 flex items-center justify-between gap-3 transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Número */}
              <div className="bg-[#ff6a13] border-[2.5px] border-[#120c08] rounded-lg px-3 py-2 flex-shrink-0 min-w-[60px] text-center">
                <p className="text-[#1a0e03] font-mono font-bold text-base md:text-xl">
                  {ganador.numero_ganador}
                </p>
              </div>

              {/* Premio */}
              <div className="flex-1 text-center">
                <p className="font-display text-lg md:text-xl uppercase tracking-wide text-[#23170c]">
                  {ganador.premio_monto}
                </p>
              </div>

              {/* Nombre */}
              <div className="flex items-center gap-2 flex-shrink-0 max-w-[160px]">
                <p className="text-[#23170c]/70 text-sm font-bold truncate">
                  {ganador.nombre_ganador || "Anónimo"}
                </p>
                <Trophy className="w-4 h-4 text-[#f4b400] flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
