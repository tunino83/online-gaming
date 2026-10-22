-- Nella stessa partita due persone non possono avere lo stesso avatar
-- (i giocatori del computer, che hanno tutti il robot, non passano da qui).
create or replace function public.arbitro_unisciti (p_codice text, p_utente uuid, p_nickname text, p_avatar text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_partita public.partite;
  v_quanti int;
begin
  select * into v_partita from public.partite where codice = p_codice for update;
  if not found then
    raise exception 'CODICE_NON_VALIDO';
  end if;

  if exists (
    select 1 from public.giocatori_partita
    where partita_id = v_partita.id and utente_id = p_utente
  ) then
    return v_partita.id;
  end if;

  if v_partita.stato <> 'attesa' then
    raise exception 'PARTITA_INIZIATA';
  end if;

  select count(*) into v_quanti from public.giocatori_partita where partita_id = v_partita.id;
  if v_quanti >= v_partita.max_giocatori then
    raise exception 'PARTITA_PIENA';
  end if;

  if exists (
    select 1 from public.giocatori_partita
    where partita_id = v_partita.id and avatar = p_avatar
  ) then
    raise exception 'AVATAR_PRESO';
  end if;

  insert into public.giocatori_partita (partita_id, utente_id, nickname, avatar)
  values (v_partita.id, p_utente, p_nickname, p_avatar);
  return v_partita.id;
end;
$$;
