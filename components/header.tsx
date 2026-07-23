"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"

const PROMO_ITEMS = [
  "🍔 SORTEOS TODAS LAS SEMANAS",
  "🔥 PARTICIPÁ Y GANÁ",
  "🎁 PREMIOS AL TOQUE",
  "🍟 SIN OBLIGACIÓN DE COMPRA",
]

export function Header({ marca = "Tierra de Hamburguesas" }: { marca?: string }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <>
      {/* Cinta de promos tipo marquesina */}
      <div className="bg-[#0b0806] text-[#ff8a33] border-b border-[rgba(255,138,51,0.18)] overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-1.5">
          {[...PROMO_ITEMS, ...PROMO_ITEMS, ...PROMO_ITEMS, ...PROMO_ITEMS].map(
            (item, i) => (
              <span
                key={i}
                className="mx-6 text-[11px] font-extrabold uppercase tracking-[0.18em]"
              >
                {item}
              </span>
            ),
          )}
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#0b0806]/80 backdrop-blur-xl border-b border-[rgba(255,138,51,0.14)] shadow-[0_10px_30px_-20px_rgba(255,106,19,0.6)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[rgba(255,138,51,0.4)] bg-[#17110d] shadow-[0_0_20px_-4px_rgba(255,106,19,0.7)] group-hover:shadow-[0_0_26px_-2px_rgba(255,106,19,0.9)] transition-shadow duration-200">
                <Image src="/tdh-logo.jpg" alt={marca} fill className="object-cover" />
              </div>
              <span className="font-display text-xl sm:text-2xl tracking-wider text-[#fdf1e2] uppercase leading-none drop-shadow-[0_0_18px_rgba(255,106,19,0.35)]">
                {marca}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              <Link
                href="/"
                className="text-[#fff3df]/80 hover:text-[#ff8a33] transition-colors text-sm font-bold uppercase tracking-wider"
              >
                Inicio
              </Link>
              <Link
                href="#ganadores"
                className="text-[#fff3df]/80 hover:text-[#ff8a33] transition-colors text-sm font-bold uppercase tracking-wider"
              >
                Ganadores
              </Link>
              <Link
                href="/free"
                className="btn-chunky text-xs px-4 py-2"
              >
                Participá gratis
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Abrir menú"
              className="md:hidden text-[#fdf1e2] border border-[rgba(255,138,51,0.3)] bg-[#17110d] rounded-lg p-1.5 shadow-[0_0_16px_-6px_rgba(255,106,19,0.7)] active:scale-95 transition-all"
            >
              {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {menuAbierto && (
            <div className="md:hidden py-4 border-t-[3px] border-[#120c08]/60">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="text-[#fff3df]/85 hover:text-[#ff8a33] transition-colors px-2 py-2 text-sm font-bold uppercase tracking-wider"
                  onClick={() => setMenuAbierto(false)}
                >
                  Inicio
                </Link>
                <Link
                  href="#ganadores"
                  className="text-[#fff3df]/85 hover:text-[#ff8a33] transition-colors px-2 py-2 text-sm font-bold uppercase tracking-wider"
                  onClick={() => setMenuAbierto(false)}
                >
                  Ganadores
                </Link>
                <Link
                  href="/free"
                  className="btn-chunky text-xs px-4 py-2.5 mt-1"
                  onClick={() => setMenuAbierto(false)}
                >
                  Participá gratis
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
