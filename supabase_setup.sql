-- Vytvoření tabulky products včerně popisků a pole obrázků
CREATE TABLE IF NOT EXISTS public.products (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    images text[] default array[]::text[],
    category text,
    price integer not null,
    stock integer not null default 0,
    status text not null default 'active',
    full_description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zapnutí RLS (bezpečnost ze strany DB)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Politika pro volné čtení produktů aplikací (veřejná pravidla)
CREATE POLICY "Allow public read access" 
ON public.products FOR SELECT 
TO public USING (true);

-- Politika pro dočasný volný zápis, update a delete z frontendové administrace
CREATE POLICY "Allow anonymous full access for testing" 
ON public.products FOR ALL 
TO public USING (true) WITH CHECK (true);

-- Vložení výchozích existujících produktů
INSERT INTO public.products (title, description, images, category, price, stock, status) VALUES
('Sada nálepek – Výprava do lesa', '20 originálních vodovkových nálepek s lesními zvířátky. Perfektní odměna za splněnou výpravu.', ARRAY['shop_stickers.png'], 'Nálepky', 69, 50, 'active'),
('Wildiny dobrodružství – Omalovánky', '24 stran plných lesních scén k vymalování. Pro děti od 4 let. Kvalitní papír pro vodovky i pastelky.', ARRAY['shop_coloring.png'], 'Omalovánky', 149, 120, 'active'),
('Wildero Výpravník – Zápisník dobrodruha', 'Kroužkový sešit s linkami, stránkami pro skici a místem pro sbírání zážitků. Ideální parťák každé výpravy.', ARRAY['shop_notebook.png'], 'Sešity', 199, 30, 'active'),
('Startovní balíček dobrodruha', 'Vše potřebné pro první výpravu: sešit, nálepky, 3 odznaky a kartička Wildy.', ARRAY['shop_bag.png'], 'Balíčky', 299, 15, 'active'),
('Kolekce odznaků – Lesní přátelé', 'Sada 5 sběratelských napichovacích odznaků s kreslenými lesními zvířátky.', ARRAY['shop_badges.png'], 'Odznaky', 129, 200, 'active'),
('Rodinný balíček odměn', 'Velký balíček pro celou rodinu – 2 sady nálepek, omalovánky, 2 sešity a 6 odznaků.', ARRAY['shop_bag.png'], 'Balíčky', 549, 45, 'active');

-- Vytvoření tabulky orders pro správu objednávek
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid default gen_random_uuid() primary key,
    customer_name text not null,
    customer_email text not null,
    customer_phone text,
    address text,
    delivery_method text,
    total_price integer not null,
    items jsonb not null default '[]'::jsonb,
    status text not null default 'new',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zapnutí RLS pro orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Povolit komukoliv vytvořit objednávku (z webu)
CREATE POLICY "Allow anonymous insert orders" 
ON public.orders FOR INSERT 
TO public WITH CHECK (true);

-- Povolit anonymní správu (pro testovací admin panel)
CREATE POLICY "Allow anonymous full access for testing orders" 
ON public.orders FOR ALL 
TO public USING (true) WITH CHECK (true);
