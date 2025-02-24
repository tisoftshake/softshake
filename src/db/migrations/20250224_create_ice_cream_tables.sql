-- Criar tabela de sabores de sorvete se não existir
CREATE TABLE IF NOT EXISTS ice_cream_flavors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de recheios se não existir
CREATE TABLE IF NOT EXISTS ice_cream_fillings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir alguns sabores de exemplo se a tabela estiver vazia
INSERT INTO ice_cream_flavors (name, in_stock)
SELECT name, true
FROM (VALUES
    ('Chocolate'),
    ('Morango'),
    ('Baunilha'),
    ('Flocos'),
    ('Napolitano'),
    ('Brigadeiro')
) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM ice_cream_flavors);

-- Inserir alguns recheios de exemplo se a tabela estiver vazia
INSERT INTO ice_cream_fillings (name, in_stock)
SELECT name, true
FROM (VALUES
    ('Chocolate'),
    ('Morango'),
    ('Doce de Leite'),
    ('Brigadeiro'),
    ('Nutella'),
    ('Leite Ninho')
) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM ice_cream_fillings);
