-- SQL Schema for TECH START Platform

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    external_url TEXT,
    featured BOOLEAN DEFAULT false NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enable Row Level Security (optional but standard, let's setup public read roles)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create Policies for Public Access
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to articles" ON articles
    FOR SELECT USING (true);

-- Create Policies for Admin write access (configured through Supabase DB directly or bypass for simplicity)
-- Standard Policy for Service Role is allowed, or we can use anon permissions for development simplification:
CREATE POLICY "Allow all access to categories with service role" ON categories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to articles with service role" ON articles
    FOR ALL USING (true) WITH CHECK (true);

-- Insert Mock/Initial Categories
INSERT INTO categories (name, image) VALUES
('الذكاء الاصطناعي', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800'),
('البرمجة', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'),
('الأدوات التقنية', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'),
('الشروحات', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (name) DO NOTHING;
