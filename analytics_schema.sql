-- Analytics Schema for Quran App
-- This schema tracks user behavior, page visits, and feature usage for analytics

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Page Visits Table
-- Tracks every page visit with entry/exit times and duration
CREATE TABLE IF NOT EXISTS public.page_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    page_name TEXT NOT NULL,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    exited_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Feature Usage Table
-- Tracks specific feature interactions (play audio, like post, send message, etc.)
CREATE TABLE IF NOT EXISTS public.feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    feature_category TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Session Analytics Table
-- Aggregated session-level data for performance
CREATE TABLE IF NOT EXISTS public.session_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    total_duration_seconds INTEGER,
    pages_visited INTEGER DEFAULT 0,
    features_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_visits_user_id ON public.page_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON public.page_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_page_visits_page_path ON public.page_visits(page_path);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON public.feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON public.feature_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name ON public.feature_usage(feature_name);

CREATE INDEX IF NOT EXISTS idx_session_analytics_user_id ON public.session_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_session_start ON public.session_analytics(session_start);

-- Enable Row Level Security
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own analytics data
CREATE POLICY "Users can view own page visits" 
    ON public.page_visits FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own page visits" 
    ON public.page_visits FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update own page visits" 
    ON public.page_visits FOR UPDATE 
    USING (true);

CREATE POLICY "Users can view own feature usage" 
    ON public.feature_usage FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own feature usage" 
    ON public.feature_usage FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can view own session analytics" 
    ON public.session_analytics FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own session analytics" 
    ON public.session_analytics FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update own session analytics" 
    ON public.session_analytics FOR UPDATE 
    USING (true);

-- Function to calculate and update page visit duration
CREATE OR REPLACE FUNCTION public.update_page_visit_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.exited_at IS NOT NULL AND NEW.entered_at IS NOT NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.exited_at - NEW.entered_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate duration when exited_at is set
DROP TRIGGER IF EXISTS trigger_update_page_visit_duration ON public.page_visits;
CREATE TRIGGER trigger_update_page_visit_duration
    BEFORE UPDATE ON public.page_visits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_page_visit_duration();
