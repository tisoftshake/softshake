import React, { useEffect, useState } from 'react';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
  product_id: string;
}

interface ProductVariationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function ProductVariationsModal({ 
  isOpen, 
  onClose, 
  productId,
  productName 
}: ProductVariationsModalProps) {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVariations();
    }
  }, [isOpen, productId]);

  const loadVariations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .order('name');

      if (error) {
        throw error;
      }

      setVariations(data || []);
    } catch (error) {
      console.error('Erro ao carregar variações:', error);
      alert('Erro ao carregar variações. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariation = () => {
    const newVariation: ProductVariation = {
      id: 'temp_' + Date.now(),
      name: '',
      price: 0,
      in_stock: true,
      product_id: productId
    };
    setVariations(prev => [...prev, newVariation]);
  };

  const handleRemoveVariation = async (index: number, variationId: string) => {
    try {
      // Se for uma variação temporária, apenas remove do state
      if (variationId.startsWith('temp_')) {
        setVariations(prev => prev.filter((_, i) => i !== index));
        return;
      }

      // Se for uma variação existente, remove do banco de dados
      const { error } = await supabase
        .from('product_variations')
        .delete()
        .eq('id', variationId)
        .eq('product_id', productId); // Garantir que a variação pertence ao produto

      if (error) {
        throw error;
      }

      setVariations(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Erro ao excluir variação:', error);
      alert('Erro ao excluir variação. Por favor, tente novamente.');
    }
  };

  const handleVariationChange = (index: number, field: keyof ProductVariation, value: any) => {
    setVariations(prev => {
      const newVariations = [...prev];
      newVariations[index] = {
        ...newVariations[index],
        [field]: field === 'price' ? parseFloat(value) || 0 : value
      };
      return newVariations;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validar dados antes de salvar
      const invalidVariations = variations.filter(v => !v.name.trim());
      if (invalidVariations.length > 0) {
        alert('Por favor, preencha o nome de todas as variações.');
        return;
      }

      // Separar variações existentes e novas
      const existingVariations = variations.filter(v => !v.id.startsWith('temp_'));
      const newVariations = variations.filter(v => v.id.startsWith('temp_'));

      // Atualizar variações existentes
      for (const variation of existingVariations) {
        const { error } = await supabase
          .from('product_variations')
          .update({
            name: variation.name.trim(),
            price: variation.price,
            in_stock: variation.in_stock
          })
          .eq('id', variation.id)
          .eq('product_id', productId); // Garantir que a variação pertence ao produto

        if (error) {
          throw error;
        }
      }

      // Inserir novas variações
      if (newVariations.length > 0) {
        const { error } = await supabase
          .from('product_variations')
          .insert(
            newVariations.map(v => ({
              name: v.name.trim(),
              price: v.price,
              in_stock: v.in_stock,
              product_id: productId
            }))
          );

        if (error) {
          throw error;
        }
      }

      await loadVariations(); // Recarrega as variações
      alert('Variações salvas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar variações:', error);
      alert('Erro ao salvar variações. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Variações do Produto</h2>
            <p className="text-sm text-gray-500 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando variações...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {variations.map((variation, index) => (
                  <div key={variation.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Variação
                      </label>
                      <input
                        type="text"
                        value={variation.name}
                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                        placeholder="Ex: 300ml, 500ml, etc"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variation.price}
                        onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <input
                        type="checkbox"
                        checked={variation.in_stock}
                        onChange={(e) => handleVariationChange(index, 'in_stock', e.target.checked)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Em estoque</span>
                    </div>
                    <button
                      onClick={() => handleRemoveVariation(index, variation.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                      title="Remover variação"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddVariation}
                className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Variação</span>
              </button>
            </>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              saving || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Variações'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
