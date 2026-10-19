-- Spettatori e schermo "tavolo": chi guarda una partita senza giocare.
-- Vedono solo la vista pubblica (nessuna mano, nessun mazzo coperto), chi gioca e i vocali.

create table public.spettatori (
  partita_id uuid not null references public.partite (id) on delete cascade,
  utente_id uuid not null,
  entrato_il timestamptz not null default now(),
  primary key (partita_id, utente_id)
);

create table public.viste_pubbliche (
  partita_id uuid primary key references public.partite (id) on delete cascade,
  vista jsonb not null,
  versione int not null,
  aggiornata_il timestamptz not null default now()
);

alter table public.spettatori enable row level security;
alter table public.viste_pubbliche enable row level security;

-- L'utente collegato gioca in questa partita oppure la guarda?
create function public.posso_guardare (p uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.sono_in_partita (p) or exists (
    select 1 from public.spettatori s
    where s.partita_id = p and s.utente_id = (select auth.uid())
  );
$$;

revoke all on function public.posso_guardare (uuid) from public;
grant execute on function public.posso_guardare (uuid) to authenticated;

-- Chi guarda vede la partita, chi gioca, gli altri spettatori, la vista pubblica e i vocali
drop policy "Vedo le partite in cui gioco" on public.partite;
create policy "Vedo le partite in cui gioco o che guardo"
  on public.partite for select to authenticated
  using (public.posso_guardare (id));

drop policy "Vedo chi gioca nelle mie partite" on public.giocatori_partita;
create policy "Vedo chi gioca nelle partite in cui gioco o che guardo"
  on public.giocatori_partita for select to authenticated
  using (public.posso_guardare (partita_id));

create policy "Vedo chi guarda le partite in cui gioco o che guardo"
  on public.spettatori for select to authenticated
  using (public.posso_guardare (partita_id));

create policy "Vedo la vista pubblica delle partite in cui gioco o che guardo"
  on public.viste_pubbliche for select to authenticated
  using (public.posso_guardare (partita_id));

drop policy "Sento i vocali delle mie partite" on public.vocali;
create policy "Sento i vocali delle partite in cui gioco o che guardo"
  on public.vocali for select to authenticated
  using (public.posso_guardare (partita_id));

drop policy "Scarico i vocali delle mie partite" on storage.objects;
create policy "Scarico i vocali delle partite in cui gioco o che guardo"
  on storage.objects for select to authenticated
  using (bucket_id = 'vocali' and public.posso_guardare (((storage.foldername (name))[1])::uuid));

-- I browser non scrivono mai: entra come spettatore e aggiorna la vista pubblica solo l'arbitro
revoke insert, update, delete, truncate on public.spettatori, public.viste_pubbliche from anon, authenticated;
revoke all on public.spettatori, public.viste_pubbliche from anon;

alter publication supabase_realtime add table public.spettatori, public.viste_pubbliche;

-- Entrare come spettatore con il codice d'invito (anche a partita iniziata o finita).
create function public.arbitro_guarda (p_codice text, p_utente uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.partite where codice = p_codice;
  if not found then
    raise exception 'CODICE_NON_VALIDO';
  end if;
  -- Chi gioca già non diventa anche spettatore
  if not exists (select 1 from public.giocatori_partita where partita_id = v_id and utente_id = p_utente) then
    insert into public.spettatori (partita_id, utente_id) values (v_id, p_utente)
    on conflict do nothing;
  end if;
  return v_id;
end;
$$;

revoke all on function public.arbitro_guarda (text, uuid) from public, anon, authenticated;
grant execute on function public.arbitro_guarda (text, uuid) to service_role;
