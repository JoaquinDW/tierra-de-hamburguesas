-- ============================================================================
-- SETUP COMPLETO - Tierra de Hamburguesas (sorteos)
-- ============================================================================
-- Script único consolidado de las migraciones 01..22.
-- Idempotente: se puede correr varias veces sin romper.
-- Pegar entero en el SQL Editor de Supabase y ejecutar.
--
-- NOTA: se omiten 02-fix-duplicate-numbers y 03-fix-duplicate-numbers-optimized
-- (funciones de diagnóstico/reparación de datos viejos). La versión final y
-- correcta de generar_numeros_unicos_atomico es la de 18 (advisory locks),
-- incluida más abajo.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 01 - TABLAS BASE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sorteos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  total_chances INTEGER NOT NULL DEFAULT 150,
  precio_6_chances INTEGER NOT NULL DEFAULT 21000,
  precio_12_chances INTEGER NOT NULL DEFAULT 42000,
  precio_24_chances INTEGER NOT NULL DEFAULT 84000,
  fecha_sorteo DATE,
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sorteo_id UUID REFERENCES sorteos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cantidad_chances INTEGER NOT NULL,
  numeros_asignados INTEGER[] NOT NULL,
  precio_pagado INTEGER NOT NULL,
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  mercadopago_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compradores_sorteo_id ON compradores(sorteo_id);
CREATE INDEX IF NOT EXISTS idx_compradores_email ON compradores(email);
CREATE INDEX IF NOT EXISTS idx_compradores_estado_pago ON compradores(estado_pago);

INSERT INTO sorteos (nombre, descripcion, total_chances, fecha_sorteo)
VALUES (
  'T-SHIRT 150M - SORTEO EXCLUSIVO',
  'Sorteo exclusivo de remera premium edición limitada',
  9999,
  '2025-02-15'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 02 - CAMPO IMAGEN
-- ============================================================================
ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
UPDATE sorteos SET imagen_url = '/placeholder.jpg' WHERE imagen_url IS NULL;

-- ============================================================================
-- 03 - ESTADOS DEL SORTEO + GANADOR
-- ============================================================================
ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'activo';
UPDATE sorteos SET estado = 'activo' WHERE estado IS NULL;
CREATE INDEX IF NOT EXISTS idx_sorteos_estado ON sorteos(estado);

ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS ganador_id UUID REFERENCES compradores(id);
ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS numero_ganador INTEGER;
ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS fecha_sorteo_realizado TIMESTAMP WITH TIME ZONE;
ALTER TABLE compradores ADD COLUMN IF NOT EXISTS es_ganador BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_compradores_ganador ON compradores(es_ganador);
COMMENT ON COLUMN sorteos.estado IS 'Estados: activo, completo, sorteado, cerrado';

-- ============================================================================
-- 04 - TELEFONO
-- ============================================================================
ALTER TABLE compradores ADD COLUMN IF NOT EXISTS telefono TEXT;
COMMENT ON COLUMN compradores.telefono IS 'Número de teléfono del comprador';

-- ============================================================================
-- 05 - CAMPOS TRANSFERENCIA
-- ============================================================================
ALTER TABLE compradores
  ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20) DEFAULT 'mercadopago',
  ADD COLUMN IF NOT EXISTS comprobante_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS estado_transferencia VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fecha_transferencia TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS admin_revisor VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notas_admin TEXT DEFAULT NULL;

-- ============================================================================
-- 06 - CANTIDADES DE PACKS
-- ============================================================================
ALTER TABLE sorteos
  ADD COLUMN IF NOT EXISTS cantidad_pack_1 INTEGER DEFAULT 6,
  ADD COLUMN IF NOT EXISTS cantidad_pack_2 INTEGER DEFAULT 12,
  ADD COLUMN IF NOT EXISTS cantidad_pack_3 INTEGER DEFAULT 24;

UPDATE sorteos
SET cantidad_pack_1 = 6, cantidad_pack_2 = 12, cantidad_pack_3 = 24
WHERE cantidad_pack_1 IS NULL OR cantidad_pack_2 IS NULL OR cantidad_pack_3 IS NULL;

ALTER TABLE sorteos
  ALTER COLUMN cantidad_pack_1 SET NOT NULL,
  ALTER COLUMN cantidad_pack_2 SET NOT NULL,
  ALTER COLUMN cantidad_pack_3 SET NOT NULL;

-- ============================================================================
-- 07 - TITULO REMERA
-- ============================================================================
ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS titulo_remera VARCHAR(255) DEFAULT 'Remera Exclusiva';
UPDATE sorteos SET titulo_remera = 'Remera Exclusiva' WHERE titulo_remera IS NULL;
ALTER TABLE sorteos ALTER COLUMN titulo_remera SET NOT NULL;
COMMENT ON COLUMN sorteos.titulo_remera IS 'Título personalizable que aparece debajo de la imagen de la remera';

-- ============================================================================
-- 08 - SUPABASE STORAGE (buckets + políticas)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('sorteo-images', 'sorteo-images', true),
  ('comprobantes', 'comprobantes', true),
  ('tshirt-previews', 'tshirt-previews', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
CREATE POLICY "Public upload access" ON storage.objects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update access" ON storage.objects;
CREATE POLICY "Public update access" ON storage.objects FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete access" ON storage.objects;
CREATE POLICY "Public delete access" ON storage.objects FOR DELETE USING (true);

-- ============================================================================
-- 09 - INDICES DE IMAGENES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sorteos_imagen_url ON sorteos(imagen_url);
CREATE INDEX IF NOT EXISTS idx_compradores_comprobante_url ON compradores(comprobante_url);

-- ============================================================================
-- 10 + 11 - IMAGENES DE CARRUSEL (1..8)
-- ============================================================================
ALTER TABLE sorteos
  ADD COLUMN IF NOT EXISTS carousel_image_1 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_image_2 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_image_3 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_image_4 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_image_5 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_image_6 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_image_7 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS carousel_image_8 TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_sorteos_carousel_images
  ON sorteos(carousel_image_1, carousel_image_2, carousel_image_3);

-- ============================================================================
-- 12 - INSTAGRAM + EMAIL OPCIONAL
-- ============================================================================
ALTER TABLE compradores ADD COLUMN IF NOT EXISTS instagram_username VARCHAR(255);
ALTER TABLE compradores ALTER COLUMN email DROP NOT NULL;
COMMENT ON COLUMN compradores.instagram_username IS 'Usuario de Instagram del comprador (sin @). Se usa cuando el comprador elige Instagram como método de contacto en lugar de WhatsApp';
COMMENT ON COLUMN compradores.email IS 'Email del comprador (opcional). El usuario debe proporcionar al menos un método de contacto: telefono (WhatsApp) o instagram_username';

-- ============================================================================
-- 13 - VISIBILIDAD DE PACKS
-- ============================================================================
ALTER TABLE sorteos
  ADD COLUMN IF NOT EXISTS pack_1_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS pack_2_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS pack_3_visible BOOLEAN DEFAULT true;

UPDATE sorteos
SET pack_1_visible = true, pack_2_visible = false, pack_3_visible = false
WHERE estado = 'activo';

-- ============================================================================
-- 14 - DESCRIPCIONES DE PACKS
-- ============================================================================
ALTER TABLE sorteos
  ADD COLUMN IF NOT EXISTS descripcion_pack_1 TEXT DEFAULT 'Honda Wave 2025',
  ADD COLUMN IF NOT EXISTS descripcion_pack_2 TEXT DEFAULT 'Honda Wave 2025 + 5 oportunidades en pre-venta Nueva Titan 2018',
  ADD COLUMN IF NOT EXISTS descripcion_pack_3 TEXT DEFAULT 'Honda Wave 2025 + 5 chances pre-venta New Titan 2018';

UPDATE sorteos SET
  descripcion_pack_1 = COALESCE(descripcion_pack_1, 'Honda Wave 2025'),
  descripcion_pack_2 = COALESCE(descripcion_pack_2, 'Honda Wave 2025 + 5 oportunidades en pre-venta Nueva Titan 2018'),
  descripcion_pack_3 = COALESCE(descripcion_pack_3, 'Honda Wave 2025 + 5 chances pre-venta New Titan 2018')
WHERE descripcion_pack_1 IS NULL OR descripcion_pack_2 IS NULL OR descripcion_pack_3 IS NULL;

-- ============================================================================
-- 15 - GANADORES PASADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ganadores_pasados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_ganador TEXT NOT NULL,
  premio TEXT NOT NULL,
  precio_premio TEXT NOT NULL,
  fecha_sorteo DATE NOT NULL,
  numero_ganador INTEGER NOT NULL,
  imagen_1_url TEXT,
  imagen_2_url TEXT,
  imagen_3_url TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_ganadores_pasados_orden ON ganadores_pasados(orden DESC);
CREATE INDEX IF NOT EXISTS idx_ganadores_pasados_visible ON ganadores_pasados(visible);

ALTER TABLE ganadores_pasados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ganadores visibles son públicos" ON ganadores_pasados;
CREATE POLICY "Ganadores visibles son públicos" ON ganadores_pasados
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Permitir todas las operaciones en ganadores" ON ganadores_pasados;
CREATE POLICY "Permitir todas las operaciones en ganadores" ON ganadores_pasados
  FOR ALL USING (true);

CREATE OR REPLACE FUNCTION actualizar_ganadores_pasados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_ganadores_pasados_updated_at ON ganadores_pasados;
CREATE TRIGGER trigger_actualizar_ganadores_pasados_updated_at
  BEFORE UPDATE ON ganadores_pasados
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_ganadores_pasados_updated_at();

-- Ganador de ejemplo (solo si la tabla está vacía)
INSERT INTO ganadores_pasados (nombre_ganador, premio, precio_premio, fecha_sorteo, numero_ganador, orden, visible)
SELECT 'Pedro Agustín Sáez', 'iPhone 14 Pro Max nuevo en caja', '$10 mil pesos', '2025-10-10', 3966, 1, true
WHERE NOT EXISTS (SELECT 1 FROM ganadores_pasados);

-- ============================================================================
-- 16 - GANADORES EXPRESS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ganadores_express (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sorteo_id UUID REFERENCES sorteos(id) ON DELETE CASCADE,
  numero_ganador INTEGER NOT NULL,
  nombre_ganador TEXT,
  premio_monto TEXT NOT NULL,
  fecha_premio DATE NOT NULL DEFAULT CURRENT_DATE,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ganadores_express_sorteo ON ganadores_express(sorteo_id);
CREATE INDEX IF NOT EXISTS idx_ganadores_express_numero ON ganadores_express(numero_ganador);
CREATE INDEX IF NOT EXISTS idx_ganadores_express_visible ON ganadores_express(visible);
CREATE INDEX IF NOT EXISTS idx_ganadores_express_created ON ganadores_express(created_at DESC);

ALTER TABLE ganadores_express ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ganadores_express_select_visible" ON ganadores_express;
CREATE POLICY "ganadores_express_select_visible" ON ganadores_express
  FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "ganadores_express_all_operations" ON ganadores_express;
CREATE POLICY "ganadores_express_all_operations" ON ganadores_express
  FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ganadores_express_updated_at ON ganadores_express;
CREATE TRIGGER set_ganadores_express_updated_at
  BEFORE UPDATE ON ganadores_express
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- 19 - CONFIGURACION (key-value) -- antes de 17 porque 17 no la usa,
-- pero la dejamos aquí junto al resto de tablas
-- ============================================================================
CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracion (clave, valor) VALUES ('alias_transferencia', 'sosamotos')
  ON CONFLICT (clave) DO NOTHING;
INSERT INTO configuracion (clave, valor) VALUES ('titular_transferencia', 'Agustín Sosa')
  ON CONFLICT (clave) DO NOTHING;

-- ============================================================================
-- 20 - GANADOR NOMBRE EN SORTEOS
-- ============================================================================
ALTER TABLE sorteos ADD COLUMN IF NOT EXISTS ganador_nombre TEXT;

-- ============================================================================
-- 21 - PACK 4 Y 5
-- ============================================================================
ALTER TABLE sorteos
  ADD COLUMN IF NOT EXISTS cantidad_pack_4 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_pack_4 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pack_4_visible BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS descripcion_pack_4 TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cantidad_pack_5 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_pack_5 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pack_5_visible BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS descripcion_pack_5 TEXT DEFAULT '';

-- ============================================================================
-- 21 - PARTICIPACION GRATUITA (/free)
-- ============================================================================
ALTER TABLE compradores ADD COLUMN IF NOT EXISTS datos_encuesta JSONB;
CREATE INDEX IF NOT EXISTS idx_compradores_gratuito_email
  ON compradores (sorteo_id, lower(email))
  WHERE metodo_pago = 'gratuito';

-- ============================================================================
-- 04 (trigger) - VALIDACION DE NUMEROS DUPLICADOS (última línea de defensa)
-- ============================================================================
CREATE OR REPLACE FUNCTION validar_numeros_unicos_antes_cambio()
RETURNS TRIGGER AS $$
DECLARE
  v_numeros_duplicados INTEGER[];
  v_total_duplicados INTEGER;
BEGIN
  IF NEW.estado_pago = 'pagado' AND array_length(NEW.numeros_asignados, 1) > 0 THEN
    SELECT array_agg(DISTINCT numero)
    INTO v_numeros_duplicados
    FROM (
      SELECT unnest(numeros_asignados) as numero
      FROM compradores
      WHERE sorteo_id = NEW.sorteo_id
        AND estado_pago = 'pagado'
        AND id != NEW.id
    ) AS numeros_existentes
    WHERE numero = ANY(NEW.numeros_asignados);

    IF v_numeros_duplicados IS NOT NULL THEN
      v_total_duplicados := array_length(v_numeros_duplicados, 1);
      RAISE EXCEPTION
        'VALIDACIÓN FALLIDA: Se detectaron % número(s) duplicado(s) en el sorteo %: %. Operación ABORTADA.',
        v_total_duplicados, NEW.sorteo_id, v_numeros_duplicados
        USING ERRCODE = '23505';
    END IF;

    WITH numeros_del_comprador AS (
      SELECT unnest(NEW.numeros_asignados) as numero
    )
    SELECT array_agg(numero)
    INTO v_numeros_duplicados
    FROM numeros_del_comprador
    GROUP BY numero
    HAVING COUNT(*) > 1;

    IF v_numeros_duplicados IS NOT NULL THEN
      RAISE EXCEPTION
        'VALIDACIÓN FALLIDA: El comprador % tiene números DUPLICADOS INTERNAMENTE: %. Operación ABORTADA.',
        NEW.id, v_numeros_duplicados
        USING ERRCODE = '23505';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_numeros_unicos ON compradores;
CREATE TRIGGER trigger_validar_numeros_unicos
  BEFORE INSERT OR UPDATE ON compradores
  FOR EACH ROW
  EXECUTE FUNCTION validar_numeros_unicos_antes_cambio();

-- ============================================================================
-- 18 - GENERAR NUMEROS UNICOS ATOMICO (versión final con advisory locks)
-- Reemplaza las versiones de 02-fix / 03-fix.
-- ============================================================================
CREATE OR REPLACE FUNCTION generar_numeros_unicos_atomico(
  p_sorteo_id UUID,
  p_cantidad INTEGER
)
RETURNS INTEGER[] AS $$
DECLARE
  v_numeros_ocupados INTEGER[];
  v_numeros_disponibles INTEGER[];
  v_numeros_seleccionados INTEGER[] := ARRAY[]::INTEGER[];
  v_total_chances INTEGER;
  v_random_index INTEGER;
  v_lock_acquired BOOLEAN;
BEGIN
  SELECT pg_try_advisory_xact_lock(hashtext(p_sorteo_id::text)) INTO v_lock_acquired;
  IF NOT v_lock_acquired THEN
    RAISE EXCEPTION 'No se pudo obtener el lock para el sorteo. Intenta nuevamente.';
  END IF;

  SELECT total_chances INTO v_total_chances FROM sorteos WHERE id = p_sorteo_id;
  IF v_total_chances IS NULL THEN
    v_total_chances := 9999;
  END IF;

  WITH numeros_expandidos AS (
    SELECT DISTINCT unnest(c.numeros_asignados) as numero
    FROM compradores c
    WHERE c.sorteo_id = p_sorteo_id AND c.estado_pago = 'pagado'
  )
  SELECT COALESCE(array_agg(numero ORDER BY numero), ARRAY[]::INTEGER[])
  INTO v_numeros_ocupados
  FROM numeros_expandidos;

  SELECT array_agg(num ORDER BY num)
  INTO v_numeros_disponibles
  FROM generate_series(0, v_total_chances) AS num
  WHERE num != ALL(v_numeros_ocupados);

  IF array_length(v_numeros_disponibles, 1) IS NULL OR array_length(v_numeros_disponibles, 1) < p_cantidad THEN
    RAISE EXCEPTION 'No hay suficientes números disponibles. Solicitados: %, Disponibles: %',
      p_cantidad, COALESCE(array_length(v_numeros_disponibles, 1), 0);
  END IF;

  FOR i IN 1..p_cantidad LOOP
    v_random_index := 1 + floor(random() * array_length(v_numeros_disponibles, 1))::INTEGER;
    v_numeros_seleccionados := array_append(v_numeros_seleccionados, v_numeros_disponibles[v_random_index]);
    v_numeros_disponibles := array_cat(
      v_numeros_disponibles[1:v_random_index-1],
      v_numeros_disponibles[v_random_index+1:array_length(v_numeros_disponibles, 1)]
    );
  END LOOP;

  SELECT array_agg(num ORDER BY num)
  INTO v_numeros_seleccionados
  FROM unnest(v_numeros_seleccionados) AS num;

  DECLARE
    v_duplicados_encontrados INTEGER[];
    v_numeros_buenos INTEGER[];
    v_cantidad_reemplazar INTEGER;
    v_numeros_reemplazo INTEGER[];
    v_todos_ocupados INTEGER[];
  BEGIN
    SELECT array_agg(DISTINCT numero)
    INTO v_duplicados_encontrados
    FROM (
      SELECT unnest(c.numeros_asignados) as numero
      FROM compradores c
      WHERE c.sorteo_id = p_sorteo_id AND c.estado_pago = 'pagado'
    ) AS todos_los_numeros
    WHERE numero = ANY(v_numeros_seleccionados);

    IF v_duplicados_encontrados IS NOT NULL AND array_length(v_duplicados_encontrados, 1) > 0 THEN
      RAISE WARNING 'Se detectaron duplicados %, regenerando números...', v_duplicados_encontrados;

      SELECT array_agg(num)
      INTO v_numeros_buenos
      FROM unnest(v_numeros_seleccionados) num
      WHERE num != ALL(v_duplicados_encontrados);

      v_cantidad_reemplazar := array_length(v_duplicados_encontrados, 1);

      SELECT array_agg(DISTINCT numero)
      INTO v_todos_ocupados
      FROM (
        SELECT unnest(c.numeros_asignados) as numero
        FROM compradores c
        WHERE c.sorteo_id = p_sorteo_id AND c.estado_pago = 'pagado'
        UNION
        SELECT unnest(COALESCE(v_numeros_buenos, ARRAY[]::INTEGER[])) as numero
      ) sub;

      SELECT array_agg(num ORDER BY random())
      INTO v_numeros_reemplazo
      FROM generate_series(0, v_total_chances) AS num
      WHERE num != ALL(v_todos_ocupados)
      LIMIT v_cantidad_reemplazar;

      IF array_length(v_numeros_reemplazo, 1) < v_cantidad_reemplazar THEN
        RAISE EXCEPTION 'No hay suficientes números disponibles para reemplazar duplicados';
      END IF;

      v_numeros_seleccionados := COALESCE(v_numeros_buenos, ARRAY[]::INTEGER[]) || v_numeros_reemplazo;

      SELECT array_agg(num ORDER BY num)
      INTO v_numeros_seleccionados
      FROM unnest(v_numeros_seleccionados) num;

      RAISE WARNING 'Duplicados reemplazados. Nuevos números: %', v_numeros_seleccionados;
    END IF;
  END;

  RETURN v_numeros_seleccionados;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generar_numeros_unicos_atomico IS
'Genera números únicos para un sorteo de forma atómica usando advisory locks en lugar de FOR UPDATE.';

-- ============================================================================
-- 17 - FUNCIONES OPTIMIZADAS (stats / egress) + índices
-- ============================================================================
CREATE OR REPLACE FUNCTION obtener_estadisticas_sorteo(sorteo_id_param UUID)
RETURNS TABLE (total_compradores BIGINT, chances_vendidas BIGINT, total_recaudado NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT id)::BIGINT as total_compradores,
    (SELECT COUNT(DISTINCT numero)::BIGINT
     FROM compradores c, unnest(c.numeros_asignados) AS numero
     WHERE c.sorteo_id = sorteo_id_param AND c.estado_pago = 'pagado')::BIGINT as chances_vendidas,
    COALESCE(SUM(precio_pagado), 0)::NUMERIC as total_recaudado
  FROM compradores
  WHERE sorteo_id = sorteo_id_param AND estado_pago = 'pagado';
END;
$$ LANGUAGE plpgsql STABLE;
COMMENT ON FUNCTION obtener_estadisticas_sorteo IS
'Calcula estadísticas del sorteo directamente en el servidor para reducir egress.';

CREATE OR REPLACE FUNCTION contar_compradores_sorteo(sorteo_id_param UUID, solo_pagados BOOLEAN DEFAULT TRUE)
RETURNS BIGINT AS $$
BEGIN
  IF solo_pagados THEN
    RETURN (SELECT COUNT(*)::BIGINT FROM compradores WHERE sorteo_id = sorteo_id_param AND estado_pago = 'pagado');
  ELSE
    RETURN (SELECT COUNT(*)::BIGINT FROM compradores WHERE sorteo_id = sorteo_id_param);
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
COMMENT ON FUNCTION contar_compradores_sorteo IS
'Cuenta compradores de un sorteo sin traer todos los registros al cliente.';

CREATE OR REPLACE FUNCTION contar_chances_vendidas(sorteo_id_param UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT numero)::BIGINT
    FROM compradores c, unnest(c.numeros_asignados) AS numero
    WHERE c.sorteo_id = sorteo_id_param AND c.estado_pago = 'pagado'
  );
END;
$$ LANGUAGE plpgsql STABLE;
COMMENT ON FUNCTION contar_chances_vendidas IS
'Cuenta el total de chances únicas vendidas sin traer los arrays al cliente.';

CREATE OR REPLACE FUNCTION verificar_sorteo_completo(sorteo_id_param UUID)
RETURNS TABLE (completo BOOLEAN, total_chances INTEGER, chances_vendidas BIGINT, porcentaje_vendido NUMERIC) AS $$
DECLARE
  total_chances_sorteo INTEGER;
  chances_vendidas_count BIGINT;
BEGIN
  SELECT s.total_chances INTO total_chances_sorteo FROM sorteos s WHERE s.id = sorteo_id_param;
  SELECT contar_chances_vendidas(sorteo_id_param) INTO chances_vendidas_count;
  RETURN QUERY
  SELECT
    (chances_vendidas_count >= total_chances_sorteo) as completo,
    total_chances_sorteo as total_chances,
    chances_vendidas_count as chances_vendidas,
    CASE WHEN total_chances_sorteo > 0
      THEN ROUND((chances_vendidas_count::NUMERIC / total_chances_sorteo::NUMERIC * 100), 2)
      ELSE 0 END as porcentaje_vendido;
END;
$$ LANGUAGE plpgsql STABLE;
COMMENT ON FUNCTION verificar_sorteo_completo IS
'Verifica si un sorteo está completo y devuelve estadísticas de progreso.';

CREATE OR REPLACE FUNCTION obtener_ganadores_express_visibles(sorteo_id_param UUID DEFAULT NULL)
RETURNS TABLE (id UUID, numero_ganador INTEGER, nombre_ganador TEXT, premio_monto TEXT, fecha_premio DATE, created_at TIMESTAMPTZ) AS $$
BEGIN
  IF sorteo_id_param IS NULL THEN
    RETURN QUERY
    SELECT ge.id, ge.numero_ganador, ge.nombre_ganador, ge.premio_monto, ge.fecha_premio, ge.created_at
    FROM ganadores_express ge
    INNER JOIN sorteos s ON ge.sorteo_id = s.id
    WHERE ge.visible = true AND s.estado = 'activo'
    ORDER BY ge.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT ge.id, ge.numero_ganador, ge.nombre_ganador, ge.premio_monto, ge.fecha_premio, ge.created_at
    FROM ganadores_express ge
    WHERE ge.sorteo_id = sorteo_id_param AND ge.visible = true
    ORDER BY ge.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
COMMENT ON FUNCTION obtener_ganadores_express_visibles IS
'Obtiene solo los campos necesarios de ganadores express visibles.';

CREATE INDEX IF NOT EXISTS idx_compradores_sorteo_estado ON compradores(sorteo_id, estado_pago);
CREATE INDEX IF NOT EXISTS idx_compradores_numeros_asignados ON compradores USING GIN (numeros_asignados);
CREATE INDEX IF NOT EXISTS idx_ganadores_express_sorteo_visible ON ganadores_express(sorteo_id, visible) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_ganadores_pasados_visible_orden ON ganadores_pasados(visible, orden DESC) WHERE visible = true;

CREATE OR REPLACE FUNCTION obtener_resumen_sorteo_activo()
RETURNS TABLE (
  sorteo_id UUID, sorteo_nombre TEXT, total_chances INTEGER, estado TEXT,
  total_compradores BIGINT, chances_vendidas BIGINT, total_recaudado NUMERIC,
  porcentaje_completado NUMERIC, cantidad_ganadores_express BIGINT
) AS $$
DECLARE
  v_sorteo_activo_id UUID;
  v_total_chances INTEGER;
BEGIN
  SELECT s.id, s.total_chances INTO v_sorteo_activo_id, v_total_chances
  FROM sorteos s WHERE s.estado = 'activo' ORDER BY s.created_at DESC LIMIT 1;

  IF v_sorteo_activo_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH stats AS (SELECT * FROM obtener_estadisticas_sorteo(v_sorteo_activo_id)),
  ganadores_count AS (
    SELECT COUNT(*)::BIGINT as total FROM ganadores_express
    WHERE ganadores_express.sorteo_id = v_sorteo_activo_id AND visible = true
  )
  SELECT
    v_sorteo_activo_id, s.nombre::TEXT, s.total_chances, s.estado::TEXT,
    stats.total_compradores, stats.chances_vendidas, stats.total_recaudado,
    CASE WHEN s.total_chances > 0
      THEN ROUND((stats.chances_vendidas::NUMERIC / s.total_chances::NUMERIC * 100), 2)
      ELSE 0 END as porcentaje_completado,
    ganadores_count.total as cantidad_ganadores_express
  FROM sorteos s, stats, ganadores_count
  WHERE s.id = v_sorteo_activo_id;
END;
$$ LANGUAGE plpgsql STABLE;
COMMENT ON FUNCTION obtener_resumen_sorteo_activo IS
'Obtiene un resumen completo del sorteo activo en una sola consulta optimizada.';

GRANT EXECUTE ON FUNCTION obtener_estadisticas_sorteo TO anon, authenticated;
GRANT EXECUTE ON FUNCTION contar_compradores_sorteo TO anon, authenticated;
GRANT EXECUTE ON FUNCTION contar_chances_vendidas TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verificar_sorteo_completo TO anon, authenticated;
GRANT EXECUTE ON FUNCTION obtener_ganadores_express_visibles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION obtener_resumen_sorteo_activo TO anon, authenticated;

-- ============================================================================
-- 22 - RLS POLICIES (sorteos, compradores, configuracion)
-- ============================================================================
ALTER TABLE sorteos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas las operaciones en sorteos" ON sorteos;
CREATE POLICY "Permitir todas las operaciones en sorteos" ON sorteos
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE compradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas las operaciones en compradores" ON compradores;
CREATE POLICY "Permitir todas las operaciones en compradores" ON compradores
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas las operaciones en configuracion" ON configuracion;
CREATE POLICY "Permitir todas las operaciones en configuracion" ON configuracion
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- FIN
-- ============================================================================
