-- Přidání legislativně povinných sloupců do tabulky objednávek
-- payment_method: způsob platby (dobirka / prevod)
-- shipping_cost: cena dopravy v Kč (pro správné vedení evidence)

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS payment_method text,
    ADD COLUMN IF NOT EXISTS shipping_cost integer;
