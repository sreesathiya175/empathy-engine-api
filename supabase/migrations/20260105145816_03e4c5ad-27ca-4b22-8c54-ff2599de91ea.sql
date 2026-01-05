-- Create enum types for the system
CREATE TYPE public.app_role AS ENUM ('citizen', 'employee', 'admin');
CREATE TYPE public.grievance_category AS ENUM ('IT', 'HR', 'Infrastructure', 'Academic', 'Finance', 'Administration', 'Other');
CREATE TYPE public.sentiment_type AS ENUM ('highly_negative', 'negative', 'neutral', 'positive');
CREATE TYPE public.priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.grievance_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create grievances table
CREATE TABLE public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category grievance_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sentiment sentiment_type NOT NULL DEFAULT 'neutral',
  priority priority_level NOT NULL DEFAULT 'low',
  status grievance_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create grievance_comments table
CREATE TABLE public.grievance_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id UUID REFERENCES public.grievances(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_comments ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Grievances policies
CREATE POLICY "Users can view own grievances" ON public.grievances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Employees can view all grievances" ON public.grievances FOR SELECT USING (public.has_role(auth.uid(), 'employee') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create grievances" ON public.grievances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own grievances" ON public.grievances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff can update grievances" ON public.grievances FOR UPDATE USING (public.has_role(auth.uid(), 'employee') OR public.has_role(auth.uid(), 'admin'));

-- Grievance comments policies
CREATE POLICY "Users can view comments on own grievances" ON public.grievance_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.grievances WHERE id = grievance_id AND user_id = auth.uid())
);
CREATE POLICY "Staff can view all comments" ON public.grievance_comments FOR SELECT USING (public.has_role(auth.uid(), 'employee') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can add comments" ON public.grievance_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'citizen'));
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();