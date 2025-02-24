/*
  # Create ice cream cake flavors and fillings tables

  1. New Tables
    - `sabores_bolo`
      - `id` (uuid, primary key)
      - `name` (text, name of the flavor/filling)
      - `type` (text, either 'flavor' or 'filling')
      - `in_stock` (boolean, availability status)
      - `product_id` (uuid, references products)

  2. Security
    - Enable RLS on table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS sabores_bolo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('flavor', 'filling')),
  in_stock boolean NOT NULL DEFAULT true,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE sabores_bolo ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on sabores_bolo" ON sabores_bolo
  FOR SELECT TO public USING (true);