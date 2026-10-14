-- Run once in Supabase SQL editor. Also: Auth > Providers > Email enabled.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, name text, business text, country text, plan text,
  problems jsonb default '[]',
  status text not null default 'trial',            -- trial | active | cancelled
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  number text, client text, issue_date date, items jsonb, tax_rate numeric default 0,
  subtotal numeric, tax numeric, total numeric, status text default 'unpaid',
  created_at timestamptz default now()
);
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  entry_date date, type text check (type in ('in','out')), category text,
  amount numeric not null, note text, invoice_id uuid,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
alter table public.invoices enable row level security;
alter table public.entries  enable row level security;
create policy "own profile read"  on public.profiles for select using (id = auth.uid());
-- no update policy on profiles: status is changed only by the webhook (service key)
create policy "own invoices" on public.invoices for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own entries"  on public.entries  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.new_profile() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id,email,name,business,country,plan,problems)
  values (new.id,new.email,new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'business',
          new.raw_user_meta_data->>'country',new.raw_user_meta_data->>'plan',
          coalesce(new.raw_user_meta_data->'problems','[]'::jsonb));
  return new;
end $$;
drop trigger if exists on_signup on auth.users;
create trigger on_signup after insert on auth.users for each row execute function public.new_profile();
