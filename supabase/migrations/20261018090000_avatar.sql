-- Ogni giocatore sceglie un avatar (id della libreria in packages/engine/src/avatar.ts).
alter table public.giocatori_partita
  add column avatar text not null default 'mago' check (avatar ~ '^[a-z-]{1,32}$');

-- Le funzioni dell'arbitro ricevono anche l'avatar.
drop function public.arbitro_crea_partita (uuid, text, text, text, jsonb, int);
drop function public.arbitro_unisciti (text, uuid, text);

create function public.arbitro_crea_partita (
  p_creatore uuid,
  p_nickname text,
  p_codice text,
  p_gioco text,
  p_opzioni jsonb,
  p_max int,
  p_avatar text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.partite (codice, gioco, creatore, opzioni, max_giocatori)
  values (p_codice, p_gioco, p_creatore, p_opzioni, p_max)
  returning id into v_id;

  insert into public.giocatori_partita (partita_id, utente_id, nickname, avatar)
  values (v_id, p_creatore, p_nickname, p_avatar);

  return v_id;
end;
$$;

create function public.arbitro_unisciti (p_codice text, p_utente uuid, p_nickname text, p_avatar text)
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

  insert into public.giocatori_partita (partita_id, utente_id, nickname, avatar)
  values (v_partita.id, p_utente, p_nickname, p_avatar);
  return v_partita.id;
end;
$$;

revoke all on function public.arbitro_crea_partita (uuid, text, text, text, jsonb, int, text) from public, anon, authenticated;
revoke all on function public.arbitro_unisciti (text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.arbitro_crea_partita (uuid, text, text, text, jsonb, int, text) to service_role;
grant execute on function public.arbitro_unisciti (text, uuid, text, text) to service_role;
