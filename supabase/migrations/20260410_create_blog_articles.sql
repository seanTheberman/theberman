-- Blog articles table (mirrors news_articles + subtitle/slug)
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'The Berman Team',
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'All Posts',
  is_live BOOLEAN DEFAULT true,
  show_badge BOOLEAN DEFAULT false,
  read_time TEXT DEFAULT '3 min read',
  slug TEXT UNIQUE
);

ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live blog articles"
  ON blog_articles FOR SELECT USING (true);

CREATE POLICY "Service role can manage blog articles"
  ON blog_articles FOR ALL USING (true);
