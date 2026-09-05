CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN (SELECT count(*) FROM auth.users) = 1
      THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_any_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM auth.users) $$;

GRANT EXECUTE ON FUNCTION public.has_any_user() TO anon, authenticated;