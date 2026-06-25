import { createClient } from "@supabase/supabase-js"

/**
 * Cliente de Supabase con SERVICE ROLE KEY. SOLO debe usarse en código de
 * servidor (rutas API / scripts). Nunca importar desde componentes cliente.
 *
 * Se usa para operar sobre el bucket privado `contenido-packs`: generar signed
 * URLs de descarga y subir los archivos, sin depender de políticas RLS.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!serviceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
