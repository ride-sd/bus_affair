create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  nickname text unique not null,
  approved boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
