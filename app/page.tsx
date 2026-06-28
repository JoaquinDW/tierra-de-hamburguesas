"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Clock, Trophy, Flame, Download } from "lucide-react"
import Link from "next/link"
import { CompraModalNuevo } from "@/components/compra-modal-nuevo"
import { TransferenciaExitoModal } from "@/components/transferencia-exito-modal"
import { Header } from "@/components/header"
import { GanadoresPasados } from "@/components/ganadores-pasados"
import { GanadoresExpress } from "@/components/ganadores-express"
import { RedesSociales } from "@/components/redes-sociales"
import dynamic from "next/dynamic"

const IphoneCarousel = dynamic(() => import("@/components/iphone-carousel"), {
  ssr: false,
})
import {
  obtenerSorteoActivo,
  obtenerEstadisticasSorteo,
  generarNumerosUnicos,
  obtenerPremiosSecundarios,
} from "@/lib/database"
import type { Sorteo } from "@/lib/supabase"
import type { PremiosSecundarios } from "@/lib/database"
import {
  obtenerContenido,
  conPlaceholders,
  CONTENIDO_DEFAULTS,
  type ContenidoSitio,
} from "@/lib/contenido"
import { AnimatedProgress } from "@/components/animated-progress"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LandingPage() {
  const [sorteo, setSorteo] = useState<Sorteo | null>(null)
  const [chancesVendidas, setChancesVendidas] = useState(0)
  const [totalCompradores, setTotalCompradores] = useState(0)
  const [totalRecaudado, setTotalRecaudado] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [transferenciaExitoAbierta, setTransferenciaExitoAbierta] =
    useState(false)
  const [packSeleccionado, setPackSeleccionado] = useState<{
    chances: number
    precio: number
    sorteoId?: string
  } | null>(null)
  const [animacionVisible, setAnimacionVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [consultaEmail, setConsultaEmail] = useState("")
  const [consultaLoading, setConsultaLoading] = useState(false)
  const [consultaResultados, setConsultaResultados] = useState<Array<{
    id: string
    nombre: string
    numeros_asignados: number[]
    cantidad_chances: number
    sorteo_nombre: string
    created_at: string
  }> | null>(null)
  const [consultaError, setConsultaError] = useState<string | null>(null)
  const [premiosSecundarios, setPremiosSecundarios] =
    useState<PremiosSecundarios | null>(null)
  const [contenido, setContenido] = useState<ContenidoSitio>(CONTENIDO_DEFAULTS)
  const { toast } = useToast()

  const getPacks = () => {
    if (!sorteo) return []

    const allPacks = [
      {
        chances: sorteo.cantidad_pack_1 || 10,
        precio: sorteo.precio_6_chances || 21000,
        color: "from-amber-400 to-orange-600",
        descripcion: sorteo.descripcion_pack_1 || "Honda Wave 2025",
        visible: sorteo.pack_1_visible ?? true,
      },
      {
        chances: sorteo.cantidad_pack_2 || 25,
        precio: sorteo.precio_12_chances || 42000,
        color: "from-orange-400 to-red-500",
        popular: true,
        descripcion:
          sorteo.descripcion_pack_2 ||
          "Honda Wave 2025 + 5 chances en pre-venta New Titan 2018",
        visible: sorteo.pack_2_visible ?? true,
      },
      {
        chances: sorteo.cantidad_pack_3 || 50,
        precio: sorteo.precio_24_chances || 84000,
        color: "from-yellow-400 to-amber-600",
        descripcion:
          sorteo.descripcion_pack_3 ||
          "Honda Wave 2025 + 5 chances pre-venta New Titan 2018",
        visible: sorteo.pack_3_visible ?? true,
      },
      {
        chances: sorteo.cantidad_pack_4 || 0,
        precio: sorteo.precio_pack_4 || 0,
        color: "from-orange-500 to-rose-600",
        descripcion: sorteo.descripcion_pack_4 || "",
        visible: sorteo.pack_4_visible ?? false,
      },
      {
        chances: sorteo.cantidad_pack_5 || 0,
        precio: sorteo.precio_pack_5 || 0,
        color: "from-amber-500 to-orange-700",
        descripcion: sorteo.descripcion_pack_5 || "",
        visible: sorteo.pack_5_visible ?? false,
      },
    ]

    return allPacks.filter((pack) => pack.visible)
  }

  useEffect(() => {
    cargarDatos()
    const timer = setTimeout(() => setAnimacionVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const cargarDatos = async () => {
    try {
      const [sorteoActivo, premios, contenidoSitio] = await Promise.all([
        obtenerSorteoActivo(),
        obtenerPremiosSecundarios(),
        obtenerContenido(),
      ])
      setPremiosSecundarios(premios)
      setContenido(contenidoSitio)
      if (sorteoActivo) {
        setSorteo(sorteoActivo)
        const estadisticas = await obtenerEstadisticasSorteo(sorteoActivo.id)
        setChancesVendidas(estadisticas.chancesVendidas)
        setTotalCompradores(estadisticas.totalCompradores)
        setTotalRecaudado(estadisticas.totalRecaudado)
      } else {
        console.error("No se pudo cargar el sorteo")
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const procesarCompra = async (
    nombre: string,
    email: string,
    telefono: string,
  ) => {
    if (!packSeleccionado || !sorteo) return

    try {
      const numerosDisponibles = await generarNumerosUnicos(
        sorteo.id,
        packSeleccionado.chances,
      )

      if (numerosDisponibles.length < packSeleccionado.chances) {
        toast({
          variant: "destructive",
          title: "Error en la compra",
          description: "No hay suficientes números disponibles",
        })
        return
      }

      const datosCompra = {
        sorteoId: sorteo.id,
        nombre,
        email,
        telefono,
        chances: packSeleccionado.chances,
        precio: packSeleccionado.precio,
        timestamp: Date.now(),
      }

      localStorage.setItem(
        "sorteo_compra_pendiente",
        JSON.stringify(datosCompra),
      )

      toast({
        title: "Preparando pago...",
        description: "Te redirigiremos a MercadoPago en un momento",
      })

      const response = await fetch("/api/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCompra),
      })

      if (!response.ok) throw new Error("Error creando preferencia de pago")

      const { preferenceId, paymentUrl } = await response.json()

      const datosActualizados = { ...datosCompra, preferenceId }
      localStorage.setItem(
        "sorteo_compra_pendiente",
        JSON.stringify(datosActualizados),
      )

      window.location.href = paymentUrl
    } catch (error) {
      console.error("Error procesando compra:", error)
      toast({
        variant: "destructive",
        title: "Error en la compra",
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
      })
    }

    setModalAbierto(false)
    setPackSeleccionado(null)
  }

  const procesarTransferencia = async (data: {
    nombre: string
    email: string
    contacto: string
    comprobanteFile: File
  }) => {
    if (!packSeleccionado || !sorteo) return

    try {
      const esWhatsApp = /^[\d\s+()-]+$/.test(data.contacto.trim())

      const formData = new FormData()
      formData.append("sorteoId", sorteo.id)
      formData.append("nombre", data.nombre)
      if (data.email) formData.append("email", data.email)
      if (esWhatsApp) {
        formData.append("telefono", data.contacto)
      } else {
        formData.append("instagram_username", data.contacto.replace("@", ""))
      }
      formData.append("cantidadChances", packSeleccionado.chances.toString())
      formData.append("comprobante", data.comprobanteFile)

      toast({
        title: "Procesando...",
        description: "Estamos registrando tu transferencia",
      })

      const response = await fetch("/api/transferencia", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Error procesando transferencia")

      setTransferenciaExitoAbierta(true)

      await cargarDatos()
    } catch (error) {
      console.error("Error procesando transferencia:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Ocurrió un error procesando tu transferencia. Intenta nuevamente.",
      })
    }

    setModalAbierto(false)
    setPackSeleccionado(null)
  }

  const TOTAL_CHANCES = sorteo?.total_chances || 9999
  const porcentajeVendido = (chancesVendidas / TOTAL_CHANCES) * 100
  const sorteoCompleto =
    sorteo?.estado === "completo" ||
    sorteo?.estado === "sorteado" ||
    chancesVendidas >= TOTAL_CHANCES

  const PACKS = getPacks()

  const handleCompra = (pack: (typeof PACKS)[0]) => {
    if (sorteoCompleto) return
    setPackSeleccionado({ ...pack, sorteoId: sorteo?.id })
    setModalAbierto(true)
  }

  const consultarMisNumeros = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailTrimmed = consultaEmail.trim()
    if (!emailTrimmed) return
    setConsultaLoading(true)
    setConsultaResultados(null)
    setConsultaError(null)
    try {
      const response = await fetch(
        `/api/mis-numeros?email=${encodeURIComponent(emailTrimmed)}`,
      )
      const data = await response.json()
      if (!response.ok) {
        setConsultaError(data.error || "Ocurrió un error. Intenta nuevamente.")
        return
      }
      setConsultaResultados(data.participaciones)
    } catch {
      setConsultaError(
        "No se pudo conectar. Revisá tu conexión e intentá de nuevo.",
      )
    } finally {
      setConsultaLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen tdh-grill flex items-center justify-center">
        <div className="text-center space-y-4">
          <Flame className="w-12 h-12 text-[#ff6a13] mx-auto animate-bob" />
          <p className="text-[#fff3df]/60 text-sm font-extrabold tracking-[0.25em] uppercase">
            Calentando la parrilla…
          </p>
        </div>
      </div>
    )
  }

  if (!sorteo) {
    return (
      <div className="min-h-screen tdh-grill flex flex-col text-[#fff3df]">
        <Header marca={contenido.marca} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-[3px] border-[#120c08] bg-[#fff3df] shadow-[5px_5px_0_#120c08] mx-auto animate-bob">
              <img
                src="/tdh-logo.jpg"
                alt={contenido.marca}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-5xl tracking-wide uppercase text-[#fff3df]">
                {contenido.proximamente_titulo}
              </h2>
              <p className="text-[#fff3df]/60 text-sm font-medium">
                {contenido.proximamente_descripcion}
              </p>
            </div>
            <Link
              href={contenido.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-chunky px-6 py-3 rounded-xl text-sm"
            >
              {contenido.proximamente_boton}
            </Link>
          </div>
        </div>
        <RedesSociales contenido={contenido} />
        <footer className="bg-[#120c08] border-t-[3px] border-[#ff6a13] py-6">
          <div className="container mx-auto px-4 text-center text-[#fff3df]/40 text-xs tracking-wide">
            <p>{contenido.footer_copyright}</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen tdh-grill text-[#fff3df]">
      <Header marca={contenido.marca} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Texto gigante de fondo (cartel) — cinta que se desliza */}
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-x-0 top-1 overflow-hidden"
        >
          <div className="flex w-max animate-marquee">
            <span className="font-display text-[22vw] leading-none text-stroke opacity-[0.06] whitespace-nowrap pr-[0.25em]">
              TDH · TDH · TDH · TDH ·&nbsp;
            </span>
            <span className="font-display text-[22vw] leading-none text-stroke opacity-[0.06] whitespace-nowrap pr-[0.25em]">
              TDH · TDH · TDH · TDH ·&nbsp;
            </span>
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-10 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Carousel a la izquierda */}
            <div
              className={`relative transition-all duration-700 ${
                animacionVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <div className="relative poster poster-cream tdh-stripes p-3 sm:p-4">
                <div className="overflow-hidden rounded-lg border-[3px] border-[#120c08]">
                  <IphoneCarousel />
                </div>

                {/* Sticker flotante */}
                <div className="sticker sticker-wiggle absolute -top-4 -right-3 lg:-right-4 text-[11px] px-3.5 py-1.5 z-30">
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  <span>{contenido.hero_badge}</span>
                </div>
              </div>

              {/* Título bajo el carousel */}
              <div className="text-center mt-8">
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide text-[#ff8a33] uppercase leading-[0.95] drop-shadow-[3px_3px_0_#120c08]">
                  {conPlaceholders(contenido.hero_titulo, {
                    premio: sorteo.titulo_remera || "Remera Exclusiva",
                  })}
                </h2>
              </div>

              {/* Progress Bar — mobile only (appears right below the photo) */}
              {sorteo?.estado !== "sorteado" && (
                <div className="lg:hidden mt-6 poster poster-ink p-5 space-y-4">
                  <span className="block text-xs font-extrabold text-[#ff8a33] uppercase tracking-[0.2em]">
                    🔥 {contenido.hero_chances_label}
                  </span>
                  <AnimatedProgress
                    value={porcentajeVendido}
                    logoSrc="/tdh-logo.jpg"
                  />
                  <div className="flex items-baseline justify-center gap-2 pt-1">
                    <span className="font-display text-4xl tracking-wide text-[#ff8a33]">
                      {porcentajeVendido.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#fff3df]/50 uppercase tracking-[0.2em]">
                      {contenido.hero_completado_label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Contenido a la derecha */}
            <div
              className={`flex flex-col gap-6 transition-all duration-700 delay-200 ${
                animacionVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {sorteo?.estado !== "sorteado" && (
                <div className="order-1 lg:order-1">
                  <span className="sticker sticker-orange text-[11px] px-3 py-1 mb-4">
                    🍔 {contenido.premios_kicker}
                  </span>
                  <p className="font-display text-4xl lg:text-5xl text-[#fff3df] uppercase leading-[0.95] tracking-wide">
                    {contenido.hero_subtitulo}
                  </p>
                </div>
              )}

              {/* Progress Bar / Evento finalizado — desktop only (mobile version is in left column) */}
              {sorteo?.estado === "sorteado" ? (
                <div className="order-3 lg:order-2 poster poster-cream p-6 text-center">
                  <p className="font-display text-2xl tracking-wide uppercase text-[#23170c]">
                    Evento finalizado
                  </p>
                </div>
              ) : (
                <div className="hidden lg:block order-3 lg:order-2 space-y-4 poster poster-ink p-6">
                  <span className="block text-xs font-extrabold text-[#ff8a33] uppercase tracking-[0.2em]">
                    🔥 {contenido.hero_chances_label}
                  </span>
                  <AnimatedProgress
                    value={porcentajeVendido}
                    logoSrc="/tdh-logo.jpg"
                  />
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-display text-4xl tracking-wide text-[#ff8a33]">
                      {porcentajeVendido.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#fff3df]/50 uppercase tracking-[0.2em]">
                      {contenido.hero_completado_label}
                    </span>
                  </div>
                </div>
              )}

              {/* Estados: completo / sorteado / cerrado */}
              {sorteoCompleto && (
                <div className="order-4 lg:order-3 space-y-4">
                  {sorteo?.estado === "completo" && (
                    <div
                      className="poster p-5"
                      style={{ background: "#f4b400", color: "#221400" }}
                    >
                      <h3 className="font-display text-2xl uppercase tracking-wide mb-1 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {contenido.hero_completo_titulo}
                      </h3>
                      <p className="text-sm font-medium">
                        {contenido.hero_completo_descripcion}
                      </p>
                      {sorteo.fecha_sorteo_realizado && (
                        <p className="text-xs opacity-70 mt-1">
                          Prendas completadas el{" "}
                          {new Date(
                            sorteo.fecha_sorteo_realizado,
                          ).toLocaleDateString("es-AR")}
                        </p>
                      )}
                    </div>
                  )}

                  {sorteo?.estado === "sorteado" && (
                    <div className="poster poster-cream p-5">
                      <h3 className="font-display text-2xl uppercase tracking-wide mb-2 flex items-center gap-2 text-[#23170c]">
                        <Trophy className="w-5 h-5 text-[#ff6a13]" />
                        {contenido.hero_sorteado_titulo}
                      </h3>
                      {sorteo.numero_ganador && (
                        <div className="space-y-1.5 text-[#23170c]">
                          {sorteo.ganador_nombre && (
                            <p className="text-sm">
                              Ganador:{" "}
                              <span className="font-bold text-[#c1351d]">
                                {sorteo.ganador_nombre}
                              </span>
                            </p>
                          )}
                          <p className="text-sm">
                            Número Ganador:{" "}
                            <span className="font-mono font-bold text-[#c1351d] text-lg">
                              {sorteo.numero_ganador}
                            </span>
                          </p>
                          <p className="text-xs opacity-70">
                            Según la Quiniela de Buenos Aires del{" "}
                            {sorteo.updated_at &&
                              new Date(sorteo.updated_at).toLocaleDateString(
                                "es-AR",
                              )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(sorteo?.estado === "cerrado" ||
                    (sorteo?.estado &&
                      !sorteo.estado.match(/completo|sorteado/))) && (
                    <div className="poster poster-orange p-5">
                      <h3 className="font-display text-2xl uppercase tracking-wide mb-1">
                        {contenido.hero_cerrado_titulo}
                      </h3>
                      <p className="text-sm font-medium text-[#1a0e03]/80">
                        {contenido.hero_cerrado_descripcion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pack cards — estilo combo de menú */}
              {!sorteoCompleto && (
                <div className="order-2 lg:order-4 space-y-4">
                  {PACKS.map((pack, index) => {
                    return (
                      <div
                        key={pack.chances}
                        className={`relative transition-all duration-500 ${
                          animacionVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-6"
                        }`}
                        style={{ transitionDelay: `${(index + 3) * 150}ms` }}
                      >
                        {pack.popular && (
                          <span className="sticker sticker-ketchup absolute -top-3 left-4 z-20 text-[10px] px-2.5 py-1">
                            ⭐ {contenido.packs_popular_label}
                          </span>
                        )}
                        <div
                          className={`poster tdh-stripes p-4 sm:p-5 transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 ${
                            pack.popular ? "poster-orange" : "poster-cream"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Combo nº */}
                            <div className="hidden sm:flex shrink-0 w-12 h-12 items-center justify-center rounded-lg border-[2.5px] border-[#120c08] bg-[#1d1510] text-[#ff8a33] font-display text-2xl shadow-[2px_2px_0_#120c08]">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-display text-lg sm:text-xl uppercase line-clamp-2 leading-[1.05] text-[#23170c]">
                                {pack.descripcion ||
                                  `Combo ${pack.chances} chances`}
                              </div>
                              <div className="text-[#23170c]/60 text-xs font-bold uppercase tracking-wide mt-1">
                                {pack.chances}{" "}
                                {pack.chances === 1 ? "Chance" : "Chances"}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-display text-2xl sm:text-3xl text-[#c1351d] leading-none">
                                ${pack.precio.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleCompra(pack)}
                            className="btn-chunky w-full mt-4 py-2.5 text-sm rounded-xl h-auto"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {contenido.packs_comprar_boton}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {!sorteoCompleto && PACKS.length > 1 && (
                <p className="order-5 lg:order-5 text-xs text-[#fff3df]/50 text-center font-bold uppercase tracking-wider">
                  {contenido.packs_nota}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sección Consultá tus números — bloque de papel (menú) */}
      <section className="tdh-paper border-y-[3px] border-[#120c08] py-12">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="mb-8">
            <span className="sticker sticker-orange text-[11px] px-3 py-1 mb-4">
              🧾 {contenido.consulta_kicker}
            </span>
            <h2 className="font-display text-5xl lg:text-6xl tracking-wide text-[#23170c] uppercase leading-[0.9] mt-2">
              {contenido.consulta_titulo}
            </h2>
            <p className="text-[#23170c]/70 text-sm font-medium mt-2">
              {contenido.consulta_descripcion}
            </p>
          </div>

          <form
            onSubmit={consultarMisNumeros}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <input
              type="email"
              value={consultaEmail}
              onChange={(e) => setConsultaEmail(e.target.value)}
              placeholder={contenido.consulta_placeholder}
              disabled={consultaLoading}
              className="flex-1 bg-white border-[3px] border-[#120c08] text-[#23170c] placeholder:text-[#23170c]/40 rounded-xl px-4 py-3 text-sm font-medium shadow-[3px_3px_0_#120c08] focus:outline-none focus:-translate-x-px focus:-translate-y-px transition-transform disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={consultaLoading || !consultaEmail.trim()}
              className="btn-chunky px-7 py-3 rounded-xl text-sm whitespace-nowrap"
            >
              {consultaLoading ? "Buscando..." : contenido.consulta_boton}
            </button>
          </form>

          {consultaError && (
            <div className="poster-sm bg-[#c1351d] text-white p-4 text-center text-sm font-bold mb-4">
              {consultaError}
            </div>
          )}

          {consultaResultados !== null && consultaResultados.length === 0 && (
            <div className="poster-sm bg-white p-6 text-center">
              <p className="text-[#23170c] text-sm font-bold">
                {contenido.consulta_vacio}
              </p>
              <p className="text-[#23170c]/60 text-xs mt-2">
                {contenido.consulta_vacio_nota}
              </p>
            </div>
          )}

          {consultaResultados !== null && consultaResultados.length > 0 && (
            <div className="space-y-4">
              {consultaResultados.map((p) => (
                <div key={p.id} className="poster bg-white p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <p className="font-display text-xl uppercase tracking-wide text-[#23170c]">
                        {p.nombre}
                      </p>
                      <p className="text-[#23170c]/50 text-xs mt-0.5">
                        {p.sorteo_nombre}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#23170c]/40">
                      {new Date(p.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#c1351d] mb-3">
                    Tus {p.cantidad_chances} números asignados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...p.numeros_asignados]
                      .sort((a, b) => a - b)
                      .map((numero) => (
                        <span
                          key={numero}
                          className="bg-[#ff6a13] text-[#1a0e03] font-mono font-bold px-3 py-1 rounded-md text-sm border-[2px] border-[#120c08]"
                        >
                          {numero}
                        </span>
                      ))}
                  </div>
                  <a
                    href={`/api/descargar/${p.id}`}
                    className="btn-chunky mt-4 inline-flex w-full sm:w-auto py-2.5 px-5 rounded-xl text-sm gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar contenido
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ganadores Express */}
      {sorteo && (
        <GanadoresExpress sorteoId={sorteo.id} contenido={contenido} />
      )}

      {/* Ganadores Pasados */}
      <GanadoresPasados contenido={contenido} />

      {/* Links de interés / Redes sociales */}
      <RedesSociales contenido={contenido} />

      {/* QR - Participación gratuita (/free) */}
      {/* <div className="tdh-grill border-b-[3px] border-[#120c08] flex flex-col items-center gap-4 py-12">
        <span className="sticker sticker-wiggle text-[11px] px-3 py-1">
          🎁 Gratis · sin compra
        </span>
        <Link href="/free" className="group">
          <img
            src="/sosa-qr-free.png"
            alt="Código QR para participar gratis"
            className="w-36 h-36 rounded-xl bg-white p-2 border-[3px] border-[#120c08] shadow-[5px_5px_0_#120c08] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </Link>
        <p className="text-[#ff8a33] text-xs font-extrabold tracking-[0.2em] uppercase">
          Escaneá y participá gratis
        </p>
      </div> */}

      {/* Sección FAQ — pizarra de menú */}
      <section className="tdh-grill py-14">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="font-display text-5xl lg:text-6xl tracking-wide text-[#fff3df] uppercase mb-10">
            {contenido.faq_titulo}
          </h2>

          <div className="grid sm:grid-cols-2 gap-5 text-left">
            <div className="poster poster-ink p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff8a33] mb-3">
                {contenido.faq_pregunta_fecha}
              </p>
              <span className="font-display text-2xl tracking-wide text-[#fff3df] uppercase leading-tight">
                {sorteo?.fecha_sorteo
                  ? new Date(
                      sorteo.fecha_sorteo + "T12:00:00",
                    ).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Próximamente"}
              </span>
            </div>

            <Link
              href={contenido.faq_link_quiniela}
              target="_blank"
              rel="noopener noreferrer"
              className="poster poster-orange p-5 transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#1a0e03]/70 mb-3">
                {contenido.faq_pregunta_ganador}
              </p>
              <span className="font-display text-2xl tracking-wide text-[#1a0e03] uppercase leading-tight">
                {contenido.faq_respuesta_ganador}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#120c08] border-t-[3px] border-[#ff6a13] py-10 text-[#fff3df]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-display text-2xl tracking-wider uppercase">
              {contenido.marca}
            </span>
            <div className="flex gap-6">
              <Link
                href={contenido.whatsapp_url}
                className="text-[#fff3df]/60 hover:text-[#ff8a33] transition-colors text-sm font-bold uppercase tracking-wide"
              >
                Contacto
              </Link>
              <Link
                href="/terminos"
                className="text-[#fff3df]/60 hover:text-[#ff8a33] transition-colors text-sm font-bold uppercase tracking-wide"
              >
                Términos
              </Link>
            </div>
          </div>
          <div className="border-t border-[#fff3df]/15 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-[#fff3df]/40 text-xs">
              {contenido.footer_copyright}
            </p>
            <Link
              href="https://linktr.ee/deweertstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fff3df]/40 hover:text-[#fff3df]/70 transition-colors text-xs"
            >
              Desarrollado por De Weert Studio
            </Link>
          </div>
        </div>
      </footer>

      <CompraModalNuevo
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        pack={packSeleccionado}
        onCompraMercadoPago={procesarCompra}
        onCompraTransferencia={procesarTransferencia}
      />

      <TransferenciaExitoModal
        isOpen={transferenciaExitoAbierta}
        onClose={() => setTransferenciaExitoAbierta(false)}
      />

      <Toaster />
    </div>
  )
}
