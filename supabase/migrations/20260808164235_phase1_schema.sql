-- Add new fields to interactions
ALTER TABLE interactions
  ADD COLUMN initiative_id uuid, -- will reference initiatives later
  ADD COLUMN outcome text;

-- Create Relationship Assignments Table
CREATE TABLE relationship_assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  assignment_type text not null check (assignment_type in ('PRIMARY', 'SUPPORT')),
  start_date timestamptz default now(),
  end_date timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS for relationship_assignments
ALTER TABLE relationship_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments are viewable by users in the same org" 
  ON relationship_assignments FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Assignments are insertable by users in the same org" 
  ON relationship_assignments FOR INSERT WITH CHECK (org_id = public.get_current_org_id());
CREATE POLICY "Assignments are updatable by users in the same org" 
  ON relationship_assignments FOR UPDATE USING (org_id = public.get_current_org_id());
CREATE POLICY "Assignments are deletable by users in the same org" 
  ON relationship_assignments FOR DELETE USING (org_id = public.get_current_org_id());

-- Create Initiatives Table
CREATE TABLE initiatives (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  type text,
  owner_id uuid references users(id) on delete set null,
  status text default 'Active',
  priority text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for initiatives
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Initiatives are viewable by users in the same org" 
  ON initiatives FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Initiatives are insertable by users in the same org" 
  ON initiatives FOR INSERT WITH CHECK (org_id = public.get_current_org_id());
CREATE POLICY "Initiatives are updatable by users in the same org" 
  ON initiatives FOR UPDATE USING (org_id = public.get_current_org_id());
CREATE POLICY "Initiatives are deletable by users in the same org" 
  ON initiatives FOR DELETE USING (org_id = public.get_current_org_id());

-- Add foreign key to interactions now that initiatives table exists
ALTER TABLE interactions
  ADD CONSTRAINT fk_interaction_initiative FOREIGN KEY (initiative_id) REFERENCES initiatives(id) ON DELETE SET NULL;

-- Create Opportunities Table
CREATE TABLE opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  initiative_owner_id uuid references users(id) on delete set null,
  title text not null,
  type text,
  stage text not null default 'Prospect',
  probability integer check (probability >= 0 and probability <= 100),
  expected_close date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opportunities are viewable by users in the same org" 
  ON opportunities FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Opportunities are insertable by users in the same org" 
  ON opportunities FOR INSERT WITH CHECK (org_id = public.get_current_org_id());
CREATE POLICY "Opportunities are updatable by users in the same org" 
  ON opportunities FOR UPDATE USING (org_id = public.get_current_org_id());
CREATE POLICY "Opportunities are deletable by users in the same org" 
  ON opportunities FOR DELETE USING (org_id = public.get_current_org_id());

-- Create Follow Ups Table
CREATE TABLE follow_ups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  interaction_id uuid references interactions(id) on delete cascade,
  officer_id uuid references users(id) on delete set null,
  initiative_id uuid references initiatives(id) on delete cascade,
  title text not null,
  due_date timestamptz,
  priority text,
  status text default 'Pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for follow_ups
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Followups are viewable by users in the same org" 
  ON follow_ups FOR SELECT USING (org_id = public.get_current_org_id());
CREATE POLICY "Followups are insertable by users in the same org" 
  ON follow_ups FOR INSERT WITH CHECK (org_id = public.get_current_org_id());
CREATE POLICY "Followups are updatable by users in the same org" 
  ON follow_ups FOR UPDATE USING (org_id = public.get_current_org_id());
CREATE POLICY "Followups are deletable by users in the same org" 
  ON follow_ups FOR DELETE USING (org_id = public.get_current_org_id());
