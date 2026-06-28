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
    <section className="tdh-grill py-16 border-t-[3px] border-[#120c08]">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <span className="sticker sticker-orange text-[11px] px-3 py-1 mb-4">
          📣 {contenido.redes_kicker}
        </span>
        <h2 className="font-display text-5xl lg:text-6xl tracking-wide uppercase text-[#fff3df] mb-3 mt-2">
          {contenido.redes_titulo}
        </h2>
        {contenido.redes_descripcion && (
          <p className="text-[#fff3df]/55 text-sm font-medium max-w-md mx-auto">
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
                className="poster-sm poster-cream inline-flex items-center gap-2.5 px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-[#23170c] transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <Icono className="w-4 h-4 text-[#c1351d]" />
                {red.etiqueta || red.url}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
