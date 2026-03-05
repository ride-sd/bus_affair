-- Seed data lives in migrations/20260303000000_seed_base_data.sql
-- so it is applied to all environments via supabase db push.

-- Local dev admin user (local only — seed.sql is never run in production/staging)
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@stub.busaffair.com',
    crypt('password', gen_salt('bf')),
    now(), now(), now(),
    '{"nickname": "admin", "display_name": "admin"}',
    '', '', '', ''
  );

  -- The on_auth_user_created trigger already inserted the profile row;
  -- just elevate it to approved admin.
  UPDATE public.profiles SET approved = true, is_admin = true WHERE id = admin_id;
END $$;
