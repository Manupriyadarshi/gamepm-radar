-- ═══════════════════════════════════════════════════════════
-- GAMEPM RADAR — Database Schema (Supabase)
-- Run this SQL in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  career_page TEXT NOT NULL,
  country TEXT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  job_url TEXT,
  date_found DATE DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'Career Page',
  is_remote BOOLEAN DEFAULT FALSE,
  skills TEXT[],
  description_text TEXT,
  is_new BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_title, company_name, job_url)
);

-- Applications tracker
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id),
  status TEXT DEFAULT 'Not Applied'
    CHECK (status IN ('Not Applied','Applied','Interview','Offer','Rejected')),
  notes TEXT,
  applied_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- INTERVIEW QUESTIONS (enhanced schema)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS interview_questions (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  source TEXT NOT NULL,
  source_url TEXT DEFAULT '',
  difficulty TEXT DEFAULT '',
  upvotes INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  date_scraped DATE DEFAULT CURRENT_DATE,
  added_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent exact duplicates
  UNIQUE(company_name, question)
);

-- Scrape history (tracks when each source was last scraped)
CREATE TABLE IF NOT EXISTS scrape_log (
  id SERIAL PRIMARY KEY,
  scraper_name TEXT NOT NULL,
  company_name TEXT,
  questions_found INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  scraped_at TIMESTAMP DEFAULT NOW()
);

-- User-submitted questions (community contributions)
CREATE TABLE IF NOT EXISTS user_submitted_questions (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  submitted_by TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES for fast queries
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date_found DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_name);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(job_title);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE INDEX IF NOT EXISTS idx_iq_company ON interview_questions(company_name);
CREATE INDEX IF NOT EXISTS idx_iq_category ON interview_questions(category);
CREATE INDEX IF NOT EXISTS idx_iq_source ON interview_questions(source);
CREATE INDEX IF NOT EXISTS idx_iq_date ON interview_questions(date_scraped DESC);

CREATE INDEX IF NOT EXISTS idx_scrape_log_date ON scrape_log(scraped_at DESC);

-- ═══════════════════════════════════════════════════════════
-- VIEWS (pre-built queries for the dashboard)
-- ═══════════════════════════════════════════════════════════

-- Questions per company
CREATE OR REPLACE VIEW company_question_counts AS
SELECT 
  company_name,
  COUNT(*) as total_questions,
  COUNT(DISTINCT category) as categories_covered,
  COUNT(DISTINCT source) as sources_used,
  MAX(date_scraped) as last_updated
FROM interview_questions
GROUP BY company_name
ORDER BY total_questions DESC;

-- Questions per category
CREATE OR REPLACE VIEW category_breakdown AS
SELECT 
  category,
  COUNT(*) as question_count,
  COUNT(DISTINCT company_name) as companies
FROM interview_questions
GROUP BY category
ORDER BY question_count DESC;

-- Source effectiveness
CREATE OR REPLACE VIEW source_stats AS
SELECT 
  source,
  COUNT(*) as questions_found,
  COUNT(DISTINCT company_name) as companies_covered,
  MAX(date_scraped) as last_scraped
FROM interview_questions
GROUP BY source
ORDER BY questions_found DESC;

-- Latest questions feed
CREATE OR REPLACE VIEW latest_questions AS
SELECT *
FROM interview_questions
ORDER BY date_scraped DESC, added_at DESC
LIMIT 100;
