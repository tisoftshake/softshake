/*
  # Add initial cake flavors and fillings

  This migration adds sample data to the existing sabores_bolo table:
  1. Basic cake flavors (chocolate, vanilla, etc.)
  2. Various filling options (brigadeiro, nutella, etc.)
*/

-- Add cake flavors
INSERT INTO sabores_bolo (nome, tipo, disponivel, produto_id)
SELECT 
  nome,
  'flavor' as tipo,
  true as disponivel,
  products.id as produto_id
FROM 
  unnest(ARRAY[
    'Chocolate',
    'Baunilha',
    'Morango',
    'Napolitano'
  ]) as nome
CROSS JOIN (
  SELECT id FROM products 
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'bolos')
  LIMIT 1
) as products;

-- Add cake fillings
INSERT INTO sabores_bolo (nome, tipo, disponivel, produto_id)
SELECT 
  nome,
  'filling' as tipo,
  true as disponivel,
  products.id as produto_id
FROM 
  unnest(ARRAY[
    'Brigadeiro',
    'Doce de Leite',
    'Nutella',
    'Morango',
    'Prestígio',
    'Maracujá'
  ]) as nome
CROSS JOIN (
  SELECT id FROM products 
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'bolos')
  LIMIT 1
) as products;