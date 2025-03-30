import React, { useState } from 'react';
import { AlertCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { FlavorSelectionModal } from './FlavorSectionModal';
import { AcaiToppingsModal } from './AcaiToppingsModal';
import { CakeCustomizationModal } from './CakeCustomizationModal';
import { DrinkSelectionModal } from './DrinkSelectionModal';
import { IceCreamCakeModal } from './IceCreamCakeModal';
import { IceCreamPotModal } from './IceCreamPotModal';
import { IceCreamBucketModal } from './IceCreamBucketModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  in_stock: boolean;
  category_id: string;
  size?: '300ml' | '500ml' | '700ml';
}

interface Flavor {
  id: string;
  name: string;
  in_stock: boolean;
}

interface CakeFlavor {
  id: string;
  name: string;
  type: 'flavor' | 'filling';
  in_stock: boolean;
}

interface AcaiTopping {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
}

interface DrinkVariation {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
}

interface IceCreamFlavor {
  id: string;
  name: string;
  in_stock: boolean;
}

interface IceCreamFilling {
  id: string;
  name: string;
  in_stock: boolean;
}

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [drinkVariations, setDrinkVariations] = useState<DrinkVariation[]>([]);
  const [cakeFlavors, setCakeFlavors] = useState<CakeFlavor[]>([]);
  const [toppings, setToppings] = useState<AcaiTopping[]>([]);
  const [showFlavorModal, setShowFlavorModal] = useState(false);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [showToppingsModal, setShowToppingsModal] = useState(false);
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [showIceCreamCakeModal, setShowIceCreamCakeModal] = useState(false);
  const [showIceCreamPotModal, setShowIceCreamPotModal] = useState(false);
  const [showIceCreamBucketModal, setShowIceCreamBucketModal] = useState(false);
  const [iceCreamFlavors, setIceCreamFlavors] = useState<IceCreamFlavor[]>([]);
  const [iceCreamFillings, setIceCreamFillings] = useState<IceCreamFilling[]>([]);

  const handleProductClick = async (product: Product) => {
    if (!product.in_stock) return;
    setSelectedProduct(product);
    
    // Check product category
    const { data: categoryData } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', product.category_id)
      .single();
    
    if (categoryData?.slug === 'bebidas') {
      // Load drink variations with prices
      const { data: variationsData } = await supabase
        .from('product_variations')
        .select('id, name, price, in_stock')
        .eq('product_id', product.id)
        .order('name');
      
      setDrinkVariations(variationsData || []);
      setShowDrinkModal(true);
    } else if (categoryData?.slug === 'acai') {
      // Load açaí toppings
      const { data: toppingsData } = await supabase
        .from('adicionais_acai')
        .select('*')
        .order('name');
      
      setToppings(toppingsData || []);

      // Extrair o tamanho do açaí do nome do produto
      const sizeMatch = product.name.match(/(300|500|700)ml/);
      const size = sizeMatch ? (sizeMatch[0] as '300ml' | '500ml' | '700ml') : '300ml';
      
      setSelectedProduct({
        ...product,
        size // Adicionar tamanho ao produto
      });
      
      setShowToppingsModal(true);
    } else if (categoryData?.slug === 'bolos') {
      // Load cake flavors and fillings
      const { data: cakeData } = await supabase
        .from('sabores_bolo')
        .select('*')
        .eq('product_id', product.id)
        .order('name');
      
      setCakeFlavors(cakeData || []);
      setShowCakeModal(true);
    } else if (product.name.toLowerCase().includes('sorvete')) {
      if (product.name.toLowerCase().includes('bolo')) {
        // Load ice cream flavors and fillings for cake
        const [flavorsResponse, fillingsResponse] = await Promise.all([
          supabase
            .from('ice_cream_flavors')
            .select('id, name, in_stock')
            .order('name'),
          supabase
            .from('ice_cream_fillings')
            .select('id, name, in_stock')
            .order('name')
        ]);
        
        setIceCreamFlavors(flavorsResponse.data || []);
        setIceCreamFillings(fillingsResponse.data || []);
        setShowIceCreamCakeModal(true);
      } else if (product.name.toLowerCase().includes('balde')) {
        // For ice cream buckets, show the bucket modal
        setShowIceCreamBucketModal(true);
      } else {
        // For ice cream pots, show the pot modal
        setShowIceCreamPotModal(true);
      }
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
    if (selectedProduct) {
      const selectedFlavorNames = flavors
        .filter(f => selectedFlavors.includes(f.id))
        .map(f => f.name)
        .join(' + ');

      addItem({
        id: selectedProduct.id,
        name: `${selectedProduct.name} - ${selectedFlavorNames}`,
        price: selectedProduct.price,
        quantity: 1,
        flavors: selectedFlavors,
        flavor: selectedFlavorNames,
        image_url: selectedProduct.image_url
      });
      setShowFlavorModal(false);
      setSelectedProduct(null);
    }
  };

  const handleToppingsSelection = (selectedToppings: Array<{ id: string; name: string; price: number }>) => {
    if (selectedProduct) {
      addItem({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
        toppings: selectedToppings,
        size: selectedProduct.size,
        image_url: selectedProduct.image_url
      });
      setShowToppingsModal(false);
      setSelectedProduct(null);
    }
  };

  const handleCakeCustomization = (selections: {
    flavor: string;
    fillings: string[];
    customerName: string;
    customerPhone: string;
    pickupDate: string;
  }) => {
    if (selectedProduct) {
      const selectedFlavorName = cakeFlavors.find(f => f.id === selections.flavor)?.name || '';
      const selectedFillingNames = cakeFlavors
        .filter(f => selections.fillings.includes(f.id))
        .map(f => f.name)
        .join(', ');

      addItem({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
        flavor: selectedFlavorName,
        fillings: selectedFillingNames,
        customerName: selections.customerName,
        customerPhone: selections.customerPhone,
        pickupDate: selections.pickupDate,
        image_url: selectedProduct.image_url
      });
      setShowCakeModal(false);
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
              <p className="text-gray-600 mt-1 text-sm">
                {product.description}
                {product.name.includes('Açaí') && (
                  <>
                    <br />
                    <span className="text-purple-600 font-medium mt-1 block">
                      {product.name.includes('300ml') && 'Até 3 adicionais'}
                      {product.name.includes('500ml') && 'Até 4 adicionais'}
                      {product.name.includes('700ml') && 'Até 5 adicionais'}
                    </span>
                  </>
                )}
              </p>
              
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

      {selectedProduct && showDrinkModal && (
        <DrinkSelectionModal
          isOpen={showDrinkModal}
          onClose={() => setShowDrinkModal(false)}
          product={selectedProduct!}
          variations={drinkVariations}
          onConfirm={(selectedVariation) => {
            addItem({
              ...selectedProduct!,
              price: selectedVariation.price,
              variation: selectedVariation.name
            });
            setShowDrinkModal(false);
          }}
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

      {selectedProduct && showCakeModal && (
        <CakeCustomizationModal
          isOpen={true}
          onClose={() => {
            setShowCakeModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          flavors={cakeFlavors}
          onConfirm={handleCakeCustomization}
        />
      )}

      {selectedProduct && showIceCreamCakeModal && (
        <IceCreamCakeModal
          isOpen={true}
          onClose={() => {
            setShowIceCreamCakeModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={(selectedFlavors, selectedFilling, deliveryDate) => {
            console.log('Data recebida:', deliveryDate); // Debug
            const item = {
              id: selectedProduct.id,
              name: `${selectedProduct.name} (${selectedFlavors.join(' + ')}) - Recheio: ${selectedFilling}`,
              price: selectedProduct.price,
              quantity: 1,
              flavor: selectedFlavors.join(' + '),
              fillings: selectedFilling,
              pickupDate: deliveryDate.toISOString().split('T')[0],
              image_url: selectedProduct.image_url,
              deliveryDate: deliveryDate.toISOString()
            };
            console.log('Item a ser adicionado:', item); // Debug
            addItem(item);
            setShowIceCreamCakeModal(false);
          }}
        />
      )}

      {selectedProduct && showIceCreamPotModal && (
        <IceCreamPotModal
          isOpen={true}
          onClose={() => {
            setShowIceCreamPotModal(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          price={selectedProduct.price}
          onConfirm={(variationId, variationName, price) => {
            addItem({
              id: selectedProduct.id,
              name: `${selectedProduct.name} - ${variationName}`,
              price: selectedProduct.price,
              quantity: 1,
              variation: variationName,
              image_url: selectedProduct.image_url
            });
            setShowIceCreamPotModal(false);
          }}
        />
      )}

      {selectedProduct && showIceCreamBucketModal && (
        <IceCreamBucketModal
          isOpen={true}
          onClose={() => {
            setShowIceCreamBucketModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={(flavorId, flavorName, price) => {
            addItem({
              id: selectedProduct.id,
              name: `${selectedProduct.name} - ${flavorName}`,
              price: price,
              quantity: 1,
              flavor: flavorName,
              image_url: selectedProduct.image_url
            });
            setShowIceCreamBucketModal(false);
          }}
        />
      )}
    </>
  );
}