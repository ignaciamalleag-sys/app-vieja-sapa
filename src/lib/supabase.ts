import { createClient } from '@supabase/supabase-js';
import { EnvironmentalReport } from './types';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


/**
 * Uploads a photo file to Supabase Storage or returns base64 fallback URL
 */
export async function uploadReportPhoto(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('report-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.warn('Supabase storage upload error, falling back to data URL:', uploadError);
        return await fileToDataUrl(file);
      }

      const { data } = supabase.storage.from('report-photos').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Failed uploading image to Supabase storage, using fallback:', err);
      return await fileToDataUrl(file);
    }
  }

  // Fallback for offline or unconfigured environment
  return await fileToDataUrl(file);
}

/**
 * Saves a report to Supabase DB or LocalStorage fallback with automatic schema resilience
 */
export async function saveReport(report: EnvironmentalReport): Promise<EnvironmentalReport> {
  if (isSupabaseConfigured && supabase) {
    // Intentar inserción completa con comuna y destination_email
    const fullPayload: any = {
      email: report.email,
      description: report.description,
      latitude: report.latitude,
      longitude: report.longitude,
      google_maps_url: report.google_maps_url,
      photo_urls: report.photo_urls,
      comuna: report.comuna || 'Santiago',
      destination_email: report.destination_email,
      status: 'pendiente',
    };

    let { data, error } = await supabase
      .from('reports')
      .insert([fullPayload])
      .select()
      .single();

    // Si la tabla remota en Supabase no tiene la columna 'comuna' aún, reintentar con el esquema base
    if (error && (error.message.includes('comuna') || error.message.includes('destination_email') || error.code === 'PGRST204')) {
      console.warn('Columna comunitaria no encontrada en Supabase SQL schema. Reintentando inserción con campos base:', error.message);
      
      const basePayload = {
        email: report.email,
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        google_maps_url: report.google_maps_url,
        photo_urls: report.photo_urls,
        status: 'pendiente',
      };

      const retryRes = await supabase
        .from('reports')
        .insert([basePayload])
        .select()
        .single();

      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) {
      console.error('Supabase DB Insert error:', error);
      throw new Error(`Error guardando reporte en Supabase: ${error.message}`);
    }

    // Asegurar que la respuesta retorne los valores de comuna y correo de destino para la notificación
    return {
      ...(data as EnvironmentalReport),
      comuna: report.comuna,
      destination_email: report.destination_email,
    };
  }

  // LocalStorage fallback mode
  const localReports = getLocalReports();
  const newReport: EnvironmentalReport = {
    ...report,
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
    status: 'pendiente',
  };

  localReports.unshift(newReport);
  if (typeof window !== 'undefined') {
    localStorage.setItem('vieja_sapa_reports', JSON.stringify(localReports));
  }
  return newReport;
}

export function getLocalReports(): EnvironmentalReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('vieja_sapa_reports');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function fetchAllReports(): Promise<EnvironmentalReport[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as EnvironmentalReport[];
      }
      if (error) {
        console.warn('Supabase error, usando fallback local:', error.message);
      }
    } catch (err) {
      console.warn('Error conectando a Supabase, usando fallback local:', err);
    }
  }
  return getLocalReports();
}


function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
