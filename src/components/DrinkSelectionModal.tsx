import React from 'react';
import { X } from 'lucide-react';

interface DrinkVariation {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
}

interface DrinkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    image_url: string;
  };
  variations: DrinkVariation[];
  onConfirm: (selectedVariation: DrinkVariation) => void;
}

export function DrinkSelectionModal({ 
  isOpen, 
  onClose, 
  product, 
  variations, 
  onConfirm 
}: DrinkSelectionModalProps) {
  const [selectedVariation, setSelectedVariation] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const variation = variations.find(v => v.id === selectedVariation);
    if (variation) {
      onConfirm(variation);
      setSelectedVariation(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-500 to-yellow-500 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold">Escolha a Variação</h2>
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
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 mb-6">
            <div className="grid grid-cols-1 gap-4">
              {variations.map((variation) => (
                <label
                  key={variation.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedVariation === variation.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  } ${!variation.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="variation"
                    checked={selectedVariation === variation.id}
                    onChange={() => variation.in_stock && setSelectedVariation(variation.id)}
                    disabled={!variation.in_stock}
                    className="w-4 h-4 mt-1 text-purple-500 focus:ring-purple-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-medium text-sm break-words">{variation.name}</span>
                      <span className="text-purple-500 font-semibold whitespace-nowrap">
                        R$ {variation.price.toFixed(2)}
                      </span>
                    </div>
                    {!variation.in_stock && (
                      <span className="text-xs text-red-500 block mt-1">Indisponível</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedVariation}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedVariation
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
