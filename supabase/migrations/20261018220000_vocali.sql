-- Messaggi vocali tra i giocatori di una partita.
-- Li salva solo l'arbitro (chiave di servizio); i giocatori della partita possono leggerli e scaricarli.

create table public.vocali (
  id uuid primary key default gen_random_uuid(),
  partita_id uuid not null references public.partite (id) on delete cascade,
  utente_id uuid not null,
  percorso text not null,
  durata_ms int not null check (durata_ms between 200 and 21000),
  creato_il timestamptz not null default now()
);

create index vocali_partita on public.vocali (partita_id, creato_il);
create index vocali_creati on public.vocali (creato_il);

alter table public.vocali enable row level security;

create policy "Sento i vocali delle mie partite"
  on public.vocali for select to authenticated
  using (public.sono_in_partita (partita_id));

-- I browser non scrivono mai: i vocali li salva l'arbitro.
revoke insert, update, delete, truncate on public.vocali from anon, authenticated;
revoke all on public.vocali from anon;

-- Tempo reale: chi gioca riceve subito i vocali nuovi (filtrati dalla regola sopra)
alter publication supabase_realtime add table public.vocali;

-- Spazio file privato: cartella = id della partita; massimo 400 KB per file, solo audio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vocali', 'vocali', false, 400000, array['audio/mp4', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/aac'])
on conflict (id) do nothing;

create policy "Scarico i vocali delle mie partite"
  on storage.objects for select to authenticated
  using (bucket_id = 'vocali' and public.sono_in_partita (((storage.foldername (name))[1])::uuid));
