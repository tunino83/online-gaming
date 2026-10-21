-- Partite aperte: chi crea una partita può farla comparire nella lista della pagina iniziale,
-- così si entra anche senza invito. La lista la prepara l'arbitro (i browser non leggono le partite altrui).
alter table public.partite add column pubblica boolean not null default true;

create index partite_aperte on public.partite (creata_il desc) where stato = 'attesa' and pubblica;
