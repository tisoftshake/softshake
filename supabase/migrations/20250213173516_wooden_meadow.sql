create table if not exists ice_cream_bucket_flavors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  in_stock boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into ice_cream_bucket_flavors (name) values
  ('Ninho trufado'),
  ('Nutella'),
  ('Diamante negro'),
  ('Leite ninho'),
  ('Yogurte com damasco'),
  ('Yogurte com frutas'),
  ('Coco queimado'),
  ('Nata com doce de leite'),
  ('Morango'),
  ('Morango trufado'),
  ('Abaixa'),
  ('Maracujá'),
  ('Camafeu'),
  ('Ninho com pistache'),
  ('Africano'),
  ('Oreo'),
  ('Céu azul'),
  ('Flocos');