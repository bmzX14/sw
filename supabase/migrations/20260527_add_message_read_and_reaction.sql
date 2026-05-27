alter table public.messages
add column if not exists read_at timestamptz null,
add column if not exists reaction text null;

create index if not exists messages_match_id_read_at_idx
on public.messages (match_id, read_at);
