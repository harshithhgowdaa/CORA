-- Add missing RLS policy for users to see their own record
create policy "Users can view own record"
    on public.users for select
    using (id = auth.uid());
