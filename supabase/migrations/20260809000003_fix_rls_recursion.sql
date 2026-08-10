-- Fix the infinite recursion in RLS by using security definer
create or replace function public.get_current_org_id()
returns uuid
language sql security definer set search_path = public
as $$
  select org_id from public.users where id = auth.uid();
$$;
