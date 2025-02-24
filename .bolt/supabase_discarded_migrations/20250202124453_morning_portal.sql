/*
  # Create açaí toppings tables

  1. New Tables
    - `adicionais_acai`
      - `id` (uuid, primary key)
      - `name` (text, name of the topping)
      - `price` (decimal, additional price for the topping)
      - `in_stock` (boolean, availability status)
    - `product_acai_toppings`
      - Links products to available toppings
      - `product_id` (uuid, references products)
      - `topping_id` (uuid, references adicionais_acai)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
*/

-- Create açaí toppings table
CREATE TABLE IF NOT EXISTS adicionais_acai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true
);

-- Create junction table for products and toppings
CREATE TABLE IF NOT EXISTS product_acai_toppings (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  topping_id uuid REFERENCES adicionais_acai(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, topping_id)
);

-- Enable RLS
ALTER TABLE adicionais_acai ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_acai_toppings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on adicionais_acai" ON adicionais_acai
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on product_acai_toppings" ON product_acai_toppings
  FOR SELECT TO public USING (true);