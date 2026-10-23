-- Il computer gioca al posto di una persona ferma da 60 secondi (azione "alPosto" dell'arbitro).
-- al_posto_di: se l'ultima mossa salvata l'ha fatta il computer per una persona, chi è
-- (allora la mossa seguente arriva dopo 10 secondi invece di 60). Si azzera a ogni altra mossa.
alter table public.stati_partita add column al_posto_di uuid;

drop function public.arbitro_salva (uuid, int, jsonb, jsonb, uuid, jsonb, text, jsonb);

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
  p_esito jsonb,
  p_al_posto_di uuid default null
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
    insert into public.stati_partita (partita_id, stato, versione, al_posto_di) values (p_partita, p_stato, 0, p_al_posto_di);
    v_versione := 0;
  else
    -- Si salva solo se nessun altro ha salvato nel frattempo (stessa versione letta).
    update public.stati_partita
      set stato = p_stato, versione = versione + 1, aggiornato_il = now(), al_posto_di = p_al_posto_di
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

-- Nessun browser può chiamarla: solo la chiave di servizio dell'arbitro.
revoke all on function public.arbitro_salva (uuid, int, jsonb, jsonb, uuid, jsonb, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.arbitro_salva (uuid, int, jsonb, jsonb, uuid, jsonb, text, jsonb, uuid) to service_role;
