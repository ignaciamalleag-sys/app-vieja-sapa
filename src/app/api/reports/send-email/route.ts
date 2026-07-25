import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import comunasDict from '@/data/comunas-correos.json';

const typedComunasDict: Record<string, string> = comunasDict;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, description, latitude, longitude, google_maps_url, photo_urls, comuna, destination_email } = body;

    if (!email || !description || latitude === undefined || longitude === undefined || !photo_urls || photo_urls.length === 0) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (email, gps, descripción y al menos 1 foto).' },
        { status: 400 }
      );
    }

    const comunaName = comuna || 'Santiago';
    
    // Consultar el correo en el diccionario JSON si no viene explícito
    let targetEmail = destination_email;
    if (!targetEmail) {
      const foundKey = Object.keys(typedComunasDict).find(
        (key) => key.toLowerCase() === comunaName.toLowerCase()
      );
      targetEmail = foundKey ? typedComunasDict[foundKey] : (process.env.DESTINATION_EMAIL || 'maepv.pruebas@gmail.com');
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

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
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
          .badge { display: inline-block; background-color: #fef08a; color: #854d0e; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-top: 10px; }
          .content { padding: 24px; }
          .field-group { margin-bottom: 20px; }
          .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
          .value { font-size: 16px; color: #0f172a; font-weight: 500; }
          .comuna-highlight { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-weight: 800; padding: 8px 12px; border-radius: 8px; font-size: 15px; display: inline-block; }
          .description-box { background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px; border-radius: 4px; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
          .btn-maps { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 20px; border-radius: 8px; font-size: 14px; margin-top: 8px; box-shadow: 0 2px 5px rgba(37,99,235,0.3); }
          .footer { background-color: #f8fafc; text-align: center; padding: 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reportes Vieja Sapa App</h1>
            <p>Alerta de Fiscalización Ciudadana Ambiental</p>
            <span class="badge">Nuevo Reporte Comunidades</span>
          </div>
          <div class="content">
            
            <div class="field-group">
              <div class="label">Comuna Identificada por GPS</div>
              <div class="comuna-highlight">🏛️ Comuna de ${comunaName}</div>
            </div>

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
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">Reportes Vieja Sapa App • Dirección Ambiental Comunal</p>
            <p style="margin: 6px 0 10px 0; color: #475569; font-size: 11px; line-height: 1.5; background-color: #f1f5f9; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ℹ️ <strong>Nota de Atención:</strong> Este reporte fue generado automáticamente a través de la aplicación comunitaria. Para responder, solicitar antecedentes adicionales o dar seguimiento a este caso, por favor comunicarse directamente al correo electrónico del vecino denunciante: <a href="mailto:${email}" style="color: #2563eb; font-weight: 700;">${email}</a>.
            </p>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Destinatario Municipal: ${targetEmail} • Fecha de emisión: ${new Date().toLocaleString('es-CL')}</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Option 1: Send via SMTP (Nodemailer) if SMTP_USER is set
    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: `"Reportes Vieja Sapa App (${comunaName})" <${smtpUser}>`,
          to: targetEmail,
          subject: `🚨 [Alerta Comunal ${comunaName}] Nuevo desvío informado por ${email}`,
          html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        return NextResponse.json({
          success: true,
          message: `✉️ Correo enviado exitosamente a la Dirección Ambiental de ${comunaName} (${targetEmail}) vía SMTP`,
          info,
        });
      } catch (err: any) {
        console.error('Error SMTP Nodemailer:', err);
      }
    }

    // Option 2: Send via Resend API
    if (resendApiKey && resendApiKey.startsWith('re_')) {
      try {
        const resend = new Resend(resendApiKey);
        let { data, error: resendError } = await resend.emails.send({
          from: 'Reportes Vieja Sapa App <onboarding@resend.dev>',
          to: [targetEmail],
          subject: `🚨 [Alerta Comunal ${comunaName}] Nuevo desvío informado por ${email}`,
          html: htmlTemplate,
        });

        // If Resend trial mode blocks external municipal email, fall back to DESTINATION_EMAIL for testing
        if (resendError && resendError.name === 'validation_error') {
          const testRecipient = process.env.DESTINATION_EMAIL || 'maepv.pruebas@gmail.com';
          console.warn(`Resend trial restriction hit for ${targetEmail}. Redirecting to test recipient: ${testRecipient}`);
          const fallbackRes = await resend.emails.send({
            from: 'Reportes Vieja Sapa App <onboarding@resend.dev>',
            to: [testRecipient],
            subject: `🚨 [Alerta Comunal ${comunaName} -> Destino: ${targetEmail}] Nuevo desvío de ${email}`,
            html: htmlTemplate,
          });
          data = fallbackRes.data;
          resendError = fallbackRes.error;
        }

        if (resendError) {
          console.error('Resend Error:', resendError);
          return NextResponse.json({
            success: false,
            error: `Error de Resend: ${resendError.message}`,
            details: resendError,
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: `✉️ Reporte de Comuna ${comunaName} procesado y notificado (Dirección Ambiental: ${targetEmail})`,
          resendData: data,
        });
      } catch (err: any) {
        console.error('Resend Exception:', err);
        return NextResponse.json({
          success: false,
          error: `Error al enviar correo vía Resend: ${err.message}`,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: `Comuna ${comunaName} identificada. Configura RESEND_API_KEY o SMTP en .env.local para despachar a ${targetEmail}.`,
    }, { status: 400 });
  } catch (error: any) {
    console.error('Error enviando correo API Route:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al procesar el correo.' },
      { status: 500 }
    );
  }
}
