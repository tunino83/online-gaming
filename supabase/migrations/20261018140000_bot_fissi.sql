-- Robot fissi: le partite di prova riusano sempre gli stessi 4 giocatori del computer,
-- invece di creare un utente nuovo ogni volta.
create table public.bot_fissi (
  numero int primary key check (numero between 1 and 4),
  utente_id uuid not null unique references auth.users (id) on delete cascade
);
-- Solo l'arbitro (chiave di servizio) la usa.
alter table public.bot_fissi enable row level security;
revoke all on public.bot_fissi from anon, authenticated;

-- Pulizia una tantum (decisa dal proprietario il 2026-10-18): via i robot creati prima di questa
-- modifica e le partite di prova in cui giocavano. Su un database nuovo non cancella nulla.
delete from public.partite p
  where exists (select 1 from public.giocatori_partita g where g.partita_id = p.id and g.bot);
delete from auth.users u
  where u.raw_user_meta_data ->> 'bot' = 'true'
    and not exists (select 1 from public.bot_fissi b where b.utente_id = u.id);
