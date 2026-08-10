-- Treat legacy member accounts as officer-level users for the current CRM.
create or replace function public.current_user_role() returns text language sql stable security definer set search_path = public as $$
  select case when role = 'member' then 'officer' else role end from public.users where id = auth.uid()
$$;

-- Detach alumni references before a company is deleted.
create or replace function public.detach_company_alumni() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.alumni set current_company_id = null where current_company_id = old.id;
  return old;
end;
$$;
drop trigger if exists detach_company_alumni_before_delete on public.companies;
create trigger detach_company_alumni_before_delete before delete on public.companies for each row execute function public.detach_company_alumni();
