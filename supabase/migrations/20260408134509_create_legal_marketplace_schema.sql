/*
  # Legal Marketplace Database Schema

  ## Overview
  This migration creates the core database structure for Nomos, a premium legal marketplace 
  platform connecting clients with verified lawyers in Greece/EU.

  ## New Tables

  ### 1. lawyers
  Stores lawyer profiles, credentials, and availability
  - `id` (uuid, primary key) - Unique lawyer identifier
  - `full_name` (text) - Lawyer's full name
  - `email` (text, unique) - Contact email
  - `phone` (text) - Contact phone number
  - `photo_url` (text) - Profile photo URL
  - `bio` (text) - Professional biography
  - `city` (text) - Primary practice city
  - `jurisdiction` (text) - Legal jurisdiction(s)
  - `practice_areas` (text[]) - Array of practice specializations
  - `languages` (text[]) - Languages spoken
  - `years_experience` (integer) - Years in practice
  - `consultation_fee` (decimal) - Standard consultation fee in EUR
  - `online_consultation` (boolean) - Offers online consultations
  - `in_person_consultation` (boolean) - Offers in-person consultations
  - `response_time_hours` (integer) - Typical response time
  - `verified` (boolean) - Verification status
  - `rating` (decimal) - Average rating (0-5)
  - `review_count` (integer) - Number of reviews
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. intake_submissions
  Stores client intake form submissions
  - `id` (uuid, primary key) - Unique submission identifier
  - `issue_type` (text) - Legal issue category
  - `location` (text) - Client location
  - `urgency` (text) - Case urgency level
  - `preferred_language` (text) - Preferred communication language
  - `consultation_format` (text) - Online or in-person preference
  - `budget` (text) - Budget range
  - `description` (text) - Case description
  - `client_name` (text) - Client name
  - `client_email` (text) - Client email
  - `client_phone` (text) - Client phone
  - `created_at` (timestamptz) - Submission timestamp

  ### 3. consultations
  Stores scheduled consultations/appointments
  - `id` (uuid, primary key) - Unique consultation identifier
  - `lawyer_id` (uuid, foreign key) - Reference to lawyers table
  - `client_name` (text) - Client name
  - `client_email` (text) - Client email
  - `client_phone` (text) - Client phone
  - `consultation_type` (text) - Online or in-person
  - `scheduled_at` (timestamptz) - Appointment date/time
  - `duration_minutes` (integer) - Consultation duration
  - `fee` (decimal) - Consultation fee
  - `status` (text) - Booking status (pending, confirmed, completed, cancelled)
  - `meeting_link` (text) - Online meeting URL (if applicable)
  - `notes` (text) - Consultation notes
  - `created_at` (timestamptz) - Booking creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. cases
  Stores client cases/matters
  - `id` (uuid, primary key) - Unique case identifier
  - `lawyer_id` (uuid, foreign key) - Assigned lawyer
  - `client_name` (text) - Client name
  - `client_email` (text) - Client email
  - `case_type` (text) - Type of legal matter
  - `status` (text) - Case status (active, pending, closed)
  - `description` (text) - Case description
  - `created_at` (timestamptz) - Case creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. messages
  Stores secure client-lawyer messages
  - `id` (uuid, primary key) - Unique message identifier
  - `case_id` (uuid, foreign key) - Reference to cases table
  - `sender_type` (text) - Sender type (client or lawyer)
  - `sender_name` (text) - Sender name
  - `content` (text) - Message content
  - `read` (boolean) - Read status
  - `created_at` (timestamptz) - Message timestamp

  ### 6. reviews
  Stores lawyer reviews and ratings
  - `id` (uuid, primary key) - Unique review identifier
  - `lawyer_id` (uuid, foreign key) - Reference to lawyers table
  - `client_name` (text) - Reviewer name
  - `rating` (integer) - Rating (1-5)
  - `comment` (text) - Review text
  - `case_type` (text) - Type of case reviewed
  - `created_at` (timestamptz) - Review timestamp

  ## Security
  - All tables have RLS enabled
  - Public read access for lawyer profiles and reviews
  - Authenticated access for consultations, cases, and messages
  - Lawyers can only access their own data
*/

-- Create lawyers table
CREATE TABLE IF NOT EXISTS lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  photo_url text,
  bio text,
  city text NOT NULL,
  jurisdiction text NOT NULL,
  practice_areas text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  years_experience integer DEFAULT 0,
  consultation_fee decimal(10,2) DEFAULT 0,
  online_consultation boolean DEFAULT true,
  in_person_consultation boolean DEFAULT true,
  response_time_hours integer DEFAULT 24,
  verified boolean DEFAULT false,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create intake_submissions table
CREATE TABLE IF NOT EXISTS intake_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type text,
  location text,
  urgency text,
  preferred_language text,
  consultation_format text,
  budget text,
  description text,
  client_name text,
  client_email text,
  client_phone text,
  created_at timestamptz DEFAULT now()
);

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  consultation_type text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  fee decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  case_type text,
  status text DEFAULT 'active',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_name text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  case_type text,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_lawyers_updated_at ON lawyers;
CREATE TRIGGER set_lawyers_updated_at
  BEFORE UPDATE ON lawyers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_consultations_updated_at ON consultations;
CREATE TRIGGER set_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_cases_updated_at ON cases;
CREATE TRIGGER set_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lawyers_rating_range'
  ) THEN
    ALTER TABLE lawyers
      ADD CONSTRAINT lawyers_rating_range CHECK (rating >= 0 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lawyers_review_count_nonnegative'
  ) THEN
    ALTER TABLE lawyers
      ADD CONSTRAINT lawyers_review_count_nonnegative CHECK (review_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lawyers_years_experience_nonnegative'
  ) THEN
    ALTER TABLE lawyers
      ADD CONSTRAINT lawyers_years_experience_nonnegative CHECK (years_experience >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lawyers_consultation_fee_nonnegative'
  ) THEN
    ALTER TABLE lawyers
      ADD CONSTRAINT lawyers_consultation_fee_nonnegative CHECK (consultation_fee >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lawyers_response_time_positive'
  ) THEN
    ALTER TABLE lawyers
      ADD CONSTRAINT lawyers_response_time_positive CHECK (response_time_hours > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'intake_description_length'
  ) THEN
    ALTER TABLE intake_submissions
      ADD CONSTRAINT intake_description_length CHECK (char_length(coalesce(description, '')) <= 4000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'consultations_type_valid'
  ) THEN
    ALTER TABLE consultations
      ADD CONSTRAINT consultations_type_valid CHECK (consultation_type IN ('online', 'in-person'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'consultations_status_valid'
  ) THEN
    ALTER TABLE consultations
      ADD CONSTRAINT consultations_status_valid CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'consultations_duration_range'
  ) THEN
    ALTER TABLE consultations
      ADD CONSTRAINT consultations_duration_range CHECK (duration_minutes BETWEEN 15 AND 240);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'consultations_fee_nonnegative'
  ) THEN
    ALTER TABLE consultations
      ADD CONSTRAINT consultations_fee_nonnegative CHECK (fee >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cases_status_valid'
  ) THEN
    ALTER TABLE cases
      ADD CONSTRAINT cases_status_valid CHECK (status IN ('active', 'pending', 'closed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_type_valid'
  ) THEN
    ALTER TABLE messages
      ADD CONSTRAINT messages_sender_type_valid CHECK (sender_type IN ('client', 'lawyer', 'system'));
  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lawyers table (public read access for directory)
CREATE POLICY "Anyone can view verified lawyers"
  ON lawyers FOR SELECT
  USING (verified = true);

CREATE POLICY "Lawyers can update own profile"
  ON lawyers FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for intake_submissions (public insert for lead generation)
DROP POLICY IF EXISTS "Anyone can submit intake form" ON intake_submissions;
CREATE POLICY "Anyone can submit intake form"
  ON intake_submissions FOR INSERT
  WITH CHECK (
    char_length(btrim(coalesce(issue_type, ''))) > 0
    AND char_length(btrim(coalesce(location, ''))) > 0
    AND char_length(btrim(coalesce(urgency, ''))) > 0
    AND char_length(btrim(coalesce(preferred_language, ''))) > 0
    AND char_length(btrim(coalesce(consultation_format, ''))) > 0
    AND char_length(btrim(coalesce(budget, ''))) > 0
    AND char_length(btrim(coalesce(description, ''))) >= 40
    AND char_length(btrim(coalesce(client_name, ''))) >= 2
    AND char_length(btrim(coalesce(client_email, ''))) >= 5
  );

CREATE POLICY "Authenticated users can view own submissions"
  ON intake_submissions FOR SELECT
  TO authenticated
  USING (client_email = auth.jwt()->>'email');

-- RLS Policies for consultations
CREATE POLICY "Authenticated users can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    client_email = auth.jwt()->>'email' OR 
    lawyer_id = auth.uid()
  );

DROP POLICY IF EXISTS "Anyone can create consultations" ON consultations;
CREATE POLICY "Anyone can create consultations"
  ON consultations FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND consultation_type IN ('online', 'in-person')
    AND scheduled_at > now() - interval '1 minute'
    AND duration_minutes BETWEEN 15 AND 240
    AND fee >= 0
    AND char_length(btrim(coalesce(client_name, ''))) >= 2
    AND char_length(btrim(coalesce(client_email, ''))) >= 5
  );

CREATE POLICY "Lawyers can update own consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

-- RLS Policies for cases
CREATE POLICY "Authenticated users can view own cases"
  ON cases FOR SELECT
  TO authenticated
  USING (
    client_email = auth.jwt()->>'email' OR 
    lawyer_id = auth.uid()
  );

CREATE POLICY "Lawyers can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (lawyer_id = auth.uid());

CREATE POLICY "Lawyers can update own cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (lawyer_id = auth.uid())
  WITH CHECK (lawyer_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Case participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = messages.case_id
      AND (cases.client_email = auth.jwt()->>'email' OR cases.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Case participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = messages.case_id
      AND (cases.client_email = auth.jwt()->>'email' OR cases.lawyer_id = auth.uid())
    )
  );

-- RLS Policies for reviews (public read)
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyers_city ON lawyers(city);
CREATE INDEX IF NOT EXISTS idx_lawyers_practice_areas ON lawyers USING gin(practice_areas);
CREATE INDEX IF NOT EXISTS idx_lawyers_verified ON lawyers(verified);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_client_email ON intake_submissions(client_email);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer_id ON consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_at ON consultations(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_consultations_client_email ON consultations(client_email);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_email ON cases(client_email);
CREATE INDEX IF NOT EXISTS idx_messages_case_id ON messages(case_id);
CREATE INDEX IF NOT EXISTS idx_reviews_lawyer_id ON reviews(lawyer_id);
