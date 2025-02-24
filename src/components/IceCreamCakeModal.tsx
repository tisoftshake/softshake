import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DatePicker from 'react-datepicker';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

interface IceCreamCakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFlavors: string[], selectedFilling: string, deliveryDate: Date) => void;
}

interface Flavor {
  id: number;
  name: string;
}

interface Filling {
  id: number;
  name: string;
}

export function IceCreamCakeModal({ isOpen, onClose, onConfirm }: IceCreamCakeModalProps) {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [fillings, setFillings] = useState<Filling[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedFilling, setSelectedFilling] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Calcular a data mínima (3 dias a partir de hoje)
  const minDate = addDays(new Date(), 3);

  useEffect(() => {
    if (isOpen) {
      fetchFlavorsAndFillings();
    }
  }, [isOpen]);

  async function fetchFlavorsAndFillings() {
    try {
      setLoading(true);
      const [flavorsResponse, fillingsResponse] = await Promise.all([
        supabase.from('ice_cream_flavors').select('*'),
        supabase.from('ice_cream_fillings').select('*')
      ]);

      if (flavorsResponse.error) throw flavorsResponse.error;
      if (fillingsResponse.error) throw fillingsResponse.error;

      setFlavors(flavorsResponse.data || []);
      setFillings(fillingsResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar os dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleFlavorSelect(flavorName: string) {
    setError('');
    if (selectedFlavors.includes(flavorName)) {
      setSelectedFlavors(selectedFlavors.filter(flavor => flavor !== flavorName));
    } else if (selectedFlavors.length < 2) {
      setSelectedFlavors([...selectedFlavors, flavorName]);
    } else {
      setError('Você só pode selecionar 2 sabores!');
    }
  }

  function handleSubmit() {
    if (selectedFlavors.length !== 2) {
      setError('Por favor, selecione exatamente 2 sabores!');
      return;
    }
    if (!selectedFilling) {
      setError('Por favor, selecione um recheio!');
      return;
    }
    if (!deliveryDate) {
      setError('Por favor, selecione uma data de entrega!');
      return;
    }
    console.log('Data selecionada:', deliveryDate); // Debug
    onConfirm(selectedFlavors, selectedFilling, deliveryDate);
    resetForm();
    onClose();
  }

  function resetForm() {
    setSelectedFlavors([]);
    setSelectedFilling('');
    setDeliveryDate(null);
    setError('');
    setCurrentStep(1);
  }

  function nextStep() {
    if (currentStep === 1 && selectedFlavors.length !== 2) {
      setError('Por favor, selecione exatamente 2 sabores!');
      return;
    }
    if (currentStep === 2 && !selectedFilling) {
      setError('Por favor, selecione um recheio!');
      return;
    }
    setError('');
    setCurrentStep(currentStep + 1);
  }

  function prevStep() {
    setError('');
    setCurrentStep(currentStep - 1);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-yellow-500 bg-clip-text text-transparent">
              Monte seu Bolo de Sorvete
            </h2>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Flavors */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    1. Escolha 2 Sabores
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {flavors.map((flavor) => (
                      <button
                        key={flavor.id}
                        onClick={() => handleFlavorSelect(flavor.name)}
                        className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
                          selectedFlavors.includes(flavor.name)
                            ? 'bg-gradient-to-r from-purple-500 to-yellow-500 text-white shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {flavor.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Filling */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    2. Escolha o Recheio
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fillings.map((filling) => (
                      <button
                        key={filling.id}
                        onClick={() => setSelectedFilling(filling.name)}
                        className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
                          selectedFilling === filling.name
                            ? 'bg-gradient-to-r from-purple-500 to-yellow-500 text-white shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {filling.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Delivery Date */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    3. Escolha a Data de Entrega
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-amber-600 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pedidos devem ser feitos com no mínimo 3 dias de antecedência
                    </div>
                    <DatePicker
                      selected={deliveryDate}
                      onChange={(date) => setDeliveryDate(date)}
                      minDate={minDate}
                      dateFormat="dd/MM/yyyy"
                      locale={ptBR}
                      placeholderText="Selecione a data de entrega"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-center">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                {currentStep > 1 ? (
                  <button
                    onClick={prevStep}
                    className="px-6 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    Voltar
                  </button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-yellow-500 text-white hover:from-purple-600 hover:to-yellow-600 transition-colors"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-yellow-500 text-white hover:from-purple-600 hover:to-yellow-600 transition-colors"
                  >
                    Confirmar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
