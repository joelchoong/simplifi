create extension if not exists "pgcrypto";

create table if not exists public.net_worth_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_month date not null,
  total_cash numeric not null default 0,
  total_investments numeric not null default 0,
  total_property numeric not null default 0,
  total_liabilities numeric not null default 0,
  net_worth numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint net_worth_records_user_month_unique unique (user_id, entry_month)
);

create index if not exists net_worth_records_user_id_entry_month_idx
  on public.net_worth_records (user_id, entry_month desc);

alter table public.net_worth_records enable row level security;

create or replace function public.set_net_worth_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_net_worth_records_updated_at on public.net_worth_records;

create trigger set_net_worth_records_updated_at
before update on public.net_worth_records
for each row
execute function public.set_net_worth_records_updated_at();

drop policy if exists "Users can view their own net worth records" on public.net_worth_records;
create policy "Users can view their own net worth records"
on public.net_worth_records
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own net worth records" on public.net_worth_records;
create policy "Users can insert their own net worth records"
on public.net_worth_records
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own net worth records" on public.net_worth_records;
create policy "Users can update their own net worth records"
on public.net_worth_records
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own net worth records" on public.net_worth_records;
create policy "Users can delete their own net worth records"
on public.net_worth_records
for delete
using (auth.uid() = user_id);
