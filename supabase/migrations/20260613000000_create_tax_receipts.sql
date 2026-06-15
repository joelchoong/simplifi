create extension if not exists "pgcrypto";

create table if not exists public.tax_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tax_year integer not null,
  file_name text not null,
  storage_path text not null,
  amount numeric not null default 0,
  category_id text,
  sub_item_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tax_receipts_user_year_created_idx
  on public.tax_receipts (user_id, tax_year, created_at desc);

alter table public.tax_receipts enable row level security;

create or replace function public.set_tax_receipts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tax_receipts_updated_at on public.tax_receipts;

create trigger set_tax_receipts_updated_at
before update on public.tax_receipts
for each row
execute function public.set_tax_receipts_updated_at();

drop policy if exists "Users can view their own tax receipts" on public.tax_receipts;
create policy "Users can view their own tax receipts"
on public.tax_receipts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tax receipts" on public.tax_receipts;
create policy "Users can insert their own tax receipts"
on public.tax_receipts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tax receipts" on public.tax_receipts;
create policy "Users can update their own tax receipts"
on public.tax_receipts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own tax receipts" on public.tax_receipts;
create policy "Users can delete their own tax receipts"
on public.tax_receipts
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view their own receipt files" on storage.objects;
create policy "Users can view their own receipt files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can upload their own receipt files" on storage.objects;
create policy "Users can upload their own receipt files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update their own receipt files" on storage.objects;
create policy "Users can update their own receipt files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete their own receipt files" on storage.objects;
create policy "Users can delete their own receipt files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);
