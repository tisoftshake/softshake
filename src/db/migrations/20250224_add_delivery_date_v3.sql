-- Adiciona campo delivery_date na tabela orders
ALTER TABLE orders ADD COLUMN delivery_date DATE;

-- Atualiza os pedidos existentes, extraindo a data de entrega dos itens
WITH order_dates AS (
  SELECT 
    orders.id,
    MIN(CAST((items->>'deliveryDate') AS DATE)) as earliest_date
  FROM orders,
  jsonb_array_elements(orders.items) AS items
  WHERE items->>'deliveryDate' IS NOT NULL
  GROUP BY orders.id
)
UPDATE orders
SET delivery_date = order_dates.earliest_date
FROM order_dates
WHERE orders.id = order_dates.id;

-- Adiciona campo delivery_date na tabela deleted_orders
ALTER TABLE deleted_orders ADD COLUMN delivery_date DATE;
