/*
  # Initial Schema Setup for CareerConnect

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - full_name (text)
      - professional_title (text)
      - bio (text)
      - avatar_url (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - jobs
      - id (uuid, primary key)
      - title (text)
      - company (text)
      - location (text)
      - description (text)
      - salary_range (text)
      - created_at (timestamp)
      - employer_id (uuid, references profiles)
    
    - applications
      - id (uuid, primary key)
      - job_id (uuid, references jobs)
      - applicant_id (uuid, references profiles)
      - status (text)
      - created_at (timestamp)
    
    - messages
      - id (uuid, primary key)
      - sender_id (uuid, references profiles)
      - receiver_id (uuid, references profiles)
      - content (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  professional_title text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  salary_range text,
  created_at timestamptz DEFAULT now(),
  employer_id uuid REFERENCES profiles NOT NULL
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = employer_id
  ));

-- Applications table
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs NOT NULL,
  applicant_id uuid REFERENCES profiles NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = applicant_id
    ) OR
    auth.uid() IN (
      SELECT p.user_id FROM profiles p
      JOIN jobs j ON j.employer_id = p.id
      WHERE j.id = job_id
    )
  );

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles NOT NULL,
  receiver_id uuid REFERENCES profiles NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (sender_id, receiver_id)
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = sender_id
    )
  );