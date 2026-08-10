-- RPC for Semantic Search on Alumni
create or replace function match_alumni (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  first_name text,
  last_name text,
  similarity float
)
language sql stable
as $$
  select
    alumni.id,
    alumni.first_name,
    alumni.last_name,
    1 - (alumni.embedding <=> query_embedding) as similarity
  from alumni
  where 1 - (alumni.embedding <=> query_embedding) > match_threshold
    -- enforce RLS manually in RPC if needed, though usually RPCs run with caller privileges
    and org_id = public.get_current_org_id()
  order by alumni.embedding <=> query_embedding
  limit match_count;
$$;
