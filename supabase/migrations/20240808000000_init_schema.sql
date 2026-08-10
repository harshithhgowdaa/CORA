-- Enable pgvector for semantic search
create extension if not exists vector;

-- Organizations
create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users (extends auth.users)
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    org_id uuid references public.organizations(id) not null,
    email text not null,
    full_name text not null,
    role text not null default 'member',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Companies
create table public.companies (
    id uuid primary key default gen_random_uuid(),
    org_id uuid references public.organizations(id) not null,
    name text not null,
    industry text,
    website text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alumni
create table public.alumni (
    id uuid primary key default gen_random_uuid(),
    org_id uuid references public.organizations(id) not null,
    first_name text not null,
    last_name text not null,
    email text,
    current_company_id uuid references public.companies(id),
    graduation_year integer,
    embedding vector(384), -- Using 384 dims for Xenova/all-MiniLM-L6-v2
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contacts
create table public.contacts (
    id uuid primary key default gen_random_uuid(),
    org_id uuid references public.organizations(id) not null,
    company_id uuid references public.companies(id) not null,
    first_name text not null,
    last_name text not null,
    email text,
    role text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Interactions
create table public.interactions (
    id uuid primary key default gen_random_uuid(),
    org_id uuid references public.organizations(id) not null,
    type text not null, -- 'email', 'call', 'meeting'
    notes text not null,
    date timestamp with time zone not null,
    company_id uuid references public.companies(id),
    alumni_id uuid references public.alumni(id),
    contact_id uuid references public.contacts(id),
    author_id uuid references public.users(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for search
create index idx_companies_name on public.companies using gin (to_tsvector('english', name));
create index idx_alumni_name on public.alumni using gin (to_tsvector('english', first_name || ' ' || last_name));
create index idx_alumni_embedding on public.alumni using hnsw (embedding vector_cosine_ops);

-- RLS setup (Row Level Security)
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.alumni enable row level security;
alter table public.contacts enable row level security;
alter table public.interactions enable row level security;

-- Create helper function to get current user's org_id
create or replace function public.get_current_org_id()
returns uuid
language sql stable
as $$
  select org_id from public.users where id = auth.uid();
$$;

-- RLS Policies
-- Users can read their own organization
create policy "Users can view own organization"
    on public.organizations for select
    using (id = public.get_current_org_id());

-- Users can view other users in their organization
create policy "Users can view org members"
    on public.users for select
    using (org_id = public.get_current_org_id());

-- Users can view/edit companies in their organization
create policy "Users can view org companies"
    on public.companies for select using (org_id = public.get_current_org_id());
create policy "Users can insert org companies"
    on public.companies for insert with check (org_id = public.get_current_org_id());
create policy "Users can update org companies"
    on public.companies for update using (org_id = public.get_current_org_id());
create policy "Users can delete org companies"
    on public.companies for delete using (org_id = public.get_current_org_id());

-- Alumni policies
create policy "Users can view org alumni"
    on public.alumni for select using (org_id = public.get_current_org_id());
create policy "Users can insert org alumni"
    on public.alumni for insert with check (org_id = public.get_current_org_id());
create policy "Users can update org alumni"
    on public.alumni for update using (org_id = public.get_current_org_id());
create policy "Users can delete org alumni"
    on public.alumni for delete using (org_id = public.get_current_org_id());

-- Contacts policies
create policy "Users can view org contacts"
    on public.contacts for select using (org_id = public.get_current_org_id());
create policy "Users can insert org contacts"
    on public.contacts for insert with check (org_id = public.get_current_org_id());
create policy "Users can update org contacts"
    on public.contacts for update using (org_id = public.get_current_org_id());
create policy "Users can delete org contacts"
    on public.contacts for delete using (org_id = public.get_current_org_id());

-- Interactions policies
create policy "Users can view org interactions"
    on public.interactions for select using (org_id = public.get_current_org_id());
create policy "Users can insert org interactions"
    on public.interactions for insert with check (org_id = public.get_current_org_id());
create policy "Users can update org interactions"
    on public.interactions for update using (org_id = public.get_current_org_id());
create policy "Users can delete org interactions"
    on public.interactions for delete using (org_id = public.get_current_org_id());
