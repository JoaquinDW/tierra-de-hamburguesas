"use client"

import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Send,
  MessageCircle,
  Music2,
  Globe,
  type LucideIcon,
} from "lucide-react"
import type { ContenidoSitio, TipoRed } from "@/lib/contenido"

const ICONOS: Record<TipoRed, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  youtube: Youtube,
  x: Twitter,
  whatsapp: MessageCircle,
  telegram: Send,
  web: Globe,
}

export function RedesSociales({ contenido }: { contenido: ContenidoSitio }) {
  const redes = (contenido.redes ?? []).filter((red) => red.url.trim())

  if (redes.length === 0) return null

  return (
    <section className="tdh-grill py-16 border-t border-[rgba(255,138,51,0.12)]">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <span className="sticker sticker-orange text-[11px] px-3 py-1 mb-4">
          📣 {contenido.redes_kicker}
        </span>
        <h2 className="font-display text-5xl lg:text-6xl tracking-wide uppercase text-[#fdf1e2] mb-3 mt-2">
          {contenido.redes_titulo}
        </h2>
        {contenido.redes_descripcion && (
          <p className="text-[#fdf1e2]/55 text-sm font-medium max-w-md mx-auto">
            {contenido.redes_descripcion}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {redes.map((red, index) => {
            const Icono = ICONOS[red.tipo] ?? Globe
            return (
              <a
                key={`${red.url}-${index}`}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="poster-sm inline-flex items-center gap-2.5 px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-[#fdf1e2] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,138,51,0.5)] hover:shadow-[0_0_26px_-8px_rgba(255,106,19,0.7)]"
              >
                <Icono className="w-4 h-4 text-[#ff8a33]" />
                {red.etiqueta || red.url}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
