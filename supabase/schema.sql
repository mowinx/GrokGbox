-- Giftland schema for Supabase
-- Run this in the Supabase SQL editor

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  email text,
  birthday_day int,
  birthday_month int,
  username text unique,
  role text default 'user' check (role in ('user','vendor','admin')),
  kyc_status text default 'pending',
  referral_code text unique,
  referred_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  store_name text not null,
  address text,
  bank_name text,
  account_number text,
  account_name text,
  vat_rate numeric default 7.5,
  status text default 'pending' check (status in ('pending','approved','suspended')),
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references profiles(id),
  title text not null,
  event_type text,
  event_date date,
  location text,
  is_public boolean default false,
  image_url text,
  share_code text unique,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id),
  name text not null,
  price numeric not null,
  category text,
  description text,
  stock int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  product_id uuid references products(id),
  is_cash boolean default false,
  created_at timestamptz default now()
);

create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  sender_id uuid references profiles(id),
  product_id uuid references products(id),
  amount numeric,
  is_anonymous boolean default false,
  is_cash boolean default false,
  status text default 'pending' check (status in ('pending','processing','ready','delivered')),
  created_at timestamptz default now()
);

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  balance numeric default 0,
  updated_at timestamptz default now()
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references profiles(id),
  referred_id uuid references profiles(id),
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table events enable row level security;
alter table gifts enable row level security;
alter table vendors enable row level security;
alter table products enable row level security;
alter table wallets enable row level security;

create policy "Public read events" on events for select using (is_public = true or auth.uid() = host_id);
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);
create policy "Public read products" on products for select using (active = true);
