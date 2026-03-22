-- Vytvoření tabulky products
CREATE TABLE IF NOT EXISTS public.products (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    category text,
    price integer not null,
    stock integer not null default 0,
    status text not null default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zapnutí RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení (všichni mohou číst produkty - do budoucna i běžný shop.html)
CREATE POLICY "Allow public read access" 
ON public.products 
FOR SELECT 
TO public 
USING (true);

-- Politika pro zápis, update a delete
-- VAROVÁNÍ: Tato politika dočasně umožňuje upravovat tabulku anonymně, abyste mohl 
-- eshop jednoduše otestovat rovnou z vaší nové admin.html bez řešení hesel a loginů. 
-- Ve skutečném provozu to později omezíme pouze na přihlášeného administrátora.
CREATE POLICY "Allow anonymous full access for testing" 
ON public.products 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- Vložení výchozích existujících produktů do nové tabulky
INSERT INTO public.products (title, category, price, stock, status) VALUES
('Sada nálepek – Výprava do lesa', 'Nálepky', 69, 50, 'active'),
('Wildiny dobrodružství – Omalovánky', 'Omalovánky', 149, 120, 'active'),
('Wildero Výpravník – Zápisník dobrodruha', 'Sešity', 199, 30, 'active'),
('Startovní balíček dobrodruha', 'Balíčky', 299, 15, 'active'),
('Kolekce odznaků – Lesní přátelé', 'Odznaky', 129, 200, 'active'),
('Rodinný balíček odměn', 'Balíčky', 549, 45, 'active');
