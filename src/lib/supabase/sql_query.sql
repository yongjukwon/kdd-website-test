-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. users (auth.users 연동)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  job_category TEXT,
  job_title TEXT,
  profile_image TEXT,
  role TEXT DEFAULT 'user',  -- 'user', 'admin'
  newsletter_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  date TIMESTAMP NOT NULL,
  location TEXT,
  description TEXT,
  price NUMERIC DEFAULT 0,
  capacity INTEGER,
  poster_image TEXT,
  is_online BOOLEAN DEFAULT false,
  online_url TEXT,
  rsvp_deadline TIMESTAMP,
  is_published BOOLEAN DEFAULT false,
  organizer_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. event_participants
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('going', 'cancelled', 'waitlisted')) DEFAULT 'going',
  rsvp_at TIMESTAMP DEFAULT now(),
  cancelled_at TIMESTAMP,
  is_checked_in BOOLEAN DEFAULT false
);

-- 4. photos
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  caption TEXT,
  uploaded_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. newsletter_subscriptions
CREATE TABLE public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),  -- nullable
  email TEXT NOT NULL,
  status TEXT CHECK (status IN ('subscribed', 'unsubscribed')) NOT NULL,
  changed_at TIMESTAMP DEFAULT now()
);

-- 6. Trigger function: when a new auth user is created, insert into users table
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger: connect auth.users to users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();