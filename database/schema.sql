-- ================================================
-- PetCare Database Schema (Modo Híbrido - Sem Auth)
-- Execute no Supabase SQL Editor
-- ================================================

-- Tabela de dispositivos/pets (cada dispositivo = um pet)
CREATE TABLE IF NOT EXISTS devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    breed TEXT,
    photo_data TEXT,  -- Armazena base64 da foto (ou null)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de estatísticas diárias por dispositivo
CREATE TABLE IF NOT EXISTS device_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    date DATE NOT NULL,
    happiness INTEGER DEFAULT 50,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    completed_tasks JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_device_stats_device_id ON device_stats(device_id);
CREATE INDEX IF NOT EXISTS idx_device_stats_date ON device_stats(date);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- Permite acesso público com anon key
-- ================================================

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para devices
CREATE POLICY "Allow public read devices" ON devices
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert devices" ON devices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update devices" ON devices
    FOR UPDATE USING (true);

-- Políticas para device_stats
CREATE POLICY "Allow public read device_stats" ON device_stats
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert device_stats" ON device_stats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update device_stats" ON device_stats
    FOR UPDATE USING (true);

-- ================================================
-- TRIGGER para updated_at automático
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS devices_updated_at ON devices;
CREATE TRIGGER devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS device_stats_updated_at ON device_stats;
CREATE TRIGGER device_stats_updated_at
    BEFORE UPDATE ON device_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
