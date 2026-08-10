-- Keep removed users out of current ownership/workload while preserving history.
create or replace function public.cleanup_deactivated_cora_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.is_active is distinct from false and new.is_active = false then
    update public.relationship_assignments
      set is_active = false, end_date = coalesce(end_date, now())
      where user_id = new.id and org_id = new.org_id and is_active = true;

    update public.follow_ups
      set officer_id = null, updated_at = now()
      where officer_id = new.id and org_id = new.org_id;

    update public.initiatives
      set owner_id = null, updated_at = now()
      where owner_id = new.id and org_id = new.org_id;

    update public.opportunities
      set initiative_owner_id = null, updated_at = now()
      where initiative_owner_id = new.id and org_id = new.org_id;
  end if;
  return new;
end;
$$;

drop trigger if exists cleanup_deactivated_cora_user on public.users;
create trigger cleanup_deactivated_cora_user
after update of is_active on public.users
for each row execute function public.cleanup_deactivated_cora_user();

-- Repair users that were already removed before this migration was applied.
update public.relationship_assignments a
set is_active = false, end_date = coalesce(a.end_date, now())
from public.users u
where a.user_id = u.id and a.org_id = u.org_id and a.is_active = true and u.is_active = false;

update public.follow_ups f
set officer_id = null, updated_at = now()
from public.users u
where f.officer_id = u.id and f.org_id = u.org_id and u.is_active = false;

update public.initiatives i
set owner_id = null, updated_at = now()
from public.users u
where i.owner_id = u.id and i.org_id = u.org_id and u.is_active = false;

update public.opportunities o
set initiative_owner_id = null, updated_at = now()
from public.users u
where o.initiative_owner_id = u.id and o.org_id = u.org_id and u.is_active = false;
