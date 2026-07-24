import comunasDict from '@/data/comunas-correos.json';

export interface ComunaInfo {
  comunaName: string;
  email: string;
  isFoundInDict: boolean;
  rawAddressDetails?: any;
}

const typedComunasDict: Record<string, string> = comunasDict;

/**
 * Normaliza cadenas para comparaciones de comuna (elimina tildes, prefijos 'Comuna de', espacios extra)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^comuna\s+de\s+/i, '')
    .replace(/^ilustre\s+municipalidad\s+de\s+/i, '')
    .replace(/^municipalidad\s+de\s+/i, '')
    .trim();
}

/**
 * Obtiene la lista completa de comunas soportadas en el diccionario
 */
export function getAllComunasList(): string[] {
  return Object.keys(typedComunasDict);
}

/**
 * Obtiene el correo asignado a una comuna por nombre
 */
export function getCorreoByComuna(comunaName: string): string {
  const normalizedSearch = normalizeString(comunaName);
  const foundKey = Object.keys(typedComunasDict).find(
    (key) => normalizeString(key) === normalizedSearch
  );

  if (foundKey) {
    return typedComunasDict[foundKey];
  }

  return process.env.NEXT_PUBLIC_DEFAULT_EMAIL || 'maepv.pruebas@gmail.com';
}

/**
 * Realiza reverse geocoding con alta precisión (zoom=18 nivel calle/edificio)
 * y resolución inteligente de jerarquía de dirección para comunas de Chile.
 */
export async function getComunaInfoFromCoordinates(
  lat: number,
  lng: number
): Promise<ComunaInfo> {
  try {
    // zoom=18 para máxima precisión a nivel de calle/manzana
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es-CL,es;q=0.9',
          'User-Agent': 'ReportesViejaSapaApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP en Nominatim: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    // Jerarquía de campos donde Nominatim devuelve la comuna en Chile
    const candidates = [
      address.city_district,
      address.suburb,
      address.town,
      address.city,
      address.municipality,
      address.quarter,
      address.neighbourhood,
      address.county,
    ].filter(Boolean) as string[];

    // Buscar coincidencia normalizada en la lista de comunas soportadas
    for (const candidate of candidates) {
      const normCand = normalizeString(candidate);
      const matchedKey = Object.keys(typedComunasDict).find(
        (key) => normalizeString(key) === normCand
      );

      if (matchedKey) {
        return {
          comunaName: matchedKey,
          email: typedComunasDict[matchedKey],
          isFoundInDict: true,
          rawAddressDetails: address,
        };
      }
    }

    // Si ninguna clave coincide directamente, tomar la primera entidad administrativa candidata
    const rawDetectedName = candidates[0] || 'Santiago';
    return {
      comunaName: rawDetectedName,
      email: getCorreoByComuna(rawDetectedName),
      isFoundInDict: false,
      rawAddressDetails: address,
    };
  } catch (error) {
    console.warn('Error en reverse geocoding Nominatim:', error);
    return {
      comunaName: 'Santiago',
      email: typedComunasDict['Santiago'] || 'maepv.pruebas@gmail.com',
      isFoundInDict: true,
    };
  }
}
