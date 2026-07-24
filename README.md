# 👁️ Reportes Vieja Sapa App - Web App (PWA) Social

Plataforma gratuita de impacto social diseñada para el reporte, vigilancia y fiscalización colaborativa de desvíos ambientales en espacios públicos (microbasurales, vertederos clandestinos, quema o escombros).

## 🚀 Características Principales

1. **Formulario de Denuncia Intuitivo**:
   - **Email del vecino**: Campo obligatorio con validación.
   - **Geolocalización GPS**: Captura automática de coordenadas con vista previa de mapa y enlace directo a Google Maps (`https://www.google.com/maps?q=lat,lng`).
   - **Descripción del problema**: Cuadro de texto para detallar la irregularidad.
   - **Evidencia Fotográfica**: Subida de hasta **3 fotos** con previsualización, compresión y opción de eliminación.
   - *Todos los campos son obligatorios.*

2. **Integración con Supabase & API de Correos**:
   - Guardado de reportes en la base de datos PostgreSQL de **Supabase** (`reports`).
   - Almacenamiento público de imágenes en el bucket `report-photos` de Supabase Storage.
   - Ruta API (`/api/reports/send-email`) que procesa y envía un correo formateado con enlaces directos e imágenes adjuntas/previsualizadas a `maepv.pruebas@gmail.com` usando **Resend**.

3. **PWA (Progressive Web App)**:
   - Instalable en smartphones (Android, iOS) y escritorio.
   - Manifiesto completo, iconos adaptativos y soporte de Service Worker offline.

4. **Publicación en GitHub**:
   - Repositorio oficial: [https://github.com/ignaciamalleag-sys/app-vieja-sapa](https://github.com/ignaciamalleag-sys/app-vieja-sapa)

---

## 🛠️ Estructura del Proyecto

```text
app-vieja-sapa/
├── public/
│   ├── manifest.json       # Manifiesto PWA
│   ├── sw.js               # Service Worker PWA
│   ├── icon-192.png        # Icono PWA
│   └── icon-512.png        # Icono PWA alta resolución
├── src/
│   ├── app/
│   │   ├── api/reports/send-email/route.ts  # API route para enviar correo a maepv.pruebas@gmail.com
│   │   ├── globals.css     # Estilos globales y Tailwind CSS
│   │   ├── layout.tsx      # Layout principal con PWA meta
│   │   └── page.tsx        # Página principal y navegación por pestañas
│   ├── components/
│   │   ├── Header.tsx      # Cabecera con estado online/offline e instalador PWA
│   │   ├── ReportForm.tsx  # Formulario principal con validación
│   │   ├── MapPicker.tsx   # Geolocalizador GPS y mapa interactivo
│   │   ├── PhotoUploader.tsx # Subida de hasta 3 fotos con previsualización
│   │   ├── ReportList.tsx  # Listado de reportes comunitarios y modal
│   │   └── Footer.tsx      # Pie de página y enlaces
│   └── lib/
│       ├── supabase.ts     # Cliente e integraciones de Supabase
│       └── types.ts        # Definición de tipos TypeScript
├── supabase-schema.sql     # Script SQL para tablas y buckets en Supabase
├── .env.local              # Variables de entorno
└── package.json
```

---

## 📦 Configuración de Supabase

Para conectar tu instancia propia de Supabase:
1. Ejecuta las sentencias contenidas en `supabase-schema.sql` desde el **SQL Editor** de tu consola de Supabase.
2. Agrega las credenciales en tu `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-llave-anonima
   RESEND_API_KEY=tu-llave-api-resend
   DESTINATION_EMAIL=maepv.pruebas@gmail.com
   ```

---

## 🐙 Publicación en GitHub

El proyecto está preparado para el repositorio:
`https://github.com/ignaciamalleag-sys/app-vieja-sapa.git`

```bash
git init
git add .
git commit -m "feat: inicializar PWA Reportes Vieja Sapa"
git branch -M main
git remote add origin https://github.com/ignaciamalleag-sys/app-vieja-sapa.git
git push -u origin main
```
