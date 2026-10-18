-- Modalità di prova: giocatori controllati dal computer (bot), che muovono dentro l'arbitro.
alter table public.giocatori_partita add column bot boolean not null default false;

-- Aggiunge un bot a una partita ancora in attesa (solo l'arbitro).
create function public.arbitro_aggiungi_bot (p_partita uuid, p_utente uuid, p_nickname text, p_avatar text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.partite where id = p_partita and stato = 'attesa') then
    raise exception 'PARTITA_INIZIATA';
  end if;
  insert into public.giocatori_partita (partita_id, utente_id, nickname, avatar, bot)
  values (p_partita, p_utente, p_nickname, p_avatar, true);
end;
$$;

revoke all on function public.arbitro_aggiungi_bot (uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.arbitro_aggiungi_bot (uuid, uuid, text, text) to service_role;
