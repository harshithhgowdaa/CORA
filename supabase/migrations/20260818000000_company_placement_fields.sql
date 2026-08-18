-- Canonical fields for placement research imports. These fields remove ambiguity
-- while preserving any unrecognised spreadsheet columns in imported_data.
alter table public.companies
  add column if not exists sector text,
  add column if not exists company_type text,
  add column if not exists india_headquarters text,
  add column if not exists state text,
  add column if not exists careers_url text,
  add column if not exists linkedin_company_url text,
  add column if not exists bengaluru_presence boolean,
  add column if not exists rvu_priority text,
  add column if not exists hiring_freshers boolean,
  add column if not exists internship_program boolean,
  add column if not exists graduate_programs text,
  add column if not exists courses_eligible text,
  add column if not exists typical_roles text,
  add column if not exists hiring_months text,
  add column if not exists ctc_range text,
  add column if not exists campus_hiring boolean,
  add column if not exists hiring_process text,
  add column if not exists ats_platform text,
  add column if not exists diversity_hiring boolean,
  add column if not exists ppo_program boolean,
  add column if not exists office_address text,
  add column if not exists previous_recruitment text,
  add column if not exists relevant_rvu_schools text,
  add column if not exists existing_rvu_connect text,
  add column if not exists evidence_url text,
  add column if not exists last_verified_at date,
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending_review', 'verified', 'stale')),
  add column if not exists public_recruitment_email text,
  add column if not exists public_phone text,
  add column if not exists hr_head_name text,
  add column if not exists talent_acquisition_head_name text,
  add column if not exists campus_recruitment_lead_name text,
  add column if not exists recruiter_designation text,
  add column if not exists recruiter_linkedin_url text,
  add column if not exists ceo_name text,
  add column if not exists founders text,
  add column if not exists founded_year integer;

create index if not exists companies_org_sector_idx on public.companies(org_id, sector);
create index if not exists companies_org_verification_idx on public.companies(org_id, verification_status);

create or replace function public.import_company_rows(p_file_name text, p_rows jsonb)
returns table(inserted_count integer, updated_count integer, skipped_count integer, job_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  v_org_id uuid := public.get_current_org_id(); v_job_id uuid := gen_random_uuid(); v_row jsonb;
  v_company_id uuid; v_inserted integer := 0; v_updated integer := 0; v_skipped integer := 0;
  v_name text; v_external_key text;
begin
  if v_org_id is null or not public.has_cora_role(array['admin', 'manager', 'officer', 'student_assistant']) then raise exception 'FORBIDDEN: You do not have permission to import companies'; end if;
  if jsonb_array_length(p_rows) > 500 then raise exception 'VALIDATION: Import is limited to 500 rows at a time'; end if;
  insert into public.import_jobs (id, org_id, created_by, entity_type, file_name, status, total_rows) values (v_job_id, v_org_id, auth.uid(), 'companies', left(coalesce(p_file_name, 'upload'), 255), 'importing', jsonb_array_length(p_rows));
  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_name := nullif(trim(v_row->>'name'), ''); v_external_key := nullif(trim(v_row->>'external_key'), '');
    if v_name is null then v_skipped := v_skipped + 1; continue; end if;
    select id into v_company_id from public.companies where org_id = v_org_id and ((v_external_key is not null and external_key = v_external_key) or lower(name) = lower(v_name)) order by case when v_external_key is not null and external_key = v_external_key then 0 else 1 end limit 1;
    if v_company_id is null then
      insert into public.companies (org_id, name, external_key, industry, website, status, size, headquarters, description, tags, notes, imported_data, sector, company_type, india_headquarters, state, careers_url, linkedin_company_url, bengaluru_presence, rvu_priority, hiring_freshers, internship_program, graduate_programs, courses_eligible, typical_roles, hiring_months, ctc_range, campus_hiring, hiring_process, ats_platform, diversity_hiring, ppo_program, office_address, previous_recruitment, relevant_rvu_schools, existing_rvu_connect, evidence_url, last_verified_at, verification_status, public_recruitment_email, public_phone, hr_head_name, talent_acquisition_head_name, campus_recruitment_lead_name, recruiter_designation, recruiter_linkedin_url, ceo_name, founders, founded_year)
      values (v_org_id, v_name, v_external_key, nullif(v_row->>'industry',''), nullif(v_row->>'website',''), coalesce(nullif(v_row->>'status',''), 'Prospect'), nullif(v_row->>'size',''), nullif(v_row->>'headquarters',''), nullif(v_row->>'description',''), coalesce(array(select jsonb_array_elements_text(coalesce(v_row->'tags', '[]'::jsonb))), '{}'), nullif(v_row->>'notes',''), coalesce(v_row->'imported_data','{}'::jsonb), nullif(v_row->>'sector',''), nullif(v_row->>'company_type',''), nullif(v_row->>'india_headquarters',''), nullif(v_row->>'state',''), nullif(v_row->>'careers_url',''), nullif(v_row->>'linkedin_company_url',''), nullif(v_row->>'bengaluru_presence','')::boolean, nullif(v_row->>'rvu_priority',''), nullif(v_row->>'hiring_freshers','')::boolean, nullif(v_row->>'internship_program','')::boolean, nullif(v_row->>'graduate_programs',''), nullif(v_row->>'courses_eligible',''), nullif(v_row->>'typical_roles',''), nullif(v_row->>'hiring_months',''), nullif(v_row->>'ctc_range',''), nullif(v_row->>'campus_hiring','')::boolean, nullif(v_row->>'hiring_process',''), nullif(v_row->>'ats_platform',''), nullif(v_row->>'diversity_hiring','')::boolean, nullif(v_row->>'ppo_program','')::boolean, nullif(v_row->>'office_address',''), nullif(v_row->>'previous_recruitment',''), nullif(v_row->>'relevant_rvu_schools',''), nullif(v_row->>'existing_rvu_connect',''), nullif(v_row->>'evidence_url',''), nullif(v_row->>'last_verified_at','')::date, coalesce(nullif(v_row->>'verification_status',''), 'unverified'), nullif(v_row->>'public_recruitment_email',''), nullif(v_row->>'public_phone',''), nullif(v_row->>'hr_head_name',''), nullif(v_row->>'talent_acquisition_head_name',''), nullif(v_row->>'campus_recruitment_lead_name',''), nullif(v_row->>'recruiter_designation',''), nullif(v_row->>'recruiter_linkedin_url',''), nullif(v_row->>'ceo_name',''), nullif(v_row->>'founders',''), nullif(v_row->>'founded_year','')::integer);
      v_inserted := v_inserted + 1;
    else
      update public.companies set external_key = coalesce(v_external_key, external_key), name = v_name, industry = coalesce(nullif(v_row->>'industry',''), industry), website = coalesce(nullif(v_row->>'website',''), website), status = coalesce(nullif(v_row->>'status',''), status), size = coalesce(nullif(v_row->>'size', ''), size), headquarters = coalesce(nullif(v_row->>'headquarters', ''), headquarters), description = coalesce(nullif(v_row->>'description', ''), description), tags = case when jsonb_array_length(coalesce(v_row->'tags', '[]'::jsonb)) > 0 then array(select jsonb_array_elements_text(v_row->'tags')) else tags end, imported_data = imported_data || coalesce(v_row->'imported_data','{}'::jsonb), sector = coalesce(nullif(v_row->>'sector',''), sector), company_type = coalesce(nullif(v_row->>'company_type',''), company_type), india_headquarters = coalesce(nullif(v_row->>'india_headquarters',''), india_headquarters), state = coalesce(nullif(v_row->>'state',''), state), careers_url = coalesce(nullif(v_row->>'careers_url',''), careers_url), linkedin_company_url = coalesce(nullif(v_row->>'linkedin_company_url',''), linkedin_company_url), evidence_url = coalesce(nullif(v_row->>'evidence_url',''), evidence_url), verification_status = coalesce(nullif(v_row->>'verification_status',''), verification_status), bengaluru_presence = coalesce(nullif(v_row->>'bengaluru_presence','')::boolean, bengaluru_presence), rvu_priority = coalesce(nullif(v_row->>'rvu_priority',''), rvu_priority), hiring_freshers = coalesce(nullif(v_row->>'hiring_freshers','')::boolean, hiring_freshers), internship_program = coalesce(nullif(v_row->>'internship_program','')::boolean, internship_program), graduate_programs = coalesce(nullif(v_row->>'graduate_programs',''), graduate_programs), courses_eligible = coalesce(nullif(v_row->>'courses_eligible',''), courses_eligible), typical_roles = coalesce(nullif(v_row->>'typical_roles',''), typical_roles), hiring_months = coalesce(nullif(v_row->>'hiring_months',''), hiring_months), ctc_range = coalesce(nullif(v_row->>'ctc_range',''), ctc_range), campus_hiring = coalesce(nullif(v_row->>'campus_hiring','')::boolean, campus_hiring), hiring_process = coalesce(nullif(v_row->>'hiring_process',''), hiring_process), ats_platform = coalesce(nullif(v_row->>'ats_platform',''), ats_platform), diversity_hiring = coalesce(nullif(v_row->>'diversity_hiring','')::boolean, diversity_hiring), ppo_program = coalesce(nullif(v_row->>'ppo_program','')::boolean, ppo_program), office_address = coalesce(nullif(v_row->>'office_address',''), office_address), previous_recruitment = coalesce(nullif(v_row->>'previous_recruitment',''), previous_recruitment), relevant_rvu_schools = coalesce(nullif(v_row->>'relevant_rvu_schools',''), relevant_rvu_schools), existing_rvu_connect = coalesce(nullif(v_row->>'existing_rvu_connect',''), existing_rvu_connect), last_verified_at = coalesce(nullif(v_row->>'last_verified_at','')::date, last_verified_at), public_recruitment_email = coalesce(nullif(v_row->>'public_recruitment_email',''), public_recruitment_email), public_phone = coalesce(nullif(v_row->>'public_phone',''), public_phone), hr_head_name = coalesce(nullif(v_row->>'hr_head_name',''), hr_head_name), talent_acquisition_head_name = coalesce(nullif(v_row->>'talent_acquisition_head_name',''), talent_acquisition_head_name), campus_recruitment_lead_name = coalesce(nullif(v_row->>'campus_recruitment_lead_name',''), campus_recruitment_lead_name), recruiter_designation = coalesce(nullif(v_row->>'recruiter_designation',''), recruiter_designation), recruiter_linkedin_url = coalesce(nullif(v_row->>'recruiter_linkedin_url',''), recruiter_linkedin_url), ceo_name = coalesce(nullif(v_row->>'ceo_name',''), ceo_name), founders = coalesce(nullif(v_row->>'founders',''), founders), founded_year = coalesce(nullif(v_row->>'founded_year','')::integer, founded_year), notes = coalesce(nullif(v_row->>'notes',''), notes), updated_at = now() where id = v_company_id and org_id = v_org_id;
      v_updated := v_updated + 1;
    end if;
  end loop;
  update public.import_jobs set status='completed', imported_rows=v_inserted+v_updated, error_rows=v_skipped, completed_at=now() where id=v_job_id;
  return query select v_inserted, v_updated, v_skipped, v_job_id;
exception when others then update public.import_jobs set status='failed', completed_at=now(), errors=jsonb_build_array(jsonb_build_object('message',sqlerrm)) where id=v_job_id; raise;
end; $$;
