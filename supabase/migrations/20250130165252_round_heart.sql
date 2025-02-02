/*
  # Ice Cream Shop Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `slug` (text) - URL-friendly name
      - `color` (text) - Category highlight color
    
    - `products`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (decimal) - Product price
      - `image_url` (text) - Product image URL
      - `in_stock` (boolean) - Stock status
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#000000'
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) NOT NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on products" ON products
  FOR SELECT TO public USING (true);

-- Insert initial categories
INSERT INTO categories (name, slug, color) VALUES
  ('Sorvetes', 'sorvetes', '#FF6B6B'),
  ('Milkshakes', 'milkshakes', '#4ECDC4'),
  ('Açaí', 'acai', '#9B59B6'),
  ('Bolos de Sorvete', 'bolos', '#F1C40F');