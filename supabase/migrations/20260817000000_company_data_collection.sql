-- Data-collection workspace: retain every spreadsheet column and research evidence.
alter table public.companies
  add column if not exists external_key text,
  add column if not exists imported_data jsonb not null default '{}'::jsonb,
  add column if not exists enrichment jsonb not null default '{}'::jsonb,
  add column if not exists enrichment_status text not null default 'not_researched'
    check (enrichment_status in ('not_researched', 'needs_review', 'verified', 'stale')),
  add column if not exists enriched_at timestamptz;

alter table public.contacts
  add column if not exists additional_details jsonb not null default '[]'::jsonb;

create index if not exists companies_org_external_key_idx
  on public.companies(org_id, external_key) where external_key is not null;
create index if not exists companies_imported_data_idx
  on public.companies using gin(imported_data);
create index if not exists contacts_additional_details_idx
  on public.contacts using gin(additional_details);

-- Atomic import/upsert. Existing records keep fields that are blank in a later file.
create or replace function public.import_company_rows(p_file_name text, p_rows jsonb)
returns table(inserted_count integer, updated_count integer, skipped_count integer, job_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.get_current_org_id();
  v_job_id uuid := gen_random_uuid();
  v_row jsonb;
  v_company_id uuid;
  v_inserted integer := 0;
  v_updated integer := 0;
  v_skipped integer := 0;
  v_name text;
  v_external_key text;
begin
  if v_org_id is null or not public.has_cora_role(array['admin', 'manager', 'officer', 'student_assistant']) then
    raise exception 'FORBIDDEN: You do not have permission to import companies';
  end if;
  if jsonb_array_length(p_rows) > 500 then
    raise exception 'VALIDATION: Import is limited to 500 rows at a time';
  end if;

  insert into public.import_jobs (id, org_id, created_by, entity_type, file_name, status, total_rows)
  values (v_job_id, v_org_id, auth.uid(), 'companies', left(coalesce(p_file_name, 'upload'), 255), 'importing', jsonb_array_length(p_rows));

  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_name := nullif(trim(v_row->>'name'), '');
    v_external_key := nullif(trim(v_row->>'external_key'), '');
    if v_name is null then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    select id into v_company_id
      from public.companies
      where org_id = v_org_id
        and ((v_external_key is not null and external_key = v_external_key) or lower(name) = lower(v_name))
      order by case when v_external_key is not null and external_key = v_external_key then 0 else 1 end
      limit 1;

    if v_company_id is null then
      insert into public.companies (org_id, name, external_key, industry, website, status, size, headquarters, description, tags, notes, imported_data)
      values (
        v_org_id, v_name, v_external_key,
        nullif(v_row->>'industry', ''), nullif(v_row->>'website', ''), coalesce(nullif(v_row->>'status', ''), 'Prospect'),
        nullif(v_row->>'size', ''), nullif(v_row->>'headquarters', ''), nullif(v_row->>'description', ''),
        coalesce(array(select jsonb_array_elements_text(coalesce(v_row->'tags', '[]'::jsonb))), '{}'),
        nullif(v_row->>'notes', ''), coalesce(v_row->'imported_data', '{}'::jsonb)
      );
      v_inserted := v_inserted + 1;
    else
      update public.companies set
        external_key = coalesce(v_external_key, external_key),
        name = coalesce(v_name, name),
        industry = coalesce(nullif(v_row->>'industry', ''), industry),
        website = coalesce(nullif(v_row->>'website', ''), website),
        status = coalesce(nullif(v_row->>'status', ''), status),
        size = coalesce(nullif(v_row->>'size', ''), size),
        headquarters = coalesce(nullif(v_row->>'headquarters', ''), headquarters),
        description = coalesce(nullif(v_row->>'description', ''), description),
        notes = coalesce(nullif(v_row->>'notes', ''), notes),
        tags = case when jsonb_array_length(coalesce(v_row->'tags', '[]'::jsonb)) > 0 then array(select jsonb_array_elements_text(v_row->'tags')) else tags end,
        imported_data = imported_data || coalesce(v_row->'imported_data', '{}'::jsonb),
        updated_at = now()
      where id = v_company_id and org_id = v_org_id;
      v_updated := v_updated + 1;
    end if;
  end loop;

  update public.import_jobs set status = 'completed', imported_rows = v_inserted + v_updated, error_rows = v_skipped, completed_at = now()
  where id = v_job_id;
  return query select v_inserted, v_updated, v_skipped, v_job_id;
exception when others then
  update public.import_jobs set status = 'failed', completed_at = now(), errors = jsonb_build_array(jsonb_build_object('message', sqlerrm)) where id = v_job_id;
  raise;
end;
$$;

grant execute on function public.import_company_rows(text, jsonb) to authenticated;
