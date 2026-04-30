// Edge Function CKC — Notification email nouveau message
// Déclenchée par un Database Webhook sur INSERT dans messages
// Provider email : Resend (resend.com)
//
// Variables d'env à configurer dans Supabase → Settings → Edge Functions :
//   RESEND_API_KEY       → clé API Resend
//   APP_URL              → URL de l'app (ex: https://ckc.vercel.app)
//   EMAIL_FROM           → expéditeur (ex: CKC <notifications@ckc.nc>)
//                          défaut: onboarding@resend.dev (domaine de test Resend)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const message = payload.record

    if (!message?.conversation_id || !message?.sender_id || !message?.content) {
      return new Response('Payload invalide', { status: 400 })
    }

    // Client admin (bypass RLS pour lire les profils)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupère la conversation avec profils client + artisan
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select(`
        client_id,
        client:profiles!conversations_client_id_fkey(full_name, email),
        artisan:artisans(
          profile_id,
          profile:profiles(full_name, email)
        )
      `)
      .eq('id', message.conversation_id)
      .single()

    if (convErr || !conv) {
      console.error('Conversation introuvable:', convErr)
      return new Response('Conversation introuvable', { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const artisan = conv.artisan as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client  = conv.client  as any

    // Ne notifie pas si c'est l'artisan lui-même qui envoie
    if (message.sender_id === artisan?.profile_id) {
      return new Response(JSON.stringify({ skipped: 'sender is artisan' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const artisanEmail = artisan?.profile?.email
    const artisanName  = artisan?.profile?.full_name  || 'Artisan'
    const clientName   = client?.full_name            || 'Un client'
    const excerpt      = message.content.slice(0, 200)
    const hasMore      = message.content.length > 200
    const appUrl       = Deno.env.get('APP_URL') || 'https://ckc.nc'
    const emailFrom    = Deno.env.get('EMAIL_FROM') || 'CKC <onboarding@resend.dev>'

    if (!artisanEmail) {
      console.error('Email artisan introuvable')
      return new Response('Email artisan introuvable', { status: 404 })
    }

    // Envoi via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: artisanEmail,
        subject: `💬 Nouveau message de ${clientName} — CKC`,
        html: buildEmailHtml({ artisanName, clientName, excerpt, hasMore, appUrl }),
      }),
    })

    if (!resendRes.ok) {
      const body = await resendRes.text()
      console.error('Erreur Resend:', body)
      return new Response(body, { status: 500 })
    }

    console.log(`Notification envoyée à ${artisanEmail}`)
    return new Response(JSON.stringify({ sent: true, to: artisanEmail }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(String(err), { status: 500 })
  }
})

function buildEmailHtml(p: {
  artisanName: string
  clientName: string
  excerpt: string
  hasMore: boolean
  appUrl: string
}) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F5F0;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- En-tête -->
        <tr>
          <td style="background:#0D1B2A;padding:28px 32px;text-align:center;">
            <div style="color:#FF5C1A;font-size:32px;font-weight:900;letter-spacing:-1px;">CKC</div>
            <div style="color:#6b7280;font-size:13px;margin-top:4px;">Nouvelle-Calédonie</div>
          </td>
        </tr>

        <!-- Corps -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px;">
            <h2 style="color:#0D1B2A;margin:0 0 12px;font-size:22px;font-weight:800;">
              Bonjour ${p.artisanName} 👋
            </h2>
            <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.6;">
              <strong style="color:#0D1B2A;">${p.clientName}</strong>
              vous a envoyé un nouveau message sur CKC.
            </p>

            <!-- Extrait du message -->
            <div style="background:#F8F5F0;border-left:4px solid #FF5C1A;padding:16px 20px;
                        border-radius:0 12px 12px 0;margin-bottom:28px;">
              <p style="color:#0D1B2A;margin:0;font-size:15px;line-height:1.7;font-style:italic;">
                « ${p.excerpt}${p.hasMore ? '…' : ''} »
              </p>
            </div>

            <!-- Bouton CTA -->
            <a href="${p.appUrl}/messages"
               style="display:inline-block;background:#FF5C1A;color:#ffffff;padding:14px 28px;
                      border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
              Répondre au message →
            </a>
          </td>
        </tr>

        <!-- Pied de page -->
        <tr>
          <td style="background:#F8F5F0;padding:20px 32px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
              © ${new Date().getFullYear()} CKC — Nouvelle-Calédonie<br>
              Vous recevez cet email car vous êtes artisan inscrit sur CKC.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
