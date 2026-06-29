import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")?.trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("compradores")
    .select(`id, nombre, email, telefono, instagram_username, numeros_asignados, cantidad_chances, precio_pagado, created_at, sorteos!compradores_sorteo_id_fkey(nombre, estado, titulo_remera)`)
    .ilike("email", email)
    .eq("estado_pago", "pagado")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error buscando por email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }

  const participaciones = (data || [])
    .filter((row: any) => row.sorteos?.estado === "activo")
    .map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      instagram_username: row.instagram_username,
      numeros_asignados: row.numeros_asignados || [],
      cantidad_chances: row.cantidad_chances,
      precio_pagado: row.precio_pagado,
      sorteo_nombre: row.sorteos?.nombre ?? "Sorteo",
      titulo_remera: row.sorteos?.titulo_remera ?? "",
      created_at: row.created_at,
    }))

  return NextResponse.json({ participaciones })
}
