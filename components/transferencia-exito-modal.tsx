"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, MailWarning } from "lucide-react"

interface TransferenciaExitoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TransferenciaExitoModal({
  isOpen,
  onClose,
}: TransferenciaExitoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#100b08] text-[#fdf1e2] border border-[rgba(255,138,51,0.25)] shadow-[0_0_70px_-12px_rgba(255,106,19,0.55)] p-0 overflow-hidden max-h-[95vh] overflow-y-auto rounded-2xl [&>button]:text-[#fdf1e2] [&>button]:opacity-70 [&>button:hover]:opacity-100">
        <DialogTitle className="sr-only">
          ¡Transferencia registrada!
        </DialogTitle>
        <div className="px-6 py-8">
          <div className="poster p-6">
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <img
                src="/tdh-logo.jpeg"
                alt="Logo"
                className="w-16 h-16 rounded-xl object-cover border border-[rgba(255,138,51,0.4)] shadow-[0_0_24px_-4px_rgba(255,106,19,0.75)] animate-bob"
              />
            </div>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7bc043] to-[#6fae3f] border border-[rgba(160,220,110,0.5)] shadow-[0_0_24px_-4px_rgba(111,174,63,0.8)] mb-4">
                <CheckCircle2 className="w-7 h-7 text-[#0e2106]" />
              </div>
              <h2 className="font-display text-3xl uppercase tracking-wide text-[#8ed05a] leading-[0.95]">
                ¡Transferencia registrada!
              </h2>
            </div>

            <p className="text-[#fdf1e2]/85 text-[15px] leading-relaxed mb-5 text-center font-medium">
              Tu pago está pendiente de confirmación. Te notificaremos por email
              cuando sea aprobado.
            </p>

            <div className="flex items-start gap-3 rounded-xl bg-[#ff6a13]/12 border border-[rgba(255,138,51,0.3)] p-4 mb-6">
              <MailWarning className="w-5 h-5 text-[#ff8a33] flex-shrink-0 mt-0.5" />
              <p className="text-[#fdf1e2]/85 text-sm leading-relaxed">
                Revisá tu carpeta de <strong>spam</strong> o{" "}
                <strong>correo no deseado</strong> por si el email no llega a tu
                bandeja principal.
              </p>
            </div>

            <Button
              type="button"
              onClick={onClose}
              className="btn-chunky w-full text-base h-12 rounded-xl"
            >
              Entendido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
