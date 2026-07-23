import { createClient } from '@supabase/supabase-js';
import { EnvironmentalReport } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
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
 * Saves a report to Supabase DB or LocalStorage fallback
 */
export async function saveReport(report: EnvironmentalReport): Promise<EnvironmentalReport> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          email: report.email,
          description: report.description,
          latitude: report.latitude,
          longitude: report.longitude,
          google_maps_url: report.google_maps_url,
          photo_urls: report.photo_urls,
          status: 'pendiente',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase DB Insert error:', error);
      throw new Error(`Error guardando reporte en Supabase: ${error.message}`);
    }

    return data as EnvironmentalReport;
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
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as EnvironmentalReport[];
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
