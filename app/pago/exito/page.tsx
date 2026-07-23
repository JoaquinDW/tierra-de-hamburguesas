"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, Home } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import dynamic from "next/dynamic"

const IphoneCarousel = dynamic(() => import("@/components/iphone-carousel"), {
  ssr: false,
})

function PagoExitoContent() {
  const [estado, setEstado] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [datosCompra, setDatosCompra] = useState<any>(null)
  const [numerosAsignados, setNumerosAsignados] = useState<number[]>([])
  const [compradorId, setCompradorId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const paymentId =
    searchParams.get("payment_id") || searchParams.get("collection_id")
  const status =
    searchParams.get("status") || searchParams.get("collection_status")
  const preferenceId = searchParams.get("preference_id")
  const externalReference = searchParams.get("external_reference")

  console.log("URL Params:", {
    paymentId,
    status,
    preferenceId,
    externalReference,
    allParams: Object.fromEntries(searchParams.entries()),
  })

  useEffect(() => {
    confirmarPago()
  }, [])

  const confirmarPago = async () => {
    try {
      // Obtener datos del localStorage
      const datosGuardados = localStorage.getItem("sorteo_compra_pendiente")
      if (!datosGuardados) {
        setEstado("error")
        return
      }

      let datos
      try {
        datos = JSON.parse(datosGuardados)
      } catch (error) {
        console.error("Error parsing localStorage data:", error)
        localStorage.removeItem("sorteo_compra_pendiente")
        setEstado("error")
        return
      }

      setDatosCompra(datos)

      // Verificar que el status sea approved
      if (status !== "approved") {
        setEstado("error")
        return
      }

      // Confirmar el pago con nuestro servidor
      const response = await fetch("/api/confirmar-pago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          preferenceId,
          status,
          datosCompra: datos,
        }),
      })

      if (!response.ok) {
        throw new Error("Error confirmando pago")
      }

      const result = await response.json()

      if (result.success) {
        setNumerosAsignados(result.numerosAsignados)
        setCompradorId(result.compradorId ?? null)
        setEstado("success")

        // Limpiar localStorage
        localStorage.removeItem("sorteo_compra_pendiente")

        toast({
          title: "¡Pago confirmado! 🎉",
          description: "Tu compra se procesó correctamente",
        })
      } else {
        setEstado("error")
      }
    } catch (error) {
      console.error("Error confirmando pago:", error)
      setEstado("error")
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo confirmar el pago",
      })
    }
  }

  if (estado === "loading") {
    return (
      <div className="min-h-screen tdh-grill flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 card-clean text-[#fdf1e2]">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#ff6a13] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">
                Confirmando pago...
              </h2>
              <p className="text-[#fdf1e2]/60">
                Estamos verificando tu pago con MercadoPago
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (estado === "error") {
    return (
      <div className="min-h-screen tdh-grill flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 card-clean text-[#fdf1e2]">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-[#ff6a4b] mx-auto mb-4" />
            <CardTitle className="text-[#ff8a6a] font-display text-2xl uppercase tracking-wide">
              Error en el pago
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#fdf1e2]/70">
              Hubo un problema procesando tu pago. Puede ser que:
            </p>
            <ul className="text-sm text-[#fdf1e2]/50 text-left space-y-1">
              <li>• El pago fue rechazado</li>
              <li>• La sesión expiró</li>
              <li>• Hubo un error técnico</li>
            </ul>
            <div className="pt-4">
              <Link href="/">
                <Button className="btn-chunky w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen tdh-grill flex items-center justify-center py-10">
      <Card className="w-full max-w-lg mx-4 card-clean text-[#fdf1e2]">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-[#8ed05a] mx-auto mb-4" />
          <CardTitle className="text-[#8ed05a] font-display text-2xl uppercase tracking-wide">
            ¡Pago exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Carrusel de 3 fotos del iPhone como contenido principal */}
          <div className="space-y-6">
            <div className="relative">
              <IphoneCarousel />
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold neon-text animate-neon-pulse">
                COMPRANDO MI REMERA DIGITAL
              </h2>
              <h3 className="text-lg font-bold text-orange-500 glow-red">
                PARTICIPAS GRATIS DEL IPHONE 14 pro Max NUEVO EN CAJA
              </h3>
              <p className="text-base font-semibold text-[#ffd27a] animate-pulse">
                compra que se van volando👍🏻
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-2 text-[#fdf1e2]">
              ¡Gracias por tu compra, {datosCompra?.nombre}!
            </p>
            <p className="text-[#fdf1e2]/60">
              Tu pago se procesó correctamente y ya tienes tus números
              asignados.
            </p>
          </div>

          <div className="bg-[#0f0a07] border border-[rgba(255,138,51,0.18)] rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-[#fdf1e2]/60">Chances compradas:</span>
              <span className="font-semibold text-[#fdf1e2]">{datosCompra?.chances}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#fdf1e2]/60">Precio pagado:</span>
              <span className="font-semibold text-[#ff8a33]">
                ${datosCompra?.precio?.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[rgba(255,138,51,0.15)] pt-3">
              <span className="text-[#fdf1e2]/60 block mb-2">Tus números:</span>
              <div className="flex flex-wrap gap-2">
                {numerosAsignados.map((numero) => (
                  <span
                    key={numero}
                    className="bg-gradient-to-b from-[#ff8a33] to-[#ff6a13] text-[#1a0e03] px-3 py-1 rounded-full font-mono font-semibold border border-[rgba(255,200,140,0.5)] shadow-[0_0_12px_-4px_rgba(255,106,19,0.7)]"
                  >
                    #{numero}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {compradorId && (
            <a
              href={`/api/descargar/${compradorId}`}
              className="btn-chunky block w-full text-center py-3 px-4 rounded-lg"
            >
              📥 Descargar mi contenido
            </a>
          )}

          <div className="bg-[#ff6a13]/10 border border-[rgba(255,138,51,0.3)] rounded-lg p-4 ">
            <p className="text-[#fdf1e2]/85 text-sm">
              <strong>Importante:</strong> Recibirás un email de confirmación
              con todos los detalles de tu compra.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button className="btn-chunky w-full">
                <Home className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>

          {/* Texto aclaratorio del sorteo y mini-remera */}
          <div className="mt-6 space-y-4 text-center">
            {/* Aviso del ganador con mejor estilo */}
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-lg p-4 border border-orange-500/20">
              <p className="text-orange-400 text-sm font-bold glow-red">
                🏆 El ganador se anunciará al vender el 100% de los números
              </p>
              {/* <p className="text-yellow-400 text-xs font-semibold mt-1">
                Una vez vendido el 100% de los números.
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Si no llegamos, se anunciará nueva fecha 🙌🏻✅
              </p> */}
            </div>

            {/* Mini remera con mejor estilo */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="w-14 h-14 relative animate-float">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-full blur-sm"></div>
                <img
                  src="/white-t-shirt-mockup-t-shirt-with-short-sleeves-ai-generative-free-png.webp"
                  alt="remera digital"
                  className="w-full h-full object-cover rounded relative z-10"
                />
              </div>
              <div className="text-left">
                <p className="text-sm text-orange-400 font-bold glow-red">
                  remera digital
                </p>
                <p className="text-xs text-[#fdf1e2]/50">
                  incluida con tu participación
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen tdh-grill flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 card-clean text-[#fdf1e2]">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ff6a13] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
            <p className="text-[#fdf1e2]/60">
              Preparando la confirmación de tu pago
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PagoExitoPage() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <PagoExitoContent />
      </Suspense>
      <Toaster />
    </>
  )
}
