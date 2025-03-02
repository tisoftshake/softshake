import React, { useState } from 'react';
import { X, AlertCircle, Calendar } from 'lucide-react';

interface CakeFlavor {
  id: string;
  name: string;
  type: 'flavor' | 'filling';
  in_stock: boolean;
}

interface CakeCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
  flavors: CakeFlavor[];
  onConfirm: (selections: {
    flavor: string;
    fillings: string[];
    customerName: string;
    customerPhone: string;
    pickupDate: string;
  }) => void;
}

export function CakeCustomizationModal({ 
  isOpen, 
  onClose, 
  product, 
  flavors,
  onConfirm 
}: CakeCustomizationModalProps) {
  const [step, setStep] = useState<'flavors' | 'details'>('flavors');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedFillings, setSelectedFillings] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  if (!isOpen) return null;

  const availableFlavors = flavors.filter(f => f.type === 'flavor');
  const availableFillings = flavors.filter(f => f.type === 'filling');

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  // Ajustamos para o fuso horário local
  const minDateString = new Date(minDate.getTime() - (minDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  const handleFlavorSelect = (flavorId: string) => {
    setSelectedFlavor(flavorId);
  };

  const handleFillingToggle = (fillingId: string) => {
    setSelectedFillings(current => {
      if (current.includes(fillingId)) {
        return current.filter(id => id !== fillingId);
      }
      if (current.length < 2) {
        return [...current, fillingId];
      }
      return current;
    });
  };

  const handleNextStep = () => {
    if (selectedFlavor) {
      setStep('details');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      flavor: selectedFlavor,
      fillings: selectedFillings,
      customerName,
      customerPhone,
      pickupDate
    });
    setStep('flavors');
    setSelectedFlavor('');
    setSelectedFillings([]);
    setCustomerName('');
    setCustomerPhone('');
    setPickupDate('');
    onClose();
  };

  const handleClose = () => {
    setStep('flavors');
    setSelectedFlavor('');
    setSelectedFillings([]);
    setCustomerName('');
    setCustomerPhone('');
    setPickupDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-500 to-yellow-500 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold">
            {step === 'flavors' ? 'Escolha os Sabores' : 'Detalhes do Pedido'}
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          {step === 'flavors' ? (
            <div className="space-y-6">
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

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Escolha o Sabor Principal</h4>
                <div className="grid grid-cols-2 gap-3">
                  {availableFlavors.map((flavor) => (
                    <label
                      key={flavor.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedFlavor === flavor.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
                      } ${!flavor.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="flavor"
                        checked={selectedFlavor === flavor.id}
                        onChange={() => flavor.in_stock && handleFlavorSelect(flavor.id)}
                        disabled={!flavor.in_stock}
                        className="w-4 h-4 text-purple-500 focus:ring-purple-200"
                      />
                      <span className="font-medium text-sm">{flavor.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Escolha até 2 Recheios (Opcional)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {availableFillings.map((filling) => (
                    <label
                      key={filling.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedFillings.includes(filling.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
                      } ${!filling.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFillings.includes(filling.id)}
                        onChange={() => filling.in_stock && handleFillingToggle(filling.id)}
                        disabled={!filling.in_stock || (!selectedFillings.includes(filling.id) && selectedFillings.length >= 2)}
                        className="w-4 h-4 rounded text-purple-500 focus:ring-purple-200"
                      />
                      <span className="font-medium text-sm">{filling.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextStep}
                disabled={!selectedFlavor}
                className="w-full bg-gradient-to-r from-purple-500 to-yellow-500 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 transition-all hover:from-purple-600 hover:to-yellow-600"
              >
                Continuar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  O prazo mínimo para retirada é de 3 dias a partir da data do pedido.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Retirada
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={minDateString}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-200 pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-yellow-500 text-white py-3 px-4 rounded-xl font-semibold transition-all hover:from-purple-600 hover:to-yellow-600"
              >
                Adicionar ao Carrinho
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
