create table if not exists public.tax_category_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tax_year integer not null,
  category_id text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tax_category_preferences_status_check check (status in ('active', 'na')),
  constraint tax_category_preferences_user_year_category_unique unique (user_id, tax_year, category_id)
);

create index if not exists tax_category_preferences_user_year_idx
  on public.tax_category_preferences (user_id, tax_year);

alter table public.tax_category_preferences enable row level security;

create or replace function public.set_tax_category_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tax_category_preferences_updated_at on public.tax_category_preferences;

create trigger set_tax_category_preferences_updated_at
before update on public.tax_category_preferences
for each row
execute function public.set_tax_category_preferences_updated_at();

drop policy if exists "Users can view their own tax category preferences" on public.tax_category_preferences;
create policy "Users can view their own tax category preferences"
on public.tax_category_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tax category preferences" on public.tax_category_preferences;
create policy "Users can insert their own tax category preferences"
on public.tax_category_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tax category preferences" on public.tax_category_preferences;
create policy "Users can update their own tax category preferences"
on public.tax_category_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own tax category preferences" on public.tax_category_preferences;
create policy "Users can delete their own tax category preferences"
on public.tax_category_preferences
for delete
to authenticated
using (auth.uid() = user_id);

insert into public.tax_category_preferences (user_id, tax_year, category_id, status)
select
  receipt.user_id,
  receipt.tax_year,
  na_category.category_id,
  'na'
from public.tax_receipts receipt
cross join lateral jsonb_array_elements_text(coalesce(receipt.metadata->'na_categories', '[]'::jsonb)) as na_category(category_id)
where receipt.category_id = 'system_setting'
on conflict (user_id, tax_year, category_id)
do update set status = excluded.status;

delete from public.tax_receipts
where category_id = 'system_setting';
