import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface IceCreamCakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFlavors: string[], selectedFilling: string) => void;
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
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
    onConfirm(selectedFlavors, selectedFilling);
    resetForm();
    onClose();
  }

  function resetForm() {
    setSelectedFlavors([]);
    setSelectedFilling('');
    setError('');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Monte seu Bolo de Sorvete</h2>
        
        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Escolha 2 Sabores:</h3>
              <div className="grid grid-cols-2 gap-2">
                {flavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => handleFlavorSelect(flavor.name)}
                    className={`p-2 rounded transition-colors ${
                      selectedFlavors.includes(flavor.name)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {flavor.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Escolha o Recheio:</h3>
              <div className="grid grid-cols-2 gap-2">
                {fillings.map((filling) => (
                  <button
                    key={filling.id}
                    onClick={() => setSelectedFilling(filling.name)}
                    className={`p-2 rounded transition-colors ${
                      selectedFilling === filling.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {filling.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
