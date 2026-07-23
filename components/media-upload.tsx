"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

interface MediaUploadProps {
  onUploaded: (url: string) => void
  disabled?: boolean
  label?: string
}

/**
 * Botón compacto para subir una imagen o un video MP4.
 *
 * Sube el archivo directamente del navegador a Supabase Storage (bucket
 * "sorteo-images") en vez de pasar por /api/upload-image, para evitar el
 * límite de ~4.5MB del cuerpo de las funciones serverless de Vercel — los
 * videos suelen superarlo.
 */
export function MediaUpload({ onUploaded, disabled, label = "Subir archivo" }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")

    if (!isImage && !isVideo) {
      alert("Selecciona una imagen o un video MP4 válido")
      return
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      alert(`El archivo debe ser menor a ${isVideo ? "50MB" : "5MB"}`)
      return
    }

    setUploading(true)

    try {
      const extension = file.name.split(".").pop()
      const path = `carousel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

      const { error } = await supabase.storage.from("sorteo-images").upload(path, file, {
        contentType: file.type,
        upsert: true,
      })

      if (error) throw error

      const { data } = supabase.storage.from("sorteo-images").getPublicUrl(path)
      onUploaded(data.publicUrl)
    } catch (error) {
      console.error("Error subiendo el archivo:", error)
      alert("Error al subir el archivo. Inténtalo de nuevo.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="w-full"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {label}
          </>
        )}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}
