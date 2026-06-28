"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileImage, X, Copy, Check, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransferenciaModalProps {
  isOpen: boolean
  onClose: () => void
  pack: {
    chances: number
    precio: number
  } | null
  onSubmit: (data: {
    nombre: string
    email: string
    contacto: string
    comprobanteFile: File
  }) => void
  alias?: string
  titular?: string
  avisoActivo?: boolean
  avisoTitulo?: string
  avisoTexto?: string
}

export function TransferenciaModal({
  isOpen,
  onClose,
  pack,
  onSubmit,
  alias = "sosamotos",
  titular = "Agustín Sosa",
  avisoActivo = false,
  avisoTitulo = "IMPORTANTE — TRANSFERENCIAS",
  avisoTexto = "Las transferencias deben estar emitidas a nombre de la misma persona que completa este formulario (nombre y apellido). Si el titular de la transferencia no coincide, la compra se anula directamente sin excepción.",
}: TransferenciaModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contacto: "",
  })
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aliasCopiado, setAliasCopiado] = useState(false)
  const [avisoAceptado, setAvisoAceptado] = useState(false)
  const { toast } = useToast()

  // Mostrar el aviso al abrir el modal solo si está activo; si no, saltarlo
  useEffect(() => {
    if (isOpen) setAvisoAceptado(!avisoActivo)
  }, [isOpen, avisoActivo])

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(alias)
      setAliasCopiado(true)
      toast({
        title: "¡Alias copiado!",
        description: "Ya puedes pegarlo en tu app bancaria",
      })
      setTimeout(() => setAliasCopiado(false), 2000)
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el alias",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileSelect = (file: File) => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ]
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes (JPG, PNG, WEBP) o PDF",
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB",
      })
      return
    }
    setComprobanteFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.contacto) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor completá todos los campos requeridos",
      })
      return
    }

    if (!comprobanteFile) {
      toast({
        variant: "destructive",
        title: "Falta el comprobante",
        description: "Debes subir el comprobante de transferencia",
      })
      return
    }

    setLoading(true)
    try {
      onSubmit({ ...formData, comprobanteFile })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", email: "", contacto: "" })
    setComprobanteFile(null)
    setAvisoAceptado(!avisoActivo)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!pack) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#fff3df] text-[#241608] border-[3px] border-[#120c08] shadow-[8px_8px_0_#120c08] p-0 overflow-hidden max-h-[95vh] overflow-y-auto rounded-2xl [&>button]:text-[#120c08] [&>button]:opacity-80 [&>button:hover]:opacity-100">
        <DialogTitle className="sr-only">
          {avisoAceptado ? "Completá tu compra" : avisoTitulo}
        </DialogTitle>
        {!avisoAceptado ? (
          /* Aviso importante antes de transferir */
          <div className="px-6 py-8">
            <div className="poster bg-white p-6">
              {/* Logo */}
              <div className="flex justify-center mb-5">
                <img
                  src="/tdh-logo.jpg"
                  alt="Logo"
                  className="w-16 h-16 rounded-xl object-cover border-[3px] border-[#120c08] shadow-[3px_3px_0_#120c08]"
                />
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#f4b400] border-[2.5px] border-[#120c08] shadow-[3px_3px_0_#120c08] flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[#120c08]" />
                </div>
                <h2 className="font-display text-2xl uppercase tracking-wide text-[#c1351d] leading-[0.95]">
                  {avisoTitulo}
                </h2>
              </div>
              <p className="text-[#241608] text-[15px] leading-relaxed mb-6 whitespace-pre-line">
                {avisoTexto}
              </p>
              <Button
                type="button"
                onClick={() => setAvisoAceptado(true)}
                className="btn-chunky w-full text-base h-12 rounded-xl"
              >
                Entiendo
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="pt-9 pb-4 px-6 text-center">
              <span className="sticker sticker-ketchup text-[10px] px-3 py-1 mb-3">
                🧾 Tu pedido
              </span>
              <h2 className="font-display text-4xl uppercase tracking-wide text-[#23170c] mt-2 leading-[0.95]">
                Completá tu compra
              </h2>
              <p className="text-[#241608]/60 text-sm mt-1 font-medium">
                Transferí y cargá el comprobante
              </p>
            </div>

            {/* Monto destacado */}
            <div className="mx-6 mb-4 poster poster-orange p-4 text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#1a0e03]/70 mb-1">
                Total a transferir
              </p>
              <p className="font-display text-5xl text-[#1a0e03] leading-none">
                ${pack.precio.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-[#1a0e03]/70 mt-1">
                {pack.chances} {pack.chances === 1 ? "chance" : "chances"}
              </p>
            </div>

            {/* Alias */}
            <div className="mx-6 mb-5 poster-sm bg-white p-4">
              <p className="text-[11px] text-[#c1351d] uppercase tracking-widest mb-2 font-extrabold">
                Alias
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#1d1510] rounded-lg border-[2.5px] border-[#120c08] px-4 py-3">
                  <span className="font-mono text-base text-[#ff8a33] tracking-wide">
                    {alias}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copiarAlias}
                  aria-label="Copiar alias"
                  className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#ff6a13] border-[2.5px] border-[#120c08] shadow-[3px_3px_0_#120c08] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex-shrink-0"
                >
                  {aliasCopiado ? (
                    <Check className="w-5 h-5 text-[#1a0e03]" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#1a0e03]" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#241608]/60 mt-2 font-medium">
                Titular: {titular}
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
              <p className="text-[11px] text-[#c1351d] uppercase tracking-widest font-extrabold mb-3">
                Tus datos
              </p>

              <div>
                <Label
                  htmlFor="nombre"
                  className="text-[#241608] text-xs font-bold mb-1 block"
                >
                  Nombre completo *
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez"
                  className="bg-white border-[2.5px] border-[#120c08] text-[#241608] placeholder:text-[#241608]/40 shadow-[2px_2px_0_#120c08] focus:border-[#ff6a13] focus-visible:ring-2 focus-visible:ring-[#ff6a13]/40 h-11 rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-[#241608] text-xs font-bold mb-1 block"
                >
                  Email{" "}
                  <span className="text-[#241608]/50 font-medium">
                    (recibís tus números acá)
                  </span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="juan@email.com"
                  className="bg-white border-[2.5px] border-[#120c08] text-[#241608] placeholder:text-[#241608]/40 shadow-[2px_2px_0_#120c08] focus:border-[#ff6a13] focus-visible:ring-2 focus-visible:ring-[#ff6a13]/40 h-11 rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <Label
                  htmlFor="contacto"
                  className="text-[#241608] text-xs font-bold mb-1 block"
                >
                  WhatsApp o Instagram *
                </Label>
                <Input
                  id="contacto"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleInputChange}
                  placeholder="3794123456 o @usuario"
                  className="bg-white border-[2.5px] border-[#120c08] text-[#241608] placeholder:text-[#241608]/40 shadow-[2px_2px_0_#120c08] focus:border-[#ff6a13] focus-visible:ring-2 focus-visible:ring-[#ff6a13]/40 h-11 rounded-lg"
                  disabled={loading}
                />
              </div>

              {/* Comprobante */}
              <div>
                <Label className="text-[11px] text-[#c1351d] mb-1 block uppercase tracking-widest font-extrabold">
                  Comprobante *
                </Label>
                <div
                  className={`mt-1 border-[2.5px] border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? "border-[#ff6a13] bg-[#ff6a13]/10"
                      : comprobanteFile
                        ? "border-[#6fae3f] bg-[#6fae3f]/15"
                        : "border-[#120c08]/40 hover:border-[#ff6a13] bg-white"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                    disabled={loading}
                  />

                  {comprobanteFile ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-6 h-6 text-[#4d8a26] flex-shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-bold text-[#4d8a26] truncate max-w-[180px]">
                            {comprobanteFile.name}
                          </p>
                          <p className="text-xs text-[#241608]/50">
                            {(comprobanteFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setComprobanteFile(null)
                        }}
                        className="w-7 h-7 rounded-full bg-[#241608]/10 hover:bg-[#241608]/20 flex items-center justify-center flex-shrink-0"
                        disabled={loading}
                      >
                        <X className="w-4 h-4 text-[#241608]" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-7 h-7 text-[#241608]/50 mx-auto" />
                      <p className="text-sm font-bold text-[#241608]">
                        Tocá para subir el comprobante
                      </p>
                      <p className="text-xs text-[#241608]/50">
                        JPG, PNG, WEBP o PDF · máx. 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="btn-chunky btn-chunky-cream flex-1 h-11 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-chunky flex-1 h-11 text-base rounded-xl"
                >
                  {loading ? "Enviando…" : "Finalizar compra"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
