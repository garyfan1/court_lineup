-- Queue position now confers a right: only the group at the head of the queue that
-- has all four players may take a free court. Replaces the earlier rule where any
-- group of any size could take any free court.
--
-- Enforced here rather than only in the UI: the six functions are the entire write
-- surface (ADR-0003), so a disabled button is decoration, not a rule.

create or replace function public.play_now(p_group_id uuid)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_group groups%rowtype;
  v_court int;
  v_rows  int;
begin
  select * into v_group from groups where id = p_group_id;

  if not found then
    raise exception 'That group is no longer on the board';
  end if;

  if v_group.court_id is not null then
    raise exception 'That group is already playing';
  end if;

  if cardinality(v_group.players) < 4 then
    raise exception 'Only a full group of four can take a court';
  end if;

  -- "First in the queue" means first among the FULL groups. A group of two sitting
  -- at the head blocks nobody; it is simply not in this comparison at all.
  --
  -- (created_at, id) rather than created_at alone so the order is total: two groups
  -- created in the same clock tick would otherwise both believe they were next.
  -- The client orders by the same pair, so the board and the rule always agree.
  if exists (
    select 1
      from groups g
     where g.court_id is null
       and cardinality(g.players) = 4
       and (g.created_at, g.id) < (v_group.created_at, v_group.id)
  ) then
    raise exception 'Another full group is ahead in the queue';
  end if;

  select c into v_court
    from generate_series(1, 3) as c
   where not exists (select 1 from groups g where g.court_id = c)
   order by c
   limit 1;

  if v_court is null then
    raise exception 'All three courts are in use';
  end if;

  begin
    update groups set court_id = v_court
     where id = p_group_id and court_id is null;
    get diagnostics v_rows = row_count;
  exception
    -- one_group_per_court fired: another phone took this court between the select
    -- and the update. Still reachable -- end_game frees a court at any moment, so
    -- two groups can be legitimately next-up for two different courts at once.
    when unique_violation then
      raise exception 'Court % was taken', v_court;
  end;

  if v_rows = 0 then
    raise exception 'That group is already playing';
  end if;

  return v_court;
end;
$$;

-- create or replace does not disturb grants, but say it anyway so the write surface
-- is legible from this file alone.
grant execute on function public.play_now(uuid) to anon, authenticated;
