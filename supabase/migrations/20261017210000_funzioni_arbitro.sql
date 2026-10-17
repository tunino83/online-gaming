-- Funzioni usate SOLO dall'arbitro (chiave di servizio). Ognuna è un'unica transazione:
-- o va tutto a buon fine, o non cambia nulla. Gli errori hanno codici in maiuscolo
-- che l'arbitro traduce in messaggi per il giocatore.

create function public.arbitro_crea_partita (
  p_creatore uuid,
  p_nickname text,
  p_codice text,
  p_gioco text,
  p_opzioni jsonb,
  p_max int
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

  insert into public.giocatori_partita (partita_id, utente_id, nickname)
  values (v_id, p_creatore, p_nickname);

  return v_id;
end;
$$;

create function public.arbitro_unisciti (p_codice text, p_utente uuid, p_nickname text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_partita public.partite;
  v_quanti int;
begin
  -- "for update": blocca la partita finché non abbiamo finito, così due ingressi
  -- contemporanei non superano il numero massimo di giocatori.
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

  insert into public.giocatori_partita (partita_id, utente_id, nickname)
  values (v_partita.id, p_utente, p_nickname);
  return v_partita.id;
end;
$$;

-- Salva stato, viste di tutti, mossa e stato della partita.
-- p_versione_attesa null = avvio della partita.
create function public.arbitro_salva (
  p_partita uuid,
  p_versione_attesa int,
  p_stato jsonb,
  p_viste jsonb,
  p_utente uuid,
  p_mossa jsonb,
  p_stato_partita text,
  p_esito jsonb
)
returns int
language plpgsql
set search_path = ''
as $$
declare
  v_versione int;
  v_vista jsonb;
begin
  if p_versione_attesa is null then
    update public.partite
      set stato = p_stato_partita, aggiornata_il = now()
      where id = p_partita and stato = 'attesa';
    if not found then
      raise exception 'PARTITA_GIA_AVVIATA';
    end if;
    insert into public.stati_partita (partita_id, stato, versione) values (p_partita, p_stato, 0);
    v_versione := 0;
  else
    -- Si salva solo se nessun altro ha salvato nel frattempo (stessa versione letta).
    update public.stati_partita
      set stato = p_stato, versione = versione + 1, aggiornato_il = now()
      where partita_id = p_partita and versione = p_versione_attesa
      returning versione into v_versione;
    if not found then
      raise exception 'CONFLITTO';
    end if;

    update public.partite
      set stato = p_stato_partita, esito = p_esito, aggiornata_il = now()
      where id = p_partita;

    if p_mossa is not null then
      insert into public.mosse (partita_id, numero, utente_id, mossa)
      values (p_partita, v_versione, p_utente, p_mossa);
    end if;
  end if;

  for v_vista in select * from jsonb_array_elements(p_viste) loop
    insert into public.viste (partita_id, utente_id, vista, mosse_valide, versione, aggiornata_il)
    values (
      p_partita,
      (v_vista ->> 'utente_id')::uuid,
      v_vista -> 'vista',
      v_vista -> 'mosse_valide',
      v_versione,
      now()
    )
    on conflict (partita_id, utente_id) do update
      set vista = excluded.vista,
          mosse_valide = excluded.mosse_valide,
          versione = excluded.versione,
          aggiornata_il = now();
  end loop;

  return v_versione;
end;
$$;

-- Nessun browser può chiamarle: solo la chiave di servizio dell'arbitro.
revoke all on function public.arbitro_crea_partita (uuid, text, text, text, jsonb, int) from public, anon, authenticated;
revoke all on function public.arbitro_unisciti (text, uuid, text) from public, anon, authenticated;
revoke all on function public.arbitro_salva (uuid, int, jsonb, jsonb, uuid, jsonb, text, jsonb) from public, anon, authenticated;
grant execute on function public.arbitro_crea_partita (uuid, text, text, text, jsonb, int) to service_role;
grant execute on function public.arbitro_unisciti (text, uuid, text) to service_role;
grant execute on function public.arbitro_salva (uuid, int, jsonb, jsonb, uuid, jsonb, text, jsonb) to service_role;
