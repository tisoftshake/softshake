import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ScrollingText } from './ScrollingText';

interface IceCreamBucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (flavorId: string, flavorName: string, price: number) => void;
}

interface Flavor {
  id: string;
  name: string;
  in_stock: boolean;
}

export function IceCreamBucketModal({ isOpen, onClose, onConfirm }: IceCreamBucketModalProps) {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const fixedPrice = 75.00; // Preço fixo do balde de sorvete

  useEffect(() => {
    if (isOpen) {
      loadFlavors();
      setSelectedFlavor(null);
    }
  }, [isOpen]);

  const loadFlavors = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('ice_cream_bucket_flavors')
        .select('*')
        .eq('in_stock', true)
        .order('name');

      if (error) throw error;

      setFlavors(data || []);
    } catch (error) {
      console.error('Erro ao carregar sabores:', error);
      setError('Erro ao carregar os sabores. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (flavor: Flavor) => {
    setSelectedFlavor(flavor);
  };

  const handleConfirm = () => {
    if (selectedFlavor) {
      onConfirm(selectedFlavor.id, selectedFlavor.name, fixedPrice);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-yellow-500 bg-clip-text text-transparent">
                Escolha o Sabor
              </h2>
              <p className="text-gray-600 mt-1">Selecione um sabor para o seu balde de sorvete</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : flavors.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Nenhum sabor disponível no momento.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {flavors.map((flavor) => {
                  const isSelected = selectedFlavor?.id === flavor.id;
                  return (
                    <button
                      key={flavor.id}
                      onClick={() => handleSelect(flavor)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center
                        ${isSelected 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                        }
                      `}
                    >
                      <ScrollingText text={flavor.name} className="h-6" />
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-gray-600">Sabor selecionado: {selectedFlavor ? selectedFlavor.name : 'Nenhum'}</p>
                  <p className="text-purple-600 font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(fixedPrice)}
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedFlavor}
                  className={`px-6 py-2 rounded-lg font-medium transition-all
                    ${selectedFlavor
                      ? 'bg-gradient-to-r from-purple-500 to-yellow-500 text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}