/*
  # Add product variations table

  1. New Tables
    - `product_variations`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `name` (text) - name of the flavor
      - `in_stock` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `product_variations` table
    - Add policy for public read access
*/

CREATE TABLE product_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  name text NOT NULL,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on product_variations" ON product_variations
  FOR SELECT TO public USING (true);