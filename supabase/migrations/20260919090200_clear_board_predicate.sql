-- Supabase preloads pg-safeupdate for the PostgREST roles. It rejects any DELETE
-- with no WHERE clause (SQLSTATE 21000), and it applies inside SECURITY DEFINER
-- functions too. clear_board() is the one function that legitimately means "every
-- row", so it needs a predicate that is true for all of them.
--
-- The predicate must be one the planner cannot fold away: a constant such as
-- `where true`, or `where id is not null` on a NOT NULL column, can optimise to no
-- qual at all and trip the very same check. now() is stable, so it survives
-- planning. This is not a redundant condition -- do not "simplify" it.
create or replace function public.clear_board()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from groups where created_at <= now();
end;
$$;
