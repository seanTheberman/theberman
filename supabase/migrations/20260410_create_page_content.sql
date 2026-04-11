-- Flexible key-value store for editable page sections (Homepage, About, etc.)
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section)
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page content"
  ON page_content FOR SELECT USING (true);

CREATE POLICY "Service role can manage page content"
  ON page_content FOR ALL USING (true);
