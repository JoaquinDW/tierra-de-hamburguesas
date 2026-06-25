import type { Sorteo } from "@/lib/supabase"

/**
 * Contenido digital descargable asociado a cada pack del sorteo.
 *
 * Cada comprador recibe el archivo del pack que compró. El pack se identifica
 * por su "slot" (1..5), que se resuelve a partir de `cantidad_chances` contra
 * la configuración del sorteo (`cantidad_pack_N`) — la misma lógica que usa
 * `app/api/confirmar-pago/route.ts` para calcular el precio.
 */
export interface ContenidoPack {
  /** Título legible para mostrar en emails / UI */
  titulo: string
  /** Ruta del archivo dentro del bucket privado `contenido-packs` */
  storagePath: string
  /** Nombre con el que se descarga el archivo */
  filename: string
}

/** Bucket privado de Supabase Storage donde viven los descargables. */
export const BUCKET_CONTENIDO = "contenido-packs"

/** Mapeo slot de pack -> contenido descargable. */
const CONTENIDO_POR_SLOT: Record<number, ContenidoPack> = {
  1: {
    titulo: "Ebook: Los secretos de Instagram",
    storagePath: "ebook-instagram.pdf",
    filename: "Ebook-Los-secretos-de-instagram.pdf",
  },
  2: {
    titulo: "Guía Premium Sosa Motos",
    storagePath: "guia-premium.pdf",
    filename: "Guia_Premium_Sosa_Motos.pdf",
  },
  3: {
    titulo: "Pack de Calcos Digitales",
    storagePath: "calcos-digitales.zip",
    filename: "Sosa_Motos_Pack_Calcos_Digitales.zip",
  },
}

/**
 * Resuelve el slot de pack (1..5) a partir de la cantidad de chances comprada.
 * Devuelve `null` si no coincide con ningún pack configurado.
 */
export function resolverSlotPack(sorteo: Sorteo, chances: number): number | null {
  if (chances === sorteo.cantidad_pack_1) return 1
  if (chances === sorteo.cantidad_pack_2) return 2
  if (chances === sorteo.cantidad_pack_3) return 3
  if (sorteo.pack_4_visible && chances === sorteo.cantidad_pack_4) return 4
  if (sorteo.pack_5_visible && chances === sorteo.cantidad_pack_5) return 5
  return null
}

/**
 * Devuelve el contenido descargable que le corresponde a un comprador según
 * la cantidad de chances que compró, o `null` si ese pack no tiene contenido.
 */
export function obtenerContenidoPorChances(
  sorteo: Sorteo,
  chances: number,
): ContenidoPack | null {
  const slot = resolverSlotPack(sorteo, chances)
  if (slot === null) return null
  return CONTENIDO_POR_SLOT[slot] ?? null
}
