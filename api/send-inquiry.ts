import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface InquiryBody {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  pdfBase64: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { company, name, email, phone, message, pdfBase64 } = req.body as InquiryBody;

    if (!company || !name || !email || !pdfBase64) {
      return res.status(400).json({
        success: false,
        message: 'Firma, Name, E-Mail und PDF sind Pflichtfelder.',
      });
    }

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    const { data, error } = await resend.emails.send({
      from: 'KPW Textil Veredeler <veredelung@veredelung.kp-workwear.com>',
      to: ['office@kp-workwear.com'],
      replyTo: email,
      subject: `Neue Veredelungs-Anfrage von ${escapeHtml(company)} – ${escapeHtml(name)}`,
      html: `
        <h2>Neue Veredelungs-Anfrage</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Firma</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(company)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">E-Mail</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Telefon</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone ? escapeHtml(phone) : '–'}</td>
          </tr>
        </table>
        ${message ? `<h3>Nachricht</h3><p style="white-space: pre-wrap;">${escapeHtml(message)}</p>` : ''}
        <hr style="margin: 24px 0;" />
        <p style="color: #666; font-size: 12px;">Die Konfigurationsübersicht ist als PDF im Anhang beigefügt.</p>
      `,
      attachments: [
        {
          filename: `Veredelung-${company.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '').replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error));
      return res.status(500).json({
        success: false,
        message: error.message || 'E-Mail konnte nicht gesendet werden.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Anfrage erfolgreich gesendet!',
      emailId: data?.id,
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Interner Serverfehler. Bitte versuchen Sie es erneut.',
    });
  }
}
