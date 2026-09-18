-- The six functions are the entire write API. `anon` has SELECT on groups and
-- EXECUTE on these, and nothing else.
--
-- Every failure raises, so the client has exactly one error path. The messages are
-- written to be shown to a person standing on a badminton court, not to a developer.

-- Internal. Not granted to anon.
create or replace function public.clean_name(p_name text)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
begin
  if v_name = '' then
    raise exception 'Type a name first';
  end if;
  if char_length(v_name) > 24 then
    raise exception 'That name is too long';
  end if;
  return v_name;
end;
$$;

-- Creating a group is the act of entering your own name as its first member.
-- A group is never empty (CONTEXT.md: Group).
create or replace function public.create_group(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text := clean_name(p_name);
  v_id   uuid;
begin
  -- Blast-radius cap, not a permission. ~10x the busiest real evening, so no human
  -- will ever meet it. See ADR-0002.
  if (select count(*) from groups) >= 50 then
    raise exception 'The board is full';
  end if;

  insert into groups (players) values (array[v_name]) returning id into v_id;
  return v_id;
end;
$$;

-- Anyone may join any open group. The cap lives in the WHERE clause, so two phones
-- taking the last slot at once cannot both succeed.
create or replace function public.join_group(p_group_id uuid, p_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text := clean_name(p_name);
  v_rows int;
begin
  update groups
     set players = players || v_name
   where id = p_group_id
     and court_id is null
     and cardinality(players) < 4;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'That group is full or already playing';
  end if;
end;
$$;

-- Removal is by position, checked against the name the screen was showing. Without
-- that check, two simultaneous removals shift the array under each other and delete
-- the wrong person -- which matters because duplicate names are allowed.
-- A group ceases to exist when its last member leaves.
create or replace function public.leave_group(p_group_id uuid, p_index int, p_expected_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_players text[];
begin
  select players into v_players
    from groups
   where id = p_group_id and court_id is null
     for update;

  if not found then
    raise exception 'That group is already playing';
  end if;

  if p_index < 1 or p_index > cardinality(v_players)
     or v_players[p_index] is distinct from p_expected_name then
    raise exception 'That name has already gone';
  end if;

  if cardinality(v_players) = 1 then
    delete from groups where id = p_group_id;
  else
    update groups
       set players = v_players[1:p_index - 1] || v_players[p_index + 1:]
     where id = p_group_id;
  end if;
end;
$$;

-- Placement IS the start of play; there is no separate "start the game" step
-- (CONTEXT.md: Placement). Any group may take any free court regardless of queue
-- position (ADR-0001). Underfull groups are placed as they are; the missing slots
-- render as "x".
create or replace function public.play_now(p_group_id uuid)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_court int;
  v_rows  int;
begin
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
    -- and the update. This is the normal case, not an edge case.
    when unique_violation then
      raise exception 'Court % was taken', v_court;
  end;

  if v_rows = 0 then
    raise exception 'That group is already playing';
  end if;

  return v_court;
end;
$$;

-- Ending a game clears the court. Nobody is requeued; names get retyped.
create or replace function public.end_game(p_court_id int)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from groups where court_id = p_court_id;
  if not found then
    raise exception 'That court is already empty';
  end if;
end;
$$;

-- The manual reset. No auto-expiry anywhere in this system: the app records what
-- humans decide, it never referees.
create or replace function public.clear_board()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from groups;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default, so every function is revoked and
-- then granted deliberately. clean_name is internal and stays revoked.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.create_group(text)            to anon, authenticated;
grant execute on function public.join_group(uuid, text)        to anon, authenticated;
grant execute on function public.leave_group(uuid, int, text)  to anon, authenticated;
grant execute on function public.play_now(uuid)                to anon, authenticated;
grant execute on function public.end_game(int)                 to anon, authenticated;
grant execute on function public.clear_board()                 to anon, authenticated;
