-- Avatar a stili: oltre ai classici (es. "mago") si accettano quelli disegnati da un seme (es. "pixel:k3x9q2ab").
alter table public.giocatori_partita drop constraint if exists giocatori_partita_avatar_check;
alter table public.giocatori_partita add constraint giocatori_partita_avatar_check check (avatar ~ '^[a-z0-9:-]{1,40}$');
