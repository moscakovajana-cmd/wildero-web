-- Vytvoření tabulky pro produkty
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    full_description TEXT,
    category TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'active',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vytvoření tabulky pro objednávky
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    address TEXT NOT NULL,
    delivery_method TEXT,
    payment_method TEXT,
    shipping_cost NUMERIC DEFAULT 0,
    total_price NUMERIC NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'new',
    gopay_url TEXT,
    gopay_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nastavení RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Produkty může číst kdokoli (aby se zobrazily v eshopu)
CREATE POLICY "Public profiles are viewable by everyone." ON public.products FOR SELECT USING ( true );
CREATE POLICY "Anyone can insert an order." ON public.orders FOR INSERT WITH CHECK ( true );

-- (Pro zjednodušení administrace přes admin.html)
CREATE POLICY "Enable all for products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Vytvoření Storage bucketu pro obrázky produktů, pokud neexistuje
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict (id) do nothing;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
create policy "Enable all for products storage" on storage.objects for all using ( bucket_id = 'products' ) with check ( bucket_id = 'products' );
