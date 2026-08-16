create table if not exists public.admin_notifications (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    message text not null,
    type text not null, -- 'order', 'inquiry', 'system'
    is_read boolean not null default false,
    link_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.admin_notifications enable row level security;

-- Only authenticated users
create policy "Enable read access for authenticated users" on public.admin_notifications
    for select to authenticated using (true);

create policy "Enable update access for authenticated users" on public.admin_notifications
    for update to authenticated using (true);

create policy "Enable insert access for authenticated users" on public.admin_notifications
    for insert to authenticated with check (true);

create policy "Enable delete access for authenticated users" on public.admin_notifications
    for delete to authenticated using (true);
