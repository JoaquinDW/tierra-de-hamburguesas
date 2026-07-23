"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PagoErrorPage() {
  useEffect(() => {
    // Limpiar localStorage ya que el pago falló
    localStorage.removeItem("sorteo_compra_pendiente")
  }, [])

  return (
    <div className="min-h-screen tdh-grill flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 card-clean text-[#fdf1e2]">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 text-[#ff6a4b] mx-auto mb-4" />
          <CardTitle className="text-[#ff8a6a] font-display text-2xl uppercase tracking-wide">
            Pago no completado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-[#fdf1e2]/70">
            Tu pago no pudo ser procesado. Esto puede deberse a:
          </p>
          <ul className="text-sm text-[#fdf1e2]/50 text-left space-y-1">
            <li>• Fondos insuficientes</li>
            <li>• Problema con la tarjeta</li>
            <li>• Pago cancelado por el usuario</li>
            <li>• Error temporal del sistema</li>
          </ul>

          <div className="pt-4 space-y-3">
            <Link href="/">
              <Button className="btn-chunky w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar nuevamente
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
