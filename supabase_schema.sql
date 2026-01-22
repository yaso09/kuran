-- CLEANUP
DROP TABLE IF EXISTS public.forum_posts;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.profiles;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY, 
    full_name TEXT,
    avatar_url TEXT,
    streak INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    freezes INTEGER DEFAULT 2,
    city TEXT,
    notifications_enabled BOOLEAN DEFAULT false,
    last_read_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Comments Table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    verse_key TEXT NOT NULL, 
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Forum Posts Table
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tagged_verses TEXT[] DEFAULT '{}', 
    category TEXT DEFAULT 'Soru',
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Forum Comments Table (Social Media Style replies to forum posts)
CREATE TABLE public.forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Like Tracking Tables (To prevent multiple likes)
CREATE TABLE public.post_likes (
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE public.comment_likes (
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (comment_id, user_id)
);

CREATE TABLE public.forum_comment_likes (
    comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (comment_id, user_id)
);

-- 6. Push Subscriptions Table
CREATE TABLE public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    url TEXT DEFAULT '/',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Permissive Policies for development with Clerk
CREATE POLICY "Public profile access" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public comments access" ON public.comments FOR ALL USING (true);
CREATE POLICY "Public forum access" ON public.forum_posts FOR ALL USING (true);
CREATE POLICY "Public forum comments access" ON public.forum_comments FOR ALL USING (true);
CREATE POLICY "Public post likes access" ON public.post_likes FOR ALL USING (true);
CREATE POLICY "Public comment likes access" ON public.comment_likes FOR ALL USING (true);
CREATE POLICY "Public forum comment likes access" ON public.forum_comment_likes FOR ALL USING (true);
CREATE POLICY "Public push subscriptions access" ON public.push_subscriptions FOR ALL USING (true);
CREATE POLICY "Public notifications access" ON public.notifications FOR ALL USING (true);

-- Functions to Toggle Likes
CREATE OR REPLACE FUNCTION public.toggle_post_like(target_post_id UUID, target_user_id TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.post_likes WHERE post_id = target_post_id AND user_id = target_user_id) THEN
        DELETE FROM public.post_likes WHERE post_id = target_post_id AND user_id = target_user_id;
        UPDATE public.forum_posts SET likes_count = likes_count - 1 WHERE id = target_post_id;
    ELSE
        INSERT INTO public.post_likes (post_id, user_id) VALUES (target_post_id, target_user_id);
        UPDATE public.forum_posts SET likes_count = likes_count + 1 WHERE id = target_post_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.toggle_comment_like(target_comment_id UUID, target_user_id TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.comment_likes WHERE comment_id = target_comment_id AND user_id = target_user_id) THEN
        DELETE FROM public.comment_likes WHERE comment_id = target_comment_id AND user_id = target_user_id;
        UPDATE public.comments SET likes_count = likes_count - 1 WHERE id = target_comment_id;
    ELSE
        INSERT INTO public.comment_likes (comment_id, user_id) VALUES (target_comment_id, target_user_id);
        UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = target_comment_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.toggle_forum_comment_like(target_comment_id UUID, target_user_id TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.forum_comment_likes WHERE comment_id = target_comment_id AND user_id = target_user_id) THEN
        DELETE FROM public.forum_comment_likes WHERE comment_id = target_comment_id AND user_id = target_user_id;
        UPDATE public.forum_comments SET likes_count = likes_count - 1 WHERE id = target_comment_id;
    ELSE
        INSERT INTO public.forum_comment_likes (comment_id, user_id) VALUES (target_comment_id, target_user_id);
        UPDATE public.forum_comments SET likes_count = likes_count + 1 WHERE id = target_comment_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
