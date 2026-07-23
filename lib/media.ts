// Utilidades para distinguir imágenes de videos en los slots del carrusel.
// Los slots (carousel_image_1..8) guardan una URL sin importar el tipo, así
// que detectamos el tipo por la extensión del archivo.

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false
  return VIDEO_EXTENSIONS.test(url)
}
