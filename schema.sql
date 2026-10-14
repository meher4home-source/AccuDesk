create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  business text,
  country text,
  problems jsonb,
  plan text,
  trial_ends_at timestamptz not null,
  status text not null default 'trial',  -- trial | active | cancelled
  created_at timestamptz not null default now()
);
alter table public.accounts enable row level security; -- only the service key (api/signup.js) can access
