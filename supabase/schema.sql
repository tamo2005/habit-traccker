-- Run this once in the linked Supabase project's SQL Editor.
-- The policies make every habit and completion visible only to its owner.

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  cadence text not null check (char_length(trim(cadence)) between 1 and 80),
  color text not null check (color in ('saffron', 'moss', 'clay', 'ink')),
  created_at timestamptz not null default now()
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create index if not exists habits_user_created_idx on public.habits (user_id, created_at);
create index if not exists habit_completions_user_date_idx on public.habit_completions (user_id, completed_on);

alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

drop policy if exists "Users manage their own habits" on public.habits;
create policy "Users manage their own habits" on public.habits
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own completions" on public.habit_completions;
create policy "Users manage their own completions" on public.habit_completions
  for all to authenticated
  using (
    auth.uid() = user_id
    and exists (select 1 from public.habits where habits.id = habit_id and habits.user_id = auth.uid())
  )
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.habits where habits.id = habit_id and habits.user_id = auth.uid())
  );
