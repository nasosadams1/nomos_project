# Nomos

Nomos is a legal marketplace and client-intake platform built with React, Vite, TypeScript, and Supabase. It includes structured legal intake, a verified lawyer directory, consultation request flows, and a signed-in client portal.

## Stack

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Edge Functions

## Local Development

1. Install dependencies:

```bash
npm ci
```

2. Copy the environment template and add your Supabase values:

```bash
copy .env.example .env
```

3. Start the app:

```bash
npm run dev
```

## Environment Variables

Frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Supabase Edge Functions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Verification

Run the release checks individually:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Supabase Rollout

This repo includes:

- SQL migrations in [supabase/migrations](./supabase/migrations)
- Edge functions in [supabase/functions](./supabase/functions)

Before production use, deploy all pending migrations and edge functions, then validate:

1. Public intake submission
2. Consultation request submission
3. Magic-link sign-in
4. Portal record claiming after sign-in
5. Live availability lookups
6. Security event logging

## Production Notes

- Public form submissions are backend-mediated through Supabase Edge Functions.
- Intake and consultation requests include basic anti-abuse protections: honeypot field checks, minimum time-on-form, duplicate detection, and per-email rate limits.
- Trust-sensitive events are written to `security_events` for auditability.
- Client portal access depends on Supabase Auth email OTP or magic links being enabled.

## Launch Checklist

See [docs/launch-checklist.md](./docs/launch-checklist.md).
