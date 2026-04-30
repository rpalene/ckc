// ⚠️  La clé VITE_RESEND_API_KEY est exposée dans le bundle client.
// Pour la protéger en production, migrer vers une Supabase Edge Function
// ou une Vercel serverless function qui fait l'appel côté serveur.

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY as string | undefined
const APP_URL        = import.meta.env.VITE_APP_URL        as string | undefined
const EMAIL_FROM     = import.meta.env.VITE_EMAIL_FROM     as string | undefined

export async function notifyNewMessage({
  artisanEmail,
  artisanName,
  clientName,
  messageContent,
}: {
  artisanEmail: string
  artisanName:  string
  clientName:   string
  messageContent: string
}): Promise<void> {
  if (!RESEND_API_KEY) return // non configuré → silencieux

  const excerpt = messageContent.slice(0, 200)
  const hasMore = messageContent.length > 200
  const appUrl  = APP_URL ?? window.location.origin
  const from    = EMAIL_FROM ?? 'CKC <onboarding@resend.dev>'

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to:      artisanEmail,
        subject: `💬 Nouveau message de ${clientName} — CKC`,
        html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0D1B2A;padding:28px 32px;text-align:center;">
            <div style="color:#FF5C1A;font-size:32px;font-weight:900;letter-spacing:-1px;">CKC</div>
            <div style="color:#6b7280;font-size:13px;margin-top:4px;">Nouvelle-Calédonie</div>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px;">
            <h2 style="color:#0D1B2A;margin:0 0 12px;font-size:22px;font-weight:800;">
              Bonjour ${artisanName} 👋
            </h2>
            <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.6;">
              <strong style="color:#0D1B2A;">${clientName}</strong>
              vous a envoyé un nouveau message sur CKC.
            </p>
            <div style="background:#F8F5F0;border-left:4px solid #FF5C1A;padding:16px 20px;
                        border-radius:0 12px 12px 0;margin-bottom:28px;">
              <p style="color:#0D1B2A;margin:0;font-size:15px;line-height:1.7;font-style:italic;">
                « ${excerpt}${hasMore ? '…' : ''} »
              </p>
            </div>
            <a href="${appUrl}/messages"
               style="display:inline-block;background:#FF5C1A;color:#ffffff;padding:14px 28px;
                      border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
              Répondre au message →
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#F8F5F0;padding:20px 32px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
              © ${new Date().getFullYear()} CKC — Nouvelle-Calédonie
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    })
  } catch {
    // Echec silencieux : la messagerie ne doit pas être bloquée par l'email
  }
}
