import React, { useState } from 'react';
import { AlertCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { FlavorSelectionModal } from './FlavorSelectionModal';
import { AcaiToppingsModal } from './AcaiToppingsModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  in_stock: boolean;
  category_id: string;
}

interface Flavor {
  id: string;
  name: string;
  in_stock: boolean;
}

interface AcaiTopping {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
}

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [toppings, setToppings] = useState<AcaiTopping[]>([]);
  const [showFlavorModal, setShowFlavorModal] = useState(false);
  const [showToppingsModal, setShowToppingsModal] = useState(false);

  const handleProductClick = async (product: Product) => {
    if (!product.in_stock) return;
    setSelectedProduct(product);
    
    // Check if the product is in the açaí category
    const { data: categoryData } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', product.category_id)
      .single();
    
    if (categoryData?.slug === 'acai') {
      // Load açaí toppings
      const { data: toppingsData } = await supabase
        .from('adicionais_acai')
        .select('*')
        .order('name');
      
      setToppings(toppingsData || []);
      setShowToppingsModal(true);
    } else {
      // Load regular flavors
      const { data: flavorsData } = await supabase
        .from('product_variations')
        .select('id, name, in_stock')
        .eq('product_id', product.id)
        .order('name');
      
      setFlavors(flavorsData || []);
      setShowFlavorModal(true);
    }
  };

  const handleFlavorSelection = (selectedFlavors: string[]) => {
    if (selectedProduct && selectedFlavors.length > 0) {
      const selectedFlavorNames = flavors
        .filter(flavor => selectedFlavors.includes(flavor.id))
        .map(flavor => flavor.name)
        .join(', ');

      addItem({
        ...selectedProduct,
        name: `${selectedProduct.name} (${selectedFlavorNames})`
      });
    }
  };

  const handleToppingsSelection = (selectedToppings: string[]) => {
    if (selectedProduct && selectedToppings.length >= 0) {
      const selectedToppingNames = toppings
        .filter(topping => selectedToppings.includes(topping.id))
        .map(topping => topping.name)
        .join(', ');

      const additionalCost = toppings
        .filter(topping => selectedToppings.includes(topping.id))
        .reduce((sum, topping) => sum + topping.price, 0);

      addItem({
        ...selectedProduct,
        name: selectedToppingNames 
          ? `${selectedProduct.name} (${selectedToppingNames})`
          : selectedProduct.name,
        price: selectedProduct.price + additionalCost
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02]">
            <div className="relative">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 sm:h-56 object-cover"
              />
              <div className="absolute top-3 right-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.in_stock 
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.in_stock ? 'Em estoque' : 'Esgotado'}
                </div>
              </div>
              {!product.in_stock && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-full flex items-center gap-1.5 text-red-500 font-medium shadow-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Esgotado
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">{product.name}</h3>
              <p className="text-gray-600 mt-1 text-sm">{product.description}</p>
              
              <div className="mt-4 sm:mt-5 flex items-center justify-between">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  R$ {product.price.toFixed(2)}
                </span>
                
                <button
                  onClick={() => handleProductClick(product)}
                  disabled={!product.in_stock}
                  className={`p-2.5 sm:p-3 rounded-full transition-all
                    ${product.in_stock
                      ? 'bg-gradient-to-r from-purple-500 to-yellow-500 text-white hover:from-purple-600 hover:to-yellow-600 hover:shadow-lg shadow-purple-500/20'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  aria-label="Adicionar ao carrinho"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && showFlavorModal && (
        <FlavorSelectionModal
          isOpen={true}
          onClose={() => {
            setShowFlavorModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          flavors={flavors}
          onConfirm={handleFlavorSelection}
        />
      )}

      {selectedProduct && showToppingsModal && (
        <AcaiToppingsModal
          isOpen={true}
          onClose={() => {
            setShowToppingsModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          toppings={toppings}
          onConfirm={handleToppingsSelection}
        />
      )}
    </>
  );
}