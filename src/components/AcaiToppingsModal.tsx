import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AcaiTopping {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
}

interface AcaiToppingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    size?: '300ml' | '500ml' | '700ml';
  };
  toppings: AcaiTopping[];
  onConfirm: (selectedToppings: string[]) => void;
}

export function AcaiToppingsModal({ isOpen, onClose, product, toppings, onConfirm }: AcaiToppingsModalProps) {
  const [selectedToppings, setSelectedToppings] = React.useState<string[]>([]);

  if (!isOpen) return null;

  // Definir limite de adicionais baseado no tamanho
  const getToppingsLimit = () => {
    const name = product.name.toLowerCase();
    if (name.includes('700')) return 5;
    if (name.includes('500')) return 4;
    if (name.includes('300')) return 3;
    return 3; // padrão para 300ml
  };

  const toppingsLimit = getToppingsLimit();
  const remainingToppings = toppingsLimit - selectedToppings.length;

  const handleToggleTopping = (toppingId: string) => {
    setSelectedToppings(current => {
      if (current.includes(toppingId)) {
        return current.filter(id => id !== toppingId);
      }
      if (current.length >= toppingsLimit) {
        return current;
      }
      return [...current, toppingId];
    });
  };

  const calculateTotal = () => {
    const toppingsTotal = selectedToppings.reduce((sum, toppingId) => {
      const topping = toppings.find(t => t.id === toppingId);
      return sum + (topping?.price || 0);
    }, 0);
    return product.price + toppingsTotal;
  };

  const handleConfirm = () => {
    onConfirm(selectedToppings);
    setSelectedToppings([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-500 to-yellow-500 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold">Escolha os Adicionais</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-purple-500 font-semibold">
                A partir de R$ {product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-700">
              <p className="font-medium">Limite de Adicionais:</p>
              <p>• 300ml: até 3 adicionais</p>
              <p>• 500ml: até 4 adicionais</p>
              <p>• 700ml: até 5 adicionais</p>
              <p className="mt-1 font-medium">
                Você ainda pode escolher {remainingToppings} {remainingToppings === 1 ? 'adicional' : 'adicionais'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {toppings.map((topping) => (
                <label
                  key={topping.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedToppings.includes(topping.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  } ${
                    (!topping.in_stock || (selectedToppings.length >= toppingsLimit && !selectedToppings.includes(topping.id)))
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedToppings.includes(topping.id)}
                    onChange={() => topping.in_stock && handleToggleTopping(topping.id)}
                    disabled={!topping.in_stock || (selectedToppings.length >= toppingsLimit && !selectedToppings.includes(topping.id))}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm block truncate">{topping.name}</span>
                    {topping.price > 0 && (
                      <span className="text-xs text-purple-500">+ R$ {topping.price.toFixed(2)}</span>
                    )}
                    {!topping.in_stock && (
                      <span className="text-xs text-red-500">Indisponível</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Total:</span>
              <span className="text-purple-500">R$ {calculateTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-purple-500 to-yellow-500 text-white py-3 px-4 rounded-xl font-semibold transition-all hover:from-purple-600 hover:to-yellow-600"
            >
              Confirmar Seleção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}