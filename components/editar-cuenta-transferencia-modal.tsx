"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface EditarCuentaTransferenciaModalProps {
  isOpen: boolean
  onClose: () => void
  alias: string
  titular: string
  avisoActivo: boolean
  avisoTitulo: string
  avisoTexto: string
  onGuardado: (config: {
    alias: string
    titular: string
    avisoActivo: boolean
    avisoTitulo: string
    avisoTexto: string
  }) => void
}

export function EditarCuentaTransferenciaModal({
  isOpen,
  onClose,
  alias,
  titular,
  avisoActivo,
  avisoTitulo,
  avisoTexto,
  onGuardado,
}: EditarCuentaTransferenciaModalProps) {
  const [aliasValue, setAliasValue] = useState(alias)
  const [titularValue, setTitularValue] = useState(titular)
  const [avisoActivoValue, setAvisoActivoValue] = useState(avisoActivo)
  const [avisoTituloValue, setAvisoTituloValue] = useState(avisoTitulo)
  const [avisoTextoValue, setAvisoTextoValue] = useState(avisoTexto)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Sincronizar con los valores actuales cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setAliasValue(alias)
      setTitularValue(titular)
      setAvisoActivoValue(avisoActivo)
      setAvisoTituloValue(avisoTitulo)
      setAvisoTextoValue(avisoTexto)
    }
  }, [isOpen, alias, titular, avisoActivo, avisoTitulo, avisoTexto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!aliasValue.trim() || !titularValue.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El alias y el titular no pueden estar vacíos",
      })
      return
    }

    if (!avisoTituloValue.trim() || !avisoTextoValue.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El título y el texto del aviso no pueden estar vacíos",
      })
      return
    }

    setLoading(true)

    try {
      const nuevaConfig = {
        alias: aliasValue.trim(),
        titular: titularValue.trim(),
        avisoActivo: avisoActivoValue,
        avisoTitulo: avisoTituloValue.trim(),
        avisoTexto: avisoTextoValue.trim(),
      }

      const res = await fetch("/api/configuracion-transferencia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaConfig),
      })

      if (!res.ok) throw new Error("Error al guardar")

      toast({
        title: "Cuenta actualizada",
        description: "Los datos de la cuenta de transferencia se actualizaron correctamente",
      })
      onGuardado(nuevaConfig)
      onClose()
    } catch (error) {
      console.error("Error actualizando cuenta de transferencia:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la cuenta. Intenta nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card-dark border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Cuenta de Transferencia</DialogTitle>
          <DialogDescription className="text-gray-400">
            Cambia el alias y titular de la cuenta bancaria donde se reciben las transferencias
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alias" className="text-white">
              Alias
            </Label>
            <Input
              id="alias"
              value={aliasValue}
              onChange={(e) => setAliasValue(e.target.value)}
              placeholder="Ej: sosamotos"
              className="bg-gray-800 border-gray-600 text-white"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="titular" className="text-white">
              Titular
            </Label>
            <Input
              id="titular"
              value={titularValue}
              onChange={(e) => setTitularValue(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="bg-gray-800 border-gray-600 text-white"
              maxLength={150}
            />
          </div>

          <div className="border-t border-gray-700 pt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-800/60 border border-gray-700 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="avisoActivo" className="text-white">
                  Mostrar aviso antes de comprar
                </Label>
                <p className="text-xs text-gray-400">
                  Si está activo, el cliente verá este aviso antes de transferir
                </p>
              </div>
              <Switch
                id="avisoActivo"
                checked={avisoActivoValue}
                onCheckedChange={setAvisoActivoValue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avisoTitulo" className="text-white">
                Título del aviso
              </Label>
              <Input
                id="avisoTitulo"
                value={avisoTituloValue}
                onChange={(e) => setAvisoTituloValue(e.target.value)}
                placeholder="Ej: IMPORTANTE — TRANSFERENCIAS"
                className="bg-gray-800 border-gray-600 text-white disabled:opacity-50"
                maxLength={80}
                disabled={!avisoActivoValue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avisoTexto" className="text-white">
                Texto del aviso
              </Label>
              <Textarea
                id="avisoTexto"
                value={avisoTextoValue}
                onChange={(e) => setAvisoTextoValue(e.target.value)}
                placeholder="Mensaje que verá el cliente antes de hacer la transferencia"
                className="bg-gray-800 border-gray-600 text-white min-h-[120px] disabled:opacity-50"
                maxLength={600}
                disabled={!avisoActivoValue}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !aliasValue.trim() ||
                !titularValue.trim() ||
                !avisoTituloValue.trim() ||
                !avisoTextoValue.trim()
              }
              className="btn-neon"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
