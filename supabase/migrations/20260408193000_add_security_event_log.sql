/*
  # Add security event logging

  This gives the project a basic audit trail for trust-sensitive backend actions
  such as blocked public submissions, accepted requests, and validation failures.
*/

CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  channel text NOT NULL,
  status text NOT NULL,
  actor_user_id uuid,
  actor_email text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT security_events_status_check CHECK (
    status IN ('accepted', 'blocked', 'error', 'info')
  )
);

CREATE INDEX IF NOT EXISTS idx_security_events_created_at
  ON security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_type_status
  ON security_events(event_type, status);

CREATE INDEX IF NOT EXISTS idx_security_events_actor_email
  ON security_events(actor_email);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct access to security events" ON security_events;
CREATE POLICY "No direct access to security events"
  ON security_events
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);
