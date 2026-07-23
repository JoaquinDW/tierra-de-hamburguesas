"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PagoPendientePage() {
  return (
    <div className="min-h-screen tdh-grill flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 card-clean text-[#fdf1e2]">
        <CardHeader className="text-center">
          <Clock className="w-16 h-16 text-[#ff8a33] mx-auto mb-4" />
          <CardTitle className="text-[#ff8a33] font-display text-2xl uppercase tracking-wide">
            Pago pendiente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-[#fdf1e2]/70">
            Tu pago está siendo procesado. Esto puede tomar unos minutos.
          </p>

          <div className="bg-[#ff6a13]/10 border border-[rgba(255,138,51,0.3)] rounded-lg p-4">
            <p className="text-[#fdf1e2]/85 text-sm">
              <strong>¿Qué hacer?</strong>
              <br />
              Recibirás un email de confirmación una vez que se apruebe el pago.
              También puedes revisar el estado en tu cuenta de MercadoPago.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link href="/pago/exito">
              <Button className="btn-chunky w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar estado del pago
              </Button>
            </Link>
            <Link href="/">
              <Button className="btn-chunky btn-chunky-cream w-full">
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
