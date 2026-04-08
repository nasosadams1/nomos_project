# Launch Checklist

## Supabase

1. Apply every SQL migration in [supabase/migrations](../supabase/migrations).
2. Deploy every edge function in [supabase/functions](../supabase/functions).
3. Enable Auth email OTP or magic-link sign-in.
4. Set `SUPABASE_SERVICE_ROLE_KEY` for all deployed edge functions.
5. Confirm `claim_client_records()` exists and is callable by authenticated users.

## Functional Validation

1. Submit a valid intake request from the public site.
2. Confirm blocked intake cases:
   - honeypot filled
   - too-fast submission
   - duplicate submission
   - too many recent requests
3. Submit a valid consultation request.
4. Confirm blocked consultation cases:
   - duplicate request with same lawyer
   - reserved slot
   - unavailable format
   - too-fast submission
5. Sign in through portal access using the same email.
6. Confirm older email-based records are claimed after sign-in.
7. Confirm live availability appears in the directory, profile, and booking flow.

## Operational Validation

1. Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` locally before release.
2. Check that `security_events` is receiving accepted and blocked submissions.
3. Review production logs for edge-function failures.
4. Verify contact emails and policy pages match the real business setup.
5. Confirm DNS, TLS, and environment values match the production domain.

## Product Readiness

1. Review consultation fees for every visible lawyer profile.
2. Review every public claim on the home, trust, privacy, and terms pages.
3. Confirm there are no placeholder lawyers, fake case data, or sample portal content in production.
4. Confirm support and incident-response ownership before traffic is sent to the site.
