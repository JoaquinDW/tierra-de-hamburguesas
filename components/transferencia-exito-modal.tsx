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
      <DialogContent className="sm:max-w-md bg-[#fff3df] text-[#241608] border-[3px] border-[#120c08] shadow-[8px_8px_0_#120c08] p-0 overflow-hidden max-h-[95vh] overflow-y-auto rounded-2xl [&>button]:text-[#120c08] [&>button]:opacity-80 [&>button:hover]:opacity-100">
        <DialogTitle className="sr-only">¡Transferencia registrada!</DialogTitle>
        <div className="px-6 py-8">
          <div className="poster bg-white p-6">
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <img
                src="/tdh-logo.jpg"
                alt="Logo"
                className="w-16 h-16 rounded-xl object-cover border-[3px] border-[#120c08] shadow-[3px_3px_0_#120c08] animate-bob"
              />
            </div>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6fae3f] border-[2.5px] border-[#120c08] shadow-[3px_3px_0_#120c08] mb-4">
                <CheckCircle2 className="w-7 h-7 text-[#0e2106]" />
              </div>
              <h2 className="font-display text-3xl uppercase tracking-wide text-[#4d8a26] leading-[0.95]">
                ¡Transferencia registrada!
              </h2>
            </div>

            <p className="text-[#241608] text-[15px] leading-relaxed mb-5 text-center font-medium">
              Tu pago está pendiente de confirmación. Te notificaremos por email
              cuando sea aprobado.
            </p>

            <div className="flex items-start gap-3 rounded-xl bg-[#f4b400]/25 border-[2.5px] border-[#120c08] p-4 mb-6">
              <MailWarning className="w-5 h-5 text-[#9a6b00] flex-shrink-0 mt-0.5" />
              <p className="text-[#241608] text-sm leading-relaxed">
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
