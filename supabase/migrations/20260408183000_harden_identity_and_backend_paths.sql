/*
  # Harden identity and backend mediation

  This migration moves the product away from raw email-only identity and
  direct anonymous inserts from the browser.
*/

ALTER TABLE lawyers
  ADD COLUMN IF NOT EXISTS lawyer_user_id uuid;

ALTER TABLE intake_submissions
  ADD COLUMN IF NOT EXISTS client_user_id uuid;

ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS client_user_id uuid;

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS client_user_id uuid;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS client_user_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lawyers_lawyer_user_id_unique'
  ) THEN
    ALTER TABLE lawyers
      ADD CONSTRAINT lawyers_lawyer_user_id_unique UNIQUE (lawyer_user_id);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION claim_client_records()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_email text;
  intake_count integer := 0;
  consultation_count integer := 0;
  case_count integer := 0;
  review_count integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  claimed_email := lower(coalesce(auth.jwt()->>'email', ''));

  IF claimed_email = '' THEN
    RAISE EXCEPTION 'Authenticated user is missing an email claim';
  END IF;

  UPDATE intake_submissions
  SET client_user_id = auth.uid(),
      client_email = lower(client_email)
  WHERE client_user_id IS NULL
    AND lower(client_email) = claimed_email;
  GET DIAGNOSTICS intake_count = ROW_COUNT;

  UPDATE consultations
  SET client_user_id = auth.uid(),
      client_email = lower(client_email)
  WHERE client_user_id IS NULL
    AND lower(client_email) = claimed_email;
  GET DIAGNOSTICS consultation_count = ROW_COUNT;

  UPDATE cases
  SET client_user_id = auth.uid(),
      client_email = lower(client_email)
  WHERE client_user_id IS NULL
    AND lower(client_email) = claimed_email;
  GET DIAGNOSTICS case_count = ROW_COUNT;

  UPDATE reviews
  SET client_user_id = auth.uid()
  WHERE client_user_id IS NULL
    AND lower(client_name) <> ''
    AND EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.lawyer_id = reviews.lawyer_id
        AND lower(consultations.client_email) = claimed_email
        AND consultations.status IN ('completed', 'confirmed')
    );
  GET DIAGNOSTICS review_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'intake_submissions', intake_count,
    'consultations', consultation_count,
    'cases', case_count,
    'reviews', review_count
  );
END;
$$;

REVOKE ALL ON FUNCTION claim_client_records() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_client_records() TO authenticated;

DROP POLICY IF EXISTS "Lawyers can update own profile" ON lawyers;
CREATE POLICY "Lawyers can update own profile"
  ON lawyers FOR UPDATE
  TO authenticated
  USING (lawyer_user_id = auth.uid())
  WITH CHECK (lawyer_user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can view own submissions" ON intake_submissions;
CREATE POLICY "Authenticated users can view own submissions"
  ON intake_submissions FOR SELECT
  TO authenticated
  USING (
    client_user_id = auth.uid()
    OR lower(client_email) = lower(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Anyone can submit intake form" ON intake_submissions;

DROP POLICY IF EXISTS "Authenticated users can view own consultations" ON consultations;
CREATE POLICY "Authenticated users can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    client_user_id = auth.uid()
    OR lower(client_email) = lower(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1
      FROM lawyers
      WHERE lawyers.id = consultations.lawyer_id
        AND lawyers.lawyer_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can create consultations" ON consultations;

DROP POLICY IF EXISTS "Lawyers can update own consultations" ON consultations;
CREATE POLICY "Lawyers can update own consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM lawyers
      WHERE lawyers.id = consultations.lawyer_id
        AND lawyers.lawyer_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM lawyers
      WHERE lawyers.id = consultations.lawyer_id
        AND lawyers.lawyer_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view own cases" ON cases;
CREATE POLICY "Authenticated users can view own cases"
  ON cases FOR SELECT
  TO authenticated
  USING (
    client_user_id = auth.uid()
    OR lower(client_email) = lower(auth.jwt()->>'email')
    OR EXISTS (
      SELECT 1
      FROM lawyers
      WHERE lawyers.id = cases.lawyer_id
        AND lawyers.lawyer_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Lawyers can create cases" ON cases;
CREATE POLICY "Lawyers can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM lawyers
      WHERE lawyers.id = cases.lawyer_id
        AND lawyers.lawyer_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Lawyers can update own cases" ON cases;
CREATE POLICY "Lawyers can update own cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM lawyers
      WHERE lawyers.id = cases.lawyer_id
        AND lawyers.lawyer_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM lawyers
      WHERE lawyers.id = cases.lawyer_id
        AND lawyers.lawyer_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Case participants can view messages" ON messages;
CREATE POLICY "Case participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM cases
      LEFT JOIN lawyers ON lawyers.id = cases.lawyer_id
      WHERE cases.id = messages.case_id
        AND (
          cases.client_user_id = auth.uid()
          OR lower(cases.client_email) = lower(auth.jwt()->>'email')
          OR lawyers.lawyer_user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Case participants can send messages" ON messages;
CREATE POLICY "Case participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM cases
      LEFT JOIN lawyers ON lawyers.id = cases.lawyer_id
      WHERE cases.id = messages.case_id
        AND (
          cases.client_user_id = auth.uid()
          OR lower(cases.client_email) = lower(auth.jwt()->>'email')
          OR lawyers.lawyer_user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      client_user_id = auth.uid()
      OR client_user_id IS NULL
    )
    AND EXISTS (
      SELECT 1
      FROM consultations
      WHERE consultations.lawyer_id = reviews.lawyer_id
        AND consultations.status = 'completed'
        AND (
          consultations.client_user_id = auth.uid()
          OR lower(consultations.client_email) = lower(auth.jwt()->>'email')
        )
    )
  );

CREATE INDEX IF NOT EXISTS idx_lawyers_lawyer_user_id ON lawyers(lawyer_user_id);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_client_user_id ON intake_submissions(client_user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_client_user_id ON consultations(client_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_user_id ON cases(client_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_user_id ON reviews(client_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_consultation_slot
  ON consultations(lawyer_id, scheduled_at)
  WHERE status IN ('pending', 'confirmed');
