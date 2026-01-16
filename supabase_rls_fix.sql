-- MASTER FIX: Making policies permissive for Clerk-based unauthenticated Supabase usage.
-- Run this if you are using Clerk and getting "violates row-level security policy" errors.

-- 1. Profiles (Allows public creation/update during development)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Public profile access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public profile insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profile update" ON public.profiles FOR UPDATE USING (true);

-- 2. Comments (Allows everyone to post for now)
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.comments;
DROP POLICY IF EXISTS "Allow public insert for comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Public comments access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public comments insert" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public comments delete" ON public.comments FOR DELETE USING (true);

-- 3. Forum Posts
DROP POLICY IF EXISTS "Forum posts are viewable by everyone" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Allow public insert for forum_posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.forum_posts;
CREATE POLICY "Public forum access" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Public forum insert" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public forum delete" ON public.forum_posts FOR DELETE USING (true);

-- Ensure RLS is still enabled but with these permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
