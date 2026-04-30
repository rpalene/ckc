# Edge Function — notify-new-message

Envoie un email à l'artisan quand un client lui envoie un message.

## Stack
- **Runtime** : Deno (Supabase Edge Functions)
- **Email** : [Resend](https://resend.com) (3 000 emails/mois gratuits)

## Déploiement

### 1. Installer le CLI Supabase
```bash
brew install supabase/tap/supabase
supabase login
```

### 2. Déployer la fonction
```bash
cd /Users/oleurruet/Desktop/ckc
supabase functions deploy notify-new-message --project-ref nrxvbjcmuzfqkxqpiwsn
```

### 3. Configurer les variables d'environnement
Dans **Supabase → Settings → Edge Functions → notify-new-message** :

| Variable          | Valeur                                  |
|-------------------|-----------------------------------------|
| `RESEND_API_KEY`  | Ta clé API Resend (resend.com → API Keys) |
| `APP_URL`         | URL de ton app (ex: https://ckc.vercel.app) |
| `EMAIL_FROM`      | `CKC <notifications@ckc.nc>` (domaine vérifié) ou laisser vide pour utiliser `onboarding@resend.dev` en test |

Ou via CLI :
```bash
supabase secrets set RESEND_API_KEY=re_xxxx APP_URL=https://ckc.vercel.app --project-ref nrxvbjcmuzfqkxqpiwsn
```

### 4. Créer le Database Webhook
**Supabase → Database → Webhooks → Create a new webhook**

| Champ    | Valeur                  |
|----------|-------------------------|
| Name     | notify-new-message      |
| Table    | public.messages         |
| Events   | ✅ INSERT               |
| Type     | Supabase Edge Function  |
| Function | notify-new-message      |

## Comportement
- ✅ Notifie l'artisan quand un **client** envoie un message
- ✅ Ne notifie **pas** quand l'artisan répond à lui-même
- ✅ Inclut le nom du client et un extrait du message (200 caractères)
- ✅ Bouton "Répondre" direct vers `/messages`
