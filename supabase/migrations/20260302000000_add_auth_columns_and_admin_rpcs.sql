-- ============================================================================
-- 1. ADD AUTH COLUMNS TO PROFILES
-- ============================================================================

alter table profiles add column nickname text unique not null default '';
alter table profiles add column approved boolean not null default false;
alter table profiles add column is_admin boolean not null default false;

-- ============================================================================
-- 2. UPDATE handle_new_user TRIGGER TO SET NICKNAME
-- ============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', null),
    coalesce(new.raw_user_meta_data->>'nickname', '')
  );
  return new;
end;
$$;

-- ============================================================================
-- 3. RPC: approve_user
-- ============================================================================

create or replace function approve_user(target_user_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Check caller is admin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ) then
    raise exception 'Only admins can approve users';
  end if;

  update public.profiles set approved = true where id = target_user_id;
end;
$$;

-- ============================================================================
-- 4. RPC: admin_reset_password
-- ============================================================================

create or replace function admin_reset_password(target_user_id uuid, new_password text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Check caller is admin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ) then
    raise exception 'Only admins can reset passwords';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf'))
  where id = target_user_id;
end;
$$;

-- ============================================================================
-- 5. RPC: get_pending_users
-- ============================================================================

create or replace function get_pending_users()
returns table (id uuid, nickname text, created_at timestamptz)
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Check caller is admin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ) then
    raise exception 'Only admins can view pending users';
  end if;

  return query
    select p.id, p.nickname, p.created_at
    from public.profiles p
    where p.approved = false
    order by p.created_at;
end;
$$;

-- ============================================================================
-- 6. RPC: get_all_users
-- ============================================================================

create or replace function get_all_users()
returns table (id uuid, nickname text, approved boolean, is_admin boolean, created_at timestamptz)
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Check caller is admin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  ) then
    raise exception 'Only admins can view all users';
  end if;

  return query
    select p.id, p.nickname, p.approved, p.is_admin, p.created_at
    from public.profiles p
    order by p.created_at;
end;
$$;

