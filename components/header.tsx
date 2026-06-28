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
      <div className="bg-[#c1351d] text-[#fff3df] border-b-[3px] border-[#120c08] overflow-hidden">
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

      <header className="sticky top-0 z-50 bg-[#161210]/95 backdrop-blur-md border-b-[3px] border-[#120c08]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border-[3px] border-[#120c08] bg-[#fff3df] shadow-[3px_3px_0_#120c08] group-hover:-translate-x-px group-hover:-translate-y-px transition-transform duration-200">
                <Image src="/tdh-logo.jpg" alt={marca} fill className="object-cover" />
              </div>
              <span className="font-display text-xl sm:text-2xl tracking-wider text-[#fff3df] uppercase leading-none">
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
              className="md:hidden text-[#fff3df] border-[2.5px] border-[#120c08] bg-[#1d1510] rounded-lg p-1.5 shadow-[3px_3px_0_#120c08] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
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
