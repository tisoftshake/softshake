import React from 'react';
import { Menu, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface FooterProps {
  onOpenCart: () => void;
}

export function Footer({ onOpenCart }: FooterProps) {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 shadow-lg">
      <nav className="max-w-lg mx-auto flex items-center justify-around">
        <button className="flex flex-col items-center p-4 text-purple-500">
          <Menu className="w-6 h-6" />
          <span className="text-sm mt-1">Cardápio</span>
        </button>
        
        <button 
          onClick={onOpenCart}
          className="flex flex-col items-center p-4 text-gray-400 hover:text-purple-500 relative transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-sm mt-1">Carrinho</span>
          {itemCount > 0 && (
            <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </nav>
    </footer>
  );
}