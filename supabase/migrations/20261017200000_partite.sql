-- Fase 2: partite, giocatori, stato privato, viste dei giocatori e storico mosse.
--
-- Regola d'oro: i browser NON scrivono mai nulla qui. Tutte le scritture le fa l'arbitro
-- (Edge Function con chiave di servizio, che salta le regole RLS). I browser possono solo leggere:
--   - le partite in cui giocano e chi c'è dentro;
--   - la PROPRIA vista della partita.
-- Lo stato completo e lo storico mosse non sono leggibili da nessun browser.

-- ---------------------------------------------------------------------------
-- Tabelle
-- ---------------------------------------------------------------------------

create table public.partite (
  id uuid primary key default gen_random_uuid(),
  -- Codice d'invito (es. K7Q2): valido solo finché la partita è in attesa.
  codice text not null unique check (codice ~ '^[A-Z0-9]{4,8}$'),
  gioco text not null default 'primo-gioco',
  stato text not null default 'attesa' check (stato in ('attesa', 'in_corso', 'finita')),
  creatore uuid not null references auth.users (id) on delete cascade,
  opzioni jsonb not null default '{}'::jsonb,
  max_giocatori int not null default 5 check (max_giocatori between 2 and 5),
  -- Esito finale (vincitori e punti), quando la partita è finita.
  esito jsonb,
  creata_il timestamptz not null default now(),
  aggiornata_il timestamptz not null default now()
);

create table public.giocatori_partita (
  partita_id uuid not null references public.partite (id) on delete cascade,
  utente_id uuid not null references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  entrato_il timestamptz not null default now(),
  primary key (partita_id, utente_id)
);

-- Stato completo della partita: SOLO per l'arbitro.
create table public.stati_partita (
  partita_id uuid primary key references public.partite (id) on delete cascade,
  stato jsonb not null,
  versione int not null default 0,
  aggiornato_il timestamptz not null default now()
);

-- Cosa vede ogni giocatore, più le mosse che può fare ora.
create table public.viste (
  partita_id uuid not null references public.partite (id) on delete cascade,
  utente_id uuid not null references auth.users (id) on delete cascade,
  vista jsonb not null,
  mosse_valide jsonb not null default '[]'::jsonb,
  versione int not null default 0,
  aggiornata_il timestamptz not null default now(),
  primary key (partita_id, utente_id)
);

-- Storico delle mosse (per rivedere o ricostruire una partita): SOLO per l'arbitro.
create table public.mosse (
  id bigint generated always as identity primary key,
  partita_id uuid not null references public.partite (id) on delete cascade,
  numero int not null,
  utente_id uuid not null references auth.users (id) on delete cascade,
  mossa jsonb not null,
  eseguita_il timestamptz not null default now(),
  unique (partita_id, numero)
);

create index giocatori_partita_utente on public.giocatori_partita (utente_id);
create index viste_utente on public.viste (utente_id);

-- ---------------------------------------------------------------------------
-- Regole di accesso (RLS)
-- ---------------------------------------------------------------------------

alter table public.partite enable row level security;
alter table public.giocatori_partita enable row level security;
alter table public.stati_partita enable row level security;
alter table public.viste enable row level security;
alter table public.mosse enable row level security;

-- L'utente collegato gioca in questa partita?
-- (security definer: legge giocatori_partita senza passare dalle sue stesse regole)
create function public.sono_in_partita (p uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.giocatori_partita g
    where g.partita_id = p and g.utente_id = (select auth.uid())
  );
$$;

revoke all on function public.sono_in_partita (uuid) from public;
grant execute on function public.sono_in_partita (uuid) to authenticated;

create policy "Vedo le partite in cui gioco"
  on public.partite for select to authenticated
  using (public.sono_in_partita (id));

create policy "Vedo chi gioca nelle mie partite"
  on public.giocatori_partita for select to authenticated
  using (public.sono_in_partita (partita_id));

create policy "Vedo solo la mia vista"
  on public.viste for select to authenticated
  using (utente_id = (select auth.uid()));

-- Nessuna regola per stati_partita e mosse: con RLS attivo e nessuna regola, nessun browser
-- può leggerle o scriverle. In più si tolgono del tutto i permessi, per sicurezza doppia.
revoke all on public.stati_partita from anon, authenticated;
revoke all on public.mosse from anon, authenticated;

-- I browser non scrivono mai: si tolgono i permessi di scrittura sulle altre tabelle.
revoke insert, update, delete, truncate on public.partite from anon, authenticated;
revoke insert, update, delete, truncate on public.giocatori_partita from anon, authenticated;
revoke insert, update, delete, truncate on public.viste from anon, authenticated;
-- Chi non ha fatto l'accesso (nemmeno anonimo) non legge nulla.
revoke all on public.partite, public.giocatori_partita, public.viste from anon;

-- ---------------------------------------------------------------------------
-- Tempo reale: i browser ricevono gli aggiornamenti (sempre filtrati dalle regole sopra)
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.partite, public.giocatori_partita, public.viste;
