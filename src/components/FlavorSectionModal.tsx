import React from 'react';
import { X } from 'lucide-react';

interface Flavor {
  id: string;
  name: string;
  in_stock: boolean;
}

interface FlavorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
  flavors: Flavor[];
  onConfirm: (selectedFlavors: string[]) => void;
}

export function FlavorSelectionModal({ isOpen, onClose, product, flavors, onConfirm }: FlavorSelectionModalProps) {
  const [selectedFlavors, setSelectedFlavors] = React.useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleFlavor = (flavorId: string) => {
    setSelectedFlavors(current => {
      if (current.includes(flavorId)) {
        return current.filter(id => id !== flavorId);
      }
      return [...current, flavorId];
    });
  };

  const handleConfirm = () => {
    if (selectedFlavors.length > 0) {
      onConfirm(selectedFlavors);
      setSelectedFlavors([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-500 to-yellow-500 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold">Escolha os Sabores</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-purple-500 font-semibold">
                R$ {product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {flavors.map((flavor) => (
                <label
                  key={flavor.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFlavors.includes(flavor.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  } ${!flavor.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFlavors.includes(flavor.id)}
                    onChange={() => flavor.in_stock && handleToggleFlavor(flavor.id)}
                    disabled={!flavor.in_stock}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm block truncate">{flavor.name}</span>
                    {!flavor.in_stock && (
                      <span className="text-xs text-red-500">Indisponível</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={selectedFlavors.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-yellow-500 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 transition-all hover:from-purple-600 hover:to-yellow-600 disabled:hover:from-purple-500 disabled:hover:to-yellow-500"
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
}