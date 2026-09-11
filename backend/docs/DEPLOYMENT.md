# Render and Supabase deployment

## Security first

The Supabase secret key shared in chat must be rotated immediately in Supabase Dashboard → Settings → API Keys. It is a server-only credential that bypasses Row Level Security. Do not add it to Git, Vercel variables, browser code, screenshots, or documentation.

The project URL and publishable key can be used by the browser once Supabase Row Level Security and Auth are configured. The Laravel service reads both from Render environment variables to verify access tokens. The secret key is reserved for server-only future integrations and is not required by the Credit Sale endpoints.

## Supabase database setup

1. In Supabase Dashboard, open **Connect** and copy the **Session Pooler** connection string on port `5432`. Do not use the transaction pooler on `6543` as Laravel relies on prepared statements.
2. Replace the password placeholder with the database password, URL-encoding reserved password characters.
3. Set it on Render as `DB_URL`, set `DB_CONNECTION=pgsql`, and keep `DB_SSLMODE=require`.
4. Create a Supabase Auth user, then copy that user UUID.
5. Before deploying, run the migrations and bootstrap command locally against the Supabase connection configured in `backend/.env`:

   ```powershell
   cd backend
   php artisan config:clear
   php artisan migrate --force
   php artisan simplebiz:seed-credit-sale --owner=<Supabase-Auth-user-UUID>
   php artisan migrate:status
   ```

6. Copy the printed Company UUID. Your future frontend API calls must send it in `X-Company-Id` alongside the signed-in user's access token.

## Render setup

`render.yaml` at repository root defines one Free-tier Docker web service rooted at `backend/`. It does not use paid shell access, a paid pre-deploy command, background workers, persistent disks, or a Render database. Supabase remains the database provider.

Set these Render secrets when the Blueprint prompts for them:

| Variable | Source |
| --- | --- |
| `APP_KEY` | Run `php artisan key:generate --show`; copy the full `base64:` value. |
| `APP_URL` | Your Render web service URL after the first deploy. |
| `DB_URL` | Supabase Connect → Session Pooler URL, with the actual database password. |
| `SUPABASE_URL` | Supabase Project URL. |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase Settings → API Keys. |
| `SUPABASE_SECRET_KEY` | A newly rotated Supabase secret key; server-only. |

`FRONTEND_URL` is already set to `https://sb-ph.vercel.app`, which permits browser API requests through the Laravel CORS configuration. Add other origins as a comma-separated list only when required.

Because Render Free does not provide shell access, run new migrations from your local Laravel installation against Supabase before deploying each schema change.

## Health check

Render should use `GET /up`. It does not require authentication and reports application health.
