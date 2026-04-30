-- ============================================================
-- CKC – Webhook : notification email nouveau message
-- À exécuter dans SQL Editor → Supabase
-- Remplace YOUR_PROJECT_REF par la référence de ton projet
-- (visible dans Settings → General → Reference ID)
-- ============================================================

-- Crée le webhook qui appelle l'Edge Function à chaque INSERT dans messages
select
  net.http_post(
    url    := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-new-message',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.anon_key', true)
    ),
    body   := '{}'
  );

-- ─────────────────────────────────────────────────────────────
-- ALTERNATIVE (recommandée) : créer le webhook via le dashboard
-- Supabase → Database → Webhooks → Create a new webhook
--   • Name    : notify-new-message
--   • Table   : public.messages
--   • Events  : INSERT
--   • Type    : Supabase Edge Function
--   • Function: notify-new-message
-- ─────────────────────────────────────────────────────────────
