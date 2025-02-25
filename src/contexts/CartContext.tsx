import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  flavors?: string[];
  filling?: string;
  deliveryDate?: string;
  toppings?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

interface Product extends CartItem {
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItem: (updatedItem: CartItem) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => 
        item.id === product.id && 
        JSON.stringify(item.toppings) === JSON.stringify(product.toppings)
      );
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id && 
          JSON.stringify(item.toppings) === JSON.stringify(product.toppings)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1,
        image_url: product.image_url,
        flavors: product.flavors,
        filling: product.filling,
        deliveryDate: product.deliveryDate,
        toppings: product.toppings
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateItem = (updatedItem: CartItem) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => {
    const itemBasePrice = item.price;
    const toppingsPrice = item.toppings?.reduce((tSum, topping) => tSum + topping.price, 0) || 0;
    const itemTotalPrice = (itemBasePrice + toppingsPrice) * item.quantity;
    return sum + itemTotalPrice;
  }, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      updateItem,
      clearCart, 
      total 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}