import React, { useEffect, useState } from 'react';
import { 
  IceCream, 
  Settings, 
  LogOut, 
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  Search,
  ChevronRight,
  AlertCircle,
  Printer,
  Package,
  BarChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { ReportsTab } from '../components/ReportsTab';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: 'pickup' | 'delivery';
  delivery_address?: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    flavors?: string[];
    filling?: string;
    deliveryDate?: Date;
    toppings?: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
  total_amount: number;
  status: 'pending' | 'accepted' | 'preparing' | 'delivering' | 'completed';
  created_at: string;
  delivery_date?: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
}

// Componente para o layout de impressão
function PrintLayout({ order }: { order: Order }) {
  const DELIVERY_FEE = 2;
  const finalAmount = order.delivery_type === 'delivery' 
    ? order.total_amount + DELIVERY_FEE 
    : order.total_amount;

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

      <div className="mt-4 space-y-2">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <div>
              <span>{item.quantity}x {item.name}
                {item.toppings && item.toppings.length > 0 && (
                  <span> ({item.toppings.map(t => t.name).join(', ')})</span>
                )}
              </span>
              {item.flavors && (
                <div className="text-sm">
                  Sabores: {item.flavors.join(', ')}
                </div>
              )}
              {item.filling && (
                <div className="text-sm">
                  Recheio: {item.filling}
                </div>
              )}
            </div>
            <span>R$ {((item.price + (item.toppings?.reduce((sum, t) => sum + t.price, 0) || 0)) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

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
          <span>R$ {finalAmount.toFixed(2)}</span>
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

function OrderDetailsModal({ order, onClose, onUpdateStatus }: OrderDetailsModalProps) {
  if (!order) return null;

  const DELIVERY_FEE = 2;
  const finalAmount = order.delivery_type === 'delivery' 
    ? order.total_amount + DELIVERY_FEE 
    : order.total_amount;

  const handlePrint = () => {
    window.print();
  };

  const statusColors = {
    pending: 'bg-yellow-500',
    accepted: 'bg-blue-500',
    preparing: 'bg-orange-500',
    delivering: 'bg-indigo-500',
    completed: 'bg-green-500'
  };

  const statusLabels = {
    pending: 'Pendente',
    accepted: 'Aceito',
    preparing: 'Preparando',
    delivering: 'Entregando',
    completed: 'Concluído'
  };

  const nextStatus: { [K in Order['status']]: Order['status'] } = {
    pending: 'accepted',
    accepted: 'preparing',
    preparing: 'delivering',
    delivering: 'completed',
    completed: 'completed'
  };

  const handleUpdateStatus = async () => {
    const newStatus = nextStatus[order.status];
    if (newStatus !== order.status) {
      await onUpdateStatus(order.id, newStatus);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          <div className="p-6 border-b sticky top-0 bg-white z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleString('pt-BR')}
                </p>
                {order.delivery_date && (
                  <p className="text-sm font-medium text-purple-600 mt-1">
                    Data de Entrega: {new Date(order.delivery_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Imprimir pedido"
                >
                  <Printer className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
              {order.status !== 'completed' && (
                <button
                  onClick={handleUpdateStatus}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  Avançar Status
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Informações do Cliente</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Nome: <span className="text-gray-900">{order.customer_name}</span></p>
                <p className="text-gray-600">Telefone: <span className="text-gray-900">{order.customer_phone}</span></p>
                <p className="text-gray-600">
                  Tipo de Entrega: 
                  <span className="text-gray-900 ml-1">
                    {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}
                  </span>
                </p>
                {order.delivery_address && (
                  <p className="text-gray-600">
                    Endereço: <span className="text-gray-900">{order.delivery_address}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Itens do Pedido</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.name}
                        {item.toppings && item.toppings.length > 0 && (
                          <span className="font-normal text-gray-600">
                            {" "}({item.toppings.map(t => t.name).join(', ')})
                          </span>
                        )}
                      </p>
                      {item.flavors && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Sabores:</span> {item.flavors.join(', ')}
                        </p>
                      )}
                      {item.filling && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Recheio:</span> {item.filling}
                        </p>
                      )}
                      {item.toppings && item.toppings.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Adicionais:</p>
                          <ul className="list-disc list-inside">
                            {item.toppings.map((topping, idx) => (
                              <li key={idx}>
                                {topping.name} (+R$ {topping.price.toFixed(2)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity}x R$ {(
                          (item.price + (item.toppings?.reduce((sum, t) => sum + t.price, 0) || 0))
                        ).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: R$ {(
                          (item.price + (item.toppings?.reduce((sum, t) => sum + t.price, 0) || 0)) * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal:</span>
                  <span>R$ {order.total_amount.toFixed(2)}</span>
                </div>
                {order.delivery_type === 'delivery' && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout de impressão */}
      <PrintLayout order={order} />

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-layout {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            font-family: monospace;
            padding: 8mm;
            margin: 0;
            background: white;
          }
          
          .print-layout * {
            visibility: visible !important;
          }

          .print-layout .flex {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { notifyNewOrder, notifyOrderSent } = useNotification();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'orders' | 'reports'>('orders');

  useEffect(() => {
    fetchOrders();

    // Inscrever-se para atualizações em tempo real
    const ordersSubscription = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          // Notify about new order
          notifyNewOrder();
          // Reload orders
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, [notifyNewOrder]);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, delivery_date')
      .order('created_at', { ascending: false });
    
    if (data) {
      // Garantir que as datas estejam no formato correto
      const formattedOrders = data.map(order => ({
        ...order,
        delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : undefined
      }));
      setOrders(formattedOrders);
    } else {
      setOrders([]);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: Order['status']) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Atualiza a lista de pedidos
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // Se o pedido foi marcado como entregue, notifica
      if (newStatus === 'completed') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          notifyOrderSent(order.id.slice(0, 8));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.id.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status]++;
      return acc;
    },
    {
      pending: 0,
      accepted: 0,
      preparing: 0,
      delivering: 0,
      completed: 0
    } as Record<Order['status'], number>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <IceCream className="text-blue-600" />
            <span className="text-xl font-bold">SoftShake</span>
          </div>
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setSelectedTab('orders')}
            className={`w-full flex items-center space-x-2 px-4 py-2 ${
              selectedTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package size={20} />
            <span>Pedidos</span>
          </button>
          <button
            onClick={() => setSelectedTab('reports')}
            className={`w-full flex items-center space-x-2 px-4 py-2 ${
              selectedTab === 'reports' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart size={20} />
            <span>Relatórios</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {selectedTab === 'orders' ? (
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-2">
                    <IceCream className="w-8 h-8 text-purple-500" />
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-yellow-500 text-transparent bg-clip-text">
                      SoftShake Admin
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate('/admin/stock')}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative"
                      title="Gerenciar Estoque"
                    >
                      <Package className="w-5 h-5" />
                      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Gerenciar Estoque
                      </span>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
              {/* Status Filters */}
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2
                    ${filter === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  Todos
                  <span className="bg-gray-800 px-1.5 py-0.5 rounded-full text-xs">
                    {orders.length}
                  </span>
                </button>
                
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2
                    ${filter === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  Pendentes
                  <span className="bg-yellow-400 px-1.5 py-0.5 rounded-full text-xs">
                    {statusCounts.pending}
                  </span>
                </button>

                <button
                  onClick={() => setFilter('accepted')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2
                    ${filter === 'accepted'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Aceitos
                  <span className="bg-blue-400 px-1.5 py-0.5 rounded-full text-xs">
                    {statusCounts.accepted}
                  </span>
                </button>

                <button
                  onClick={() => setFilter('preparing')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2
                    ${filter === 'preparing'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <IceCream className="w-4 h-4" />
                  Preparando
                  <span className="bg-orange-400 px-1.5 py-0.5 rounded-full text-xs">
                    {statusCounts.preparing}
                  </span>
                </button>

                <button
                  onClick={() => setFilter('delivering')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2
                    ${filter === 'delivering'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Truck className="w-4 h-4" />
                  Entregando
                  <span className="bg-indigo-400 px-1.5 py-0.5 rounded-full text-xs">
                    {statusCounts.delivering}
                  </span>
                </button>

                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2
                    ${filter === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Concluídos
                  <span className="bg-green-400 px-1.5 py-0.5 rounded-full text-xs">
                    {statusCounts.completed}
                  </span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone ou número do pedido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Orders List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center sm:col-span-2 lg:col-span-3 xl:col-span-4">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white rounded-xl p-4 text-left hover:shadow-lg transition-shadow flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">#{order.id.slice(0, 8)}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs whitespace-nowrap
                          ${order.status === 'pending' && 'bg-yellow-500'}
                          ${order.status === 'accepted' && 'bg-blue-500'}
                          ${order.status === 'preparing' && 'bg-orange-500'}
                          ${order.status === 'delivering' && 'bg-indigo-500'}
                          ${order.status === 'completed' && 'bg-green-500'}
                        `}>
                          {order.status === 'pending' && 'Pendente'}
                          {order.status === 'accepted' && 'Aceito'}
                          {order.status === 'preparing' && 'Preparando'}
                          {order.status === 'delivering' && 'Entregando'}
                          {order.status === 'completed' && 'Concluído'}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{order.customer_name}</p>
                            <p className="text-xs text-gray-500 truncate">{order.customer_phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </p>
                        <p className="font-bold text-sm">
                          R$ {order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </main>

            {selectedOrder && (
              <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={updateOrderStatus}
              />
            )}
          </div>
        ) : (
          <ReportsTab />
        )}
      </div>
    </div>
  );
}
