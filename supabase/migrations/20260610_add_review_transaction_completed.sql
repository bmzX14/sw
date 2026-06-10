alter table public.reviews
add column if not exists transaction_completed boolean not null default false;
