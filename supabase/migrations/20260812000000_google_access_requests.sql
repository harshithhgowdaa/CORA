-- Google Workspace approval workflow for the RVU organization.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.has_cora_role(allowed text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = any(allowed), false)
$$;

create or replace function public.get_current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.users where id = auth.uid()
$$;

alter table public.users add column if not exists is_active boolean not null default true;

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  requested_role text not null default 'officer' check (requested_role in ('admin', 'manager', 'officer', 'student_assistant', 'read_only')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id, org_id)
);

alter table public.access_requests enable row level security;
create policy access_requests_self_read on public.access_requests for select using (auth_user_id = auth.uid() or (org_id = public.get_current_org_id() and public.has_cora_role(array['admin'])));
create policy access_requests_self_insert on public.access_requests for insert with check (auth_user_id = auth.uid() and org_id = public.get_current_org_id());

create index if not exists access_requests_org_status_idx on public.access_requests(org_id, status, created_at desc);
create index if not exists users_org_active_idx on public.users(org_id, is_active, role);
