-- Tabela de perfis de usuários
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Tabela de temperos/produtos
create table if not exists public.spices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  weight_grams integer not null,
  image_url text,
  stock integer default 0,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.spices enable row level security;

-- Todos podem ver os temperos
create policy "spices_select_all" on public.spices for select using (true);

-- Apenas admins podem inserir, atualizar e deletar
create policy "spices_insert_admin" on public.spices for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "spices_update_admin" on public.spices for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "spices_delete_admin" on public.spices for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Tabela de pedidos
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  total decimal(10,2) not null,
  shipping_cost decimal(10,2) not null,
  cep text not null,
  address text not null,
  status text default 'pending',
  delivery_method text not null, -- 'car' ou 'bike'
  estimated_delivery_time integer, -- em minutos
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_select_admin" on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Tabela de itens do pedido
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  spice_id uuid references public.spices(id),
  quantity integer not null,
  price decimal(10,2) not null
);

alter table public.order_items enable row level security;

create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "order_items_insert_own" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Tabela do carrinho
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  spice_id uuid references public.spices(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, spice_id)
);

alter table public.cart_items enable row level security;

create policy "cart_items_select_own" on public.cart_items for select using (auth.uid() = user_id);
create policy "cart_items_insert_own" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "cart_items_update_own" on public.cart_items for update using (auth.uid() = user_id);
create policy "cart_items_delete_own" on public.cart_items for delete using (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
