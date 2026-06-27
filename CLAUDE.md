# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # Start development server
pnpm build          # Production build (TypeScript and ESLint errors are intentionally ignored)
pnpm lint           # Run ESLint

# Lottery system scripts (run with tsx via pnpm)
pnpm run scrapper           # Run the Quiniela Buenos Aires scraper manually
pnpm run verificar-sorteos  # Check for pending sorteos and trigger winner selection
pnpm run cron-sorteos       # Same as verificar-sorteos (alias used for cron)
pnpm run prueba-rapida      # Quick smoke test against the database
```

There is no test runner configured in package.json. The `__tests__/` directory contains concurrency tests that require a live Supabase connection and are intended for manual invocation with `tsx`.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CRON_SECRET` — used to authenticate calls to `/api/verificar-sorteos`
- `MERCADOPAGO_ACCESS_TOKEN` — for MercadoPago payment integration
- `RESEND_API_KEY` — for transactional emails via Resend
- `BLOB_READ_WRITE_TOKEN` — for Vercel Blob image storage
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key. Used by `lib/supabase-admin.ts` to mint signed URLs for the private `contenido-packs` bucket (gated per-pack downloads in `/api/descargar/[id]`) and by `scripts/upload-contenido-packs.ts`. Must also be set in Vercel for downloads to work in production.
- `NEXT_PUBLIC_APP_URL` — base URL used to build the download link inside confirmation emails.

## Architecture

### Tech stack
Next.js 15 (App Router) + TypeScript, Supabase (Postgres), Vercel Blob (images), MercadoPago (payments), Resend (email), Playwright (scraping), Tailwind + Radix UI (shadcn/ui components).

### Data layer (`lib/`)

- **`lib/supabase.ts`** — Supabase client singleton and all TypeScript interfaces (`Sorteo`, `Comprador`, `GanadorExpress`, etc.)
- **`lib/database.ts`** — All database operations. This is the single source of truth for data access. Key details:
  - `sorteoId === "default"` is a fallback path that reads/writes `localStorage` when no Supabase tables exist (dev/demo mode)
  - Number generation uses the PostgreSQL function `generar_numeros_unicos_atomico` (atomic, FOR UPDATE) to prevent race conditions under concurrent purchases
  - Statistics use `obtener_estadisticas_sorteo` SQL RPC to avoid pulling all rows to the client
  - `obtenerGanadoresExpress` uses `obtener_ganadores_express_visibles` SQL RPC
  - Buyer lists are paginated in 1000-row pages to handle large sorteos

### Database schema

Core tables: `sorteos`, `compradores`, `ganadores_express`, `ganadores_pasados`, `configuracion` (key-value store for alias/titular transferencia).

Migration scripts are numbered in `scripts/` (01–20). Apply them in order to a fresh Supabase project. The critical SQL functions for production (atomicity + stats optimization) are in `scripts/17-add-optimized-functions.sql`.

### Sorteo state machine

States: `activo` → `completo` → `sorteado` (or `cerrado` for manual closure).

- Transition to `completo` happens when `chancesVendidas >= total_chances`
- Transition to `sorteado` is triggered by the Vercel Cron (`/api/verificar-sorteos`, runs daily at 14:00 UTC) which calls the Playwright scraper to fetch the first number from Quiniela Buenos Aires and find the matching buyer

### Payment flows

Two payment methods co-exist:
1. **MercadoPago** — numbers assigned immediately on payment confirmation webhook (`/api/confirmar-pago`)
2. **Transferencia bancaria** — buyer uploads a payment proof; numbers are assigned only when admin approves via backoffice (`aprobarTransferencia` in `lib/database.ts`)

A third, free entry path also exists:
3. **Participación gratuita** (`/free` → `/api/participacion-gratuita`, `crearCompradorGratuito` in `lib/database.ts`) — a `comprador` with `cantidad_chances = 1`, `precio_pagado = 0`, `estado_pago = 'pagado'` (so it enters the pool and is eligible to win) and `metodo_pago = 'gratuito'` (the distinguishing marker, used only for stats). Survey answers + address are stored in the `datos_encuesta` JSONB column (NULL for purchases). Limited to one entry per email per sorteo via `existeParticipacionGratuita`. Because they are `estado_pago = 'pagado'`, free entries DO count toward `chancesVendidas`/completion (legal "igualdad de condiciones"). Schema in `scripts/21-add-participacion-gratuita.sql`.

### Pages and routes

- `/` (`app/page.tsx`) — public landing: sorteo info, pack selection, buyer lookup by email
- `/backoffice` (`app/backoffice/page.tsx`) — admin panel (password-protected client-side via `components/admin-login.tsx`); manages buyers, transfers, images, sorteo settings, winner selection
- `/pago/exito|error|pendiente` — MercadoPago redirect pages
- `/free` (`app/free/page.tsx`) — free-participation page (replaces the old Google Form QR). Replicates the marketing survey; on submit assigns exactly ONE number from the same pool and emails a confirmation. Posts to `/api/participacion-gratuita`.
- `/terminos` — terms of service

API routes live in `app/api/`. Each corresponds to a specific action (create sorteo, confirm payment, upload image, etc.).

### Image storage

Images are uploaded to Vercel Blob via `/api/upload-image`. Sorteos support one main image and up to 8 carousel images (`carousel_image_1`…`carousel_image_8` columns on `sorteos`).

### Important invariants

- **Number uniqueness is enforced at the PostgreSQL level** via the `generar_numeros_unicos_atomico` function and a trigger (`04-trigger-validacion-duplicados.sql`). Never bypass these by inserting `numeros_asignados` directly without going through `generarNumerosUnicos()`.
- Deleting a `compradores` row automatically frees its numbers for reassignment (no separate number-tracking table).
- Buyers with `es_ganador = true` cannot be deleted.
