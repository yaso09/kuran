-- 1. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "Public profile access" ON public.profiles;
DROP POLICY IF EXISTS "Public comments access" ON public.comments;
DROP POLICY IF EXISTS "Public forum access" ON public.forum_posts;
DROP POLICY IF EXISTS "Public forum comments access" ON public.forum_comments;
DROP POLICY IF EXISTS "Public post likes access" ON public.post_likes;
DROP POLICY IF EXISTS "Public comment likes access" ON public.comment_likes;
DROP POLICY IF EXISTS "Public forum comment likes access" ON public.forum_comment_likes;
DROP POLICY IF EXISTS "Public push subscriptions access" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Public notifications access" ON public.notifications;

-- 2. CREATE IMPROVED PERMISSIVE POLICIES
-- Using 'FOR ALL' with 'USING (true)' and 'WITH CHECK (true)' to ensure INSERT/UPDATE/UPSERT works globally.

CREATE POLICY "Public profile access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public comments access" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public forum access" ON public.forum_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public forum comments access" ON public.forum_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public post likes access" ON public.post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public comment likes access" ON public.comment_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public forum comment likes access" ON public.forum_comment_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public push subscriptions access" ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public notifications access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
