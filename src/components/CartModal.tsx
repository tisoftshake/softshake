import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Truck, Store } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CheckoutForm {
  name: string;
  phone: string;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
}

const DELIVERY_FEE = 2;

export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    deliveryType: 'pickup'
  });

  if (!isOpen) return null;

  const finalTotal = form.deliveryType === 'delivery' ? total + DELIVERY_FEE : total;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Encontrar a data de entrega mais próxima dos bolos
      const deliveryDate = items
        .filter(item => item.deliveryDate)
        .map(item => new Date(item.deliveryDate))
        .sort((a, b) => a.getTime() - b.getTime())[0];

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: form.name,
            customer_phone: form.phone,
            delivery_type: form.deliveryType,
            delivery_address: form.address,
            items: items,
            total_amount: finalTotal,
            status: 'pending',
            delivery_date: deliveryDate?.toISOString().split('T')[0]
          }
        ])
        .select();

      if (error) throw error;

      clearCart();
      onClose();
      toast.success('Pedido enviado com sucesso!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(to right, #9333ea, #eab308)',
          color: 'white',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
        },
        icon: '🎉'
      });
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast.error('Erro ao enviar o pedido. Tente novamente.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
        }
      });
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
                <div key={item.id} className="flex items-start gap-4 py-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-900 truncate">{item.name}</h4>
                    {item.flavors && item.filling && (
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Sabores: {item.flavors.join(' + ')}</p>
                        <p>Recheio: {item.filling}</p>
                        {item.deliveryDate && (
                          <p className="text-purple-600 font-medium mt-1">
                            Entrega: {new Date(item.deliveryDate).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-4">
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
                    <div className="text-center">
                      <span className="font-medium text-sm block">Entrega</span>
                      <span className="text-xs text-purple-600">+ R$ {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  {form.deliveryType === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Entrega:</span>
                      <span>R$ {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base sm:text-xl font-bold text-gray-900 pt-2">
                    <span>Total:</span>
                    <span>R$ {finalTotal.toFixed(2)}</span>
                  </div>
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

function PrintLayout({ order }: { order: any }) {
  return (
    <div className="print-layout hidden print:block">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">SoftShake</h1>
        <p className="text-base">================================</p>
        <p className="text-xl mt-2">PEDIDO #{order.id.slice(0, 8)}</p>
        <p className="text-base">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
      </div>

      <div className="mb-4">
        <p className="uppercase font-bold text-lg">CLIENTE</p>
        <p className="text-base">Nome: {order.customer_name}</p>
        <p className="text-base">Tel: {order.customer_phone}</p>
        <p className="text-base">Tipo: {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}</p>
        {order.delivery_address && (
          <p className="text-base">End: {order.delivery_address}</p>
        )}
        {order.delivery_date && (
          <p className="text-base font-medium text-purple-700">
            *** Data de Entrega: {new Date(order.delivery_date).toLocaleDateString('pt-BR')} ***
          </p>
        )}
      </div>

      <p className="text-base">================================</p>
      <p className="my-2 font-bold text-lg">ITENS DO PEDIDO</p>
      <p className="text-base">================================</p>

      {order.items.map((item: any, index: number) => (
        <div key={index} className="mb-3">
          <div className="flex justify-between text-base">
            <span>{item.quantity}x {item.name}</span>
            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
          {item.flavors && item.filling && (
            <div className="text-sm ml-4">
              <p>Sabores: {item.flavors.join(' + ')}</p>
              <p>Recheio: {item.filling}</p>
            </div>
          )}
        </div>
      ))}

      <p className="text-base">================================</p>
      
      <div className="mt-2">
        <div className="flex justify-between text-base">
          <span>Subtotal:</span>
          <span>R$ {order.total_amount.toFixed(2)}</span>
        </div>
        {order.delivery_type === 'delivery' && (
          <div className="flex justify-between text-base">
            <span>Taxa de Entrega:</span>
            <span>R$ {DELIVERY_FEE.toFixed(2)}</span>
          </div>
        )}
        <p className="text-base">================================</p>
        <div className="flex justify-between font-bold text-xl">
          <span>TOTAL:</span>
          <span>R$ {(order.delivery_type === 'delivery' ? order.total_amount + DELIVERY_FEE : order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm mb-1">*** Obrigado pela preferência! ***</p>
        <p className="text-sm">www.softshake.com.br</p>
        <p className="text-sm mt-4">{new Date().toLocaleString('pt-BR')}</p>
        <p className="mt-4">--------------------------------</p>
      </div>
    </div>
  );
}