-- Enable extensions (if not enabled)
create extension if not exists pgcrypto with schema public;
create extension if not exists pgjwt with schema public;

-- Tables
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text unique,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price_cents int not null check (price_cents >= 0),
  active boolean default true
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  service_id uuid references public.services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'booked' check (status in ('booked','confirmed','done','cancelled'))
);

create index if not exists appointments_starts_at_idx on public.appointments(starts_at);

-- RLS
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
