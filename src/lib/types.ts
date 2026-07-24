export interface EnvironmentalReport {
  id?: string;
  created_at?: string;
  email: string;
  description: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  photo_urls: string[];
  comuna?: string;
  destination_email?: string;
  status?: 'pendiente' | 'en_revision' | 'resuelto';
}

export interface PhotoFile {
  id: string;
  file: File;
  previewUrl: string;
  base64Url?: string;
}
