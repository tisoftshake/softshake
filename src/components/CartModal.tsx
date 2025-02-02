import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Truck, Store } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';

interface CheckoutForm {
  name: string;
  phone: string;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
}

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    deliveryType: 'pickup'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: form.name,
            customer_phone: form.phone,
            delivery_type: form.deliveryType,
            delivery_address: form.address,
            items: items,
            total_amount: total,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;

      clearCart();
      onClose();
      alert('Pedido realizado com sucesso!');
    } catch (error) {
      alert('Erro ao realizar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gradient-to-r from-purple-500 to-yellow-500 text-white rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            Seu Carrinho
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-30" />
            <p className="text-lg sm:text-xl">Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 sm:gap-4 bg-gradient-to-r from-purple-50 to-yellow-50 p-3 sm:p-4 rounded-xl">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-base sm:text-lg">{item.name}</h3>
                    <p className="text-purple-500 font-semibold mt-0.5 sm:mt-1 text-sm sm:text-base">
                      R$ {item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 sm:p-2 hover:bg-purple-100 rounded-full text-gray-400 hover:text-red-500 transition-colors self-start"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-t bg-gradient-to-r from-purple-50 to-yellow-50">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full text-sm rounded-lg border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-200"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full text-sm rounded-lg border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-200"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Tipo de Entrega
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, deliveryType: 'pickup' }))}
                    className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center gap-1.5 sm:gap-2 transition-colors
                      ${form.deliveryType === 'pickup'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-purple-200 hover:border-purple-300'
                      }`}
                  >
                    <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-medium text-sm">Retirada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, deliveryType: 'delivery' }))}
                    className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center gap-1.5 sm:gap-2 transition-colors
                      ${form.deliveryType === 'delivery'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-purple-200 hover:border-purple-300'
                      }`}
                  >
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-medium text-sm">Entrega</span>
                  </button>
                </div>
              </div>

              {form.deliveryType === 'delivery' && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Endereço de Entrega
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full text-sm rounded-lg border-purple-200 shadow-sm focus:border-purple-500 focus:ring-purple-200"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
              )}

              <div className="pt-4 sm:pt-6 border-t border-purple-200">
                <div className="flex justify-between text-base sm:text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-purple-500 to-yellow-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-sm font-semibold hover:from-purple-600 hover:to-yellow-600 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
                >
                  {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}