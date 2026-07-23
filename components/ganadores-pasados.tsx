"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GanadorPasado } from "@/lib/supabase"
import { obtenerGanadoresPasados } from "@/lib/database"
import { CONTENIDO_DEFAULTS, type ContenidoSitio } from "@/lib/contenido"

// Cada slide del carrusel representa la imagen de un ganador.
interface Slide {
  ganadorId: string
  nombre: string
  imagen: string | null
}

interface GanadorSlideProps {
  slide: Slide
}

function GanadorSlide({ slide }: GanadorSlideProps) {
  return (
    <Card className="poster poster-cream overflow-hidden h-full !rounded-2xl">
      <CardContent className="p-0 h-full">
        <div className="grid md:grid-cols-2 gap-0 h-full">
          {/* Columna de imagen */}
          <div className="relative bg-[#0f0a07] aspect-square md:aspect-auto md:min-h-[480px] border-b md:border-b-0 md:border-r border-[rgba(255,138,51,0.18)]">
            {slide.imagen ? (
              <div className="absolute inset-0 flex items-center justify-center p-2 md:p-3">
                <img
                  src={slide.imagen}
                  alt={slide.nombre}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 min-h-[300px]">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ff8a33] to-[#ff6a13] flex items-center justify-center border border-[rgba(255,200,140,0.5)] shadow-[0_0_34px_-6px_rgba(255,106,19,0.8)] animate-bob">
                  <Trophy className="h-12 w-12 text-[#1a0e03]" />
                </div>
              </div>
            )}
          </div>

          {/* Columna de información */}
          <div className="p-8 md:p-10 flex flex-col justify-center space-y-6">
            <span className="sticker text-[10px] px-3 py-1 w-fit">
              <Trophy className="h-3 w-3" />
              Ganador
            </span>

            <div>
              <h3 className="font-display text-4xl md:text-5xl tracking-wide uppercase text-[#fdf1e2] mb-3 leading-[0.95]">
                {slide.nombre}
              </h3>
              <div className="h-1 w-16 bg-gradient-to-r from-[#ff8a33] to-[#ff6a13] rounded-full shadow-[0_0_12px_rgba(255,106,19,0.7)]"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function GanadoresPasados({
  contenido = CONTENIDO_DEFAULTS,
}: {
  contenido?: ContenidoSitio
}) {
  const [ganadores, setGanadores] = useState<GanadorPasado[]>([])
  const [loading, setLoading] = useState(true)
  const [slideActual, setSlideActual] = useState(0)
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    cargarGanadores()
  }, [])

  // Aplana cada ganador (con sus imágenes) en slides individuales del carrusel.
  const slides = useMemo<Slide[]>(() => {
    return ganadores.flatMap<Slide>((ganador) => {
      const imagenes = [
        ganador.imagen_1_url,
        ganador.imagen_2_url,
        ganador.imagen_3_url,
      ].filter(Boolean) as string[]

      if (imagenes.length === 0) {
        return [{ ganadorId: ganador.id, nombre: ganador.nombre_ganador, imagen: null }]
      }

      return imagenes.map((imagen) => ({
        ganadorId: ganador.id,
        nombre: ganador.nombre_ganador,
        imagen,
      }))
    })
  }, [ganadores])

  const totalSlides = slides.length

  // Mantiene el índice dentro de rango si cambia la cantidad de slides.
  useEffect(() => {
    if (slideActual >= totalSlides) setSlideActual(0)
  }, [totalSlides, slideActual])

  // Auto-avance del carrusel (se detiene al pasar el mouse por encima).
  useEffect(() => {
    if (pausado || totalSlides <= 1) return
    const id = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % totalSlides)
    }, 4500)
    return () => clearInterval(id)
  }, [pausado, totalSlides])

  const siguienteSlide = () => setSlideActual((prev) => (prev + 1) % totalSlides)
  const anteriorSlide = () =>
    setSlideActual((prev) => (prev - 1 + totalSlides) % totalSlides)

  const cargarGanadores = async () => {
    try {
      const data = await obtenerGanadoresPasados()
      setGanadores(data)
    } catch (error) {
      console.error("Error cargando ganadores:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    const [year, month, day] = fecha.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  }

  if (loading) {
    return (
      <section className="tdh-grill py-20 border-t border-[rgba(255,138,51,0.12)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ff8a33] to-[#ff6a13] rounded-2xl mb-4 border border-[rgba(255,200,140,0.5)] shadow-[0_0_30px_-6px_rgba(255,106,19,0.8)]">
              <Trophy className="h-7 w-7 text-[#1a0e03]" />
            </div>
            <h2 className="font-display text-5xl tracking-wide uppercase text-[#fdf1e2] mb-4">
              {contenido.pasados_titulo}
            </h2>
            <p className="text-[#fdf1e2]/50 text-sm">Cargando…</p>
          </div>
        </div>
      </section>
    )
  }

  if (ganadores.length === 0) {
    return null
  }

  return (
    <>
      {/* CTA de contacto */}
      <div className="tdh-grill py-10 border-t border-[rgba(255,138,51,0.12)] text-center">
        <p className="text-[#fdf1e2]/70 text-sm mb-4 font-bold uppercase tracking-wide">
          {contenido.pasados_cta_texto}
        </p>
        <a
          href={contenido.whatsapp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-chunky inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm"
        >
          {contenido.pasados_cta_boton}
        </a>
      </div>

      <section
        id="ganadores"
        className="tdh-paper py-16 border-t border-[rgba(255,138,51,0.14)]"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="sticker sticker-ketchup text-[11px] px-3 py-1 mb-4">
              🏆 {contenido.pasados_kicker}
            </span>
            <h2 className="font-display text-5xl lg:text-6xl tracking-wide uppercase text-[#fdf1e2] mb-3 mt-2">
              {contenido.pasados_titulo}
            </h2>
            <p className="text-[#fdf1e2]/55 text-sm font-medium max-w-md mx-auto">
              {contenido.pasados_descripcion}
            </p>
          </div>

          {/* Carrusel único auto-rotativo con todos los ganadores */}
          <div
            className="relative max-w-5xl mx-auto"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            <div className="overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${slideActual * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={`${slide.ganadorId}-${index}`}
                    className="w-full flex-shrink-0"
                  >
                    <GanadorSlide slide={slide} />
                  </div>
                ))}
              </div>
            </div>

            {totalSlides > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#17110d]/90 hover:bg-[#201812] text-[#fdf1e2] border border-[rgba(255,138,51,0.3)] shadow-[0_0_18px_-6px_rgba(255,106,19,0.7)] backdrop-blur rounded-xl w-11 h-11 z-10 active:scale-95"
                  onClick={anteriorSlide}
                  aria-label="Ganador anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#17110d]/90 hover:bg-[#201812] text-[#fdf1e2] border border-[rgba(255,138,51,0.3)] shadow-[0_0_18px_-6px_rgba(255,106,19,0.7)] backdrop-blur rounded-xl w-11 h-11 z-10 active:scale-95"
                  onClick={siguienteSlide}
                  aria-label="Ganador siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <div className="flex justify-center gap-1.5 mt-6">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSlideActual(index)}
                      aria-label={`Ir al ganador ${index + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        index === slideActual
                          ? "bg-[#ff6a13] w-7 shadow-[0_0_10px_rgba(255,106,19,0.8)]"
                          : "bg-[#fdf1e2]/20 hover:bg-[#fdf1e2]/40 w-2"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
