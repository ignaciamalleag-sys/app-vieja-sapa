-- ==========================================================
-- SCRIPT DE CONFIGURACIÓN SUPABASE - REPORTES VIEJA SAPA
-- ==========================================================

-- 1. Crear tabla de reportes
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    google_maps_url TEXT NOT NULL,
    photo_urls TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_revision', 'resuelto'))
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para lecturas y escrituras públicas (Reportes comunitarios)
CREATE POLICY "Permitir inserción pública de reportes" ON public.reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura pública de reportes" ON public.reports
    FOR SELECT USING (true);


-- 2. Crear Storage Bucket para imágenes 'report-photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de seguridad para el Bucket de imágenes
CREATE POLICY "Permitir subida pública de imágenes" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'report-photos');

CREATE POLICY "Permitir lectura pública de imágenes" ON storage.objects
    FOR SELECT USING (bucket_id = 'report-photos');
