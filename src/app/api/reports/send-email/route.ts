import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, description, latitude, longitude, google_maps_url, photo_urls } = body;

    if (!email || !description || latitude === undefined || longitude === undefined || !photo_urls || photo_urls.length === 0) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (email, gps, descripción y al menos 1 foto).' },
        { status: 400 }
      );
    }

    const destinationEmail = process.env.DESTINATION_EMAIL || 'maepv.pruebas@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;

    // Render HTML content for the email
    const photosHtml = photo_urls
      .map(
        (url: string, index: number) => `
        <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background-color: #f8fafc;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #475569;">Foto #${index + 1}:</p>
          <a href="${url}" target="_blank" style="display: block; margin-bottom: 8px;">
            <img src="${url}" alt="Evidencia #${index + 1}" style="max-width: 100%; height: auto; max-height: 350px; border-radius: 6px; object-fit: cover; display: block;" />
          </a>
          <a href="${url}" target="_blank" style="font-size: 12px; color: #059669; text-decoration: underline; word-break: break-all;">
            Abrir imagen en alta resolución ↗
          </a>
        </div>`
      )
      .join('');

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
          .badge { display: inline-block; background-color: #fef08a; color: #854d0e; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-top: 10px; }
          .content { padding: 24px; }
          .field-group { margin-bottom: 20px; }
          .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
          .value { font-size: 16px; color: #0f172a; font-weight: 500; }
          .description-box { background-color: #f8fafc; border-left: 4px solid #10b981; padding: 14px; border-radius: 4px; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
          .btn-maps { display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 20px; border-radius: 8px; font-size: 14px; margin-top: 8px; box-shadow: 0 2px 5px rgba(5,150,105,0.3); }
          .footer { background-color: #f8fafc; text-align: center; padding: 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reportes Vieja Sapa</h1>
            <p>Alerta de Fiscalización Ciudadana Ambiental</p>
            <span class="badge">Nuevo Reporte Recibido</span>
          </div>
          <div class="content">
            <div class="field-group">
              <div class="label">Vecino Denunciante</div>
              <div class="value">${email}</div>
            </div>

            <div class="field-group">
              <div class="label">Ubicación GPS Exacta</div>
              <div class="value">Latitud: ${latitude}, Longitud: ${longitude}</div>
              <a href="${google_maps_url}" target="_blank" class="btn-maps">
                📍 Ver Ubicación en Google Maps
              </a>
            </div>

            <div class="field-group">
              <div class="label">Descripción de la Irregularidad</div>
              <div class="description-box">${description}</div>
            </div>

            <div class="field-group">
              <div class="label">Evidencia Fotográfica (${photo_urls.length} foto/s)</div>
              <div style="margin-top: 12px;">
                ${photosHtml}
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Reportes Vieja Sapa • PWA Social e Impacto Ambiental</p>
            <p>Fecha de emisión: ${new Date().toLocaleString('es-CL')}</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send via Resend API if API Key is configured
    if (resendApiKey && resendApiKey !== 're_123456789') {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: 'Reportes Vieja Sapa <onboarding@resend.dev>',
        to: [destinationEmail],
        subject: `🚨 [Reporte Ambiental] Nuevo desvío informado por ${email}`,
        html: htmlTemplate,
      });

      return NextResponse.json({
        success: true,
        message: `Correo enviado exitosamente a ${destinationEmail}`,
        resendData: data,
      });
    }

    // Demo / fallback mode logging
    console.log('--- SIMULATED EMAIL SENT TO MAEPV.PRUEBAS@GMAIL.COM ---');
    console.log(`To: ${destinationEmail}`);
    console.log(`From: ${email}`);
    console.log(`GPS: ${google_maps_url}`);
    console.log(`Photos: ${photo_urls.length}`);

    return NextResponse.json({
      success: true,
      simulated: true,
      message: `Modo de prueba: Notificación de reporte generada hacia ${destinationEmail} (Configura RESEND_API_KEY en .env.local para envío directo).`,
    });
  } catch (error: any) {
    console.error('Error enviando correo API Route:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al procesar el correo.' },
      { status: 500 }
    );
  }
}
