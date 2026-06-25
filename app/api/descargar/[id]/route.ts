import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import {
  BUCKET_CONTENIDO,
  obtenerContenidoPorChances,
} from "@/lib/contenido-packs"
import type { Sorteo } from "@/lib/supabase"

/**
 * Descarga gateada del contenido digital según el pack comprado.
 *
 * GET /api/descargar/{compradorId}
 *  - Verifica que el comprador exista y esté pagado.
 *  - Resuelve el archivo según su cantidad de chances.
 *  - Redirige a una signed URL de corta duración del bucket privado.
 *
 * El {compradorId} es un UUID no adivinable y oficia de token de acceso.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Falta el identificador" }, { status: 400 })
    }

    // 1. Cargar el comprador
    const { data: comprador, error: compradorError } = await supabaseAdmin
      .from("compradores")
      .select("id, sorteo_id, cantidad_chances, estado_pago")
      .eq("id", id)
      .maybeSingle()

    if (compradorError) {
      console.error("Error buscando comprador para descarga:", compradorError)
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }

    if (!comprador || comprador.estado_pago !== "pagado") {
      return NextResponse.json(
        { error: "No encontramos una compra confirmada para este enlace." },
        { status: 403 },
      )
    }

    // 2. Cargar el sorteo para resolver a qué pack corresponde la compra
    const { data: sorteo, error: sorteoError } = await supabaseAdmin
      .from("sorteos")
      .select("*")
      .eq("id", comprador.sorteo_id)
      .maybeSingle()

    if (sorteoError || !sorteo) {
      console.error("Error buscando sorteo para descarga:", sorteoError)
      return NextResponse.json({ error: "Sorteo no encontrado" }, { status: 404 })
    }

    // 3. Resolver el contenido del pack
    const contenido = obtenerContenidoPorChances(
      sorteo as Sorteo,
      comprador.cantidad_chances,
    )

    if (!contenido) {
      return NextResponse.json(
        { error: "Tu pack no tiene contenido descargable asociado." },
        { status: 404 },
      )
    }

    // 4. Generar signed URL de corta duración (120s) que fuerza la descarga
    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(BUCKET_CONTENIDO)
      .createSignedUrl(contenido.storagePath, 120, {
        download: contenido.filename,
      })

    if (signedError || !signed?.signedUrl) {
      console.error("Error generando signed URL:", signedError)
      return NextResponse.json(
        { error: "No se pudo generar la descarga. Intentá de nuevo." },
        { status: 500 },
      )
    }

    // 5. Redirigir al archivo
    return NextResponse.redirect(signed.signedUrl)
  } catch (error) {
    console.error("Error en descarga de contenido:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
