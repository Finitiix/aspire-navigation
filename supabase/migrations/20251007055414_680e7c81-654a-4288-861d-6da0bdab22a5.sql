-- Add missing fields to teacher_details table
ALTER TABLE teacher_details
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS personal_website TEXT;

-- Add RLS policy to allow public viewing of teacher profiles
CREATE POLICY "Allow public read access to teacher details"
ON teacher_details
FOR SELECT
USING (true);

-- Add RLS policy to allow public read access to researcher IDs
CREATE POLICY "Allow public read access to researcher IDs"
ON researcher_ids
FOR SELECT
USING (true);

-- Add RLS policy to allow public read access to teacher points
CREATE POLICY "Allow public read access to teacher points"
ON teacher_points
FOR SELECT
USING (true);

-- Add RLS policy to allow public read access to approved achievements
CREATE POLICY "Allow public read access to approved achievements"
ON detailed_achievements
FOR SELECT
USING (status = 'Approved');