import React, { useEffect, useState } from 'react';
import { Search, ArrowLeft, Edit2, Plus, Save, X, Image as ImageIcon, List, Trash2, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { toast } from 'react-toastify';
import { ProductEditModal } from '../components/ProductEditModal';
import { ProductVariationsModal } from '../components/ProductVariationsModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  in_stock: boolean;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface EditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Partial<Product>) => Promise<void>;
  categories: Category[];
  isNew?: boolean;
}

export function StockManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    const subscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(current => [...current, payload.new as Product]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(current =>
              current.map(product =>
                product.id === payload.new.id
                  ? { ...product, ...payload.new }
                  : product
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts(current =>
              current.filter(product => product.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return;
    }

    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return;
    }

    setCategories(data || []);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsNewProduct(true);
    setShowEditModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsNewProduct(false);
    setShowEditModal(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (isNewProduct) {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;

        setProducts(prev => [...prev, data]);
        toast.success('Produto criado com sucesso! 🎉', {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (selectedProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);

        if (error) throw error;

        setProducts(prev =>
          prev.map(p => p.id === selectedProduct.id ? { ...p, ...productData } : p)
        );
        toast.success('Produto atualizado com sucesso! ✨', {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setShowEditModal(false);
      setSelectedProduct(null);
      setIsNewProduct(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error(`Erro ao ${isNewProduct ? 'criar' : 'atualizar'} o produto`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error: variationsError } = await supabase
        .from('product_variations')
        .delete()
        .eq('product_id', productToDelete.id);

      if (variationsError) throw variationsError;

      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (productError) throw productError;

      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      
      toast.success(`Produto "${productToDelete.name}" excluído com sucesso!`, {
        position: "top-right",
        autoClose: 5000,
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error(`Erro ao excluir o produto "${productToDelete.name}". Por favor, tente novamente.`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Gerenciar Produtos
              </h1>
            </div>
            <button
              onClick={handleAddProduct}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.description}
                </p>
                <p className="text-lg font-semibold text-purple-600 mb-4">
                  R$ {product.price.toFixed(2)}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowVariationsModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-full transition-colors"
                      title="Gerenciar variações"
                    >
                      <Package className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                      title="Editar produto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modais */}
        <ProductEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            setIsNewProduct(false);
          }}
          onSave={handleSaveProduct}
          product={selectedProduct}
          categories={categories}
          isNew={isNewProduct}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProduct}
          itemName={productToDelete?.name || ''}
          itemType="produto"
        />

        {selectedProduct && (
          <ProductVariationsModal
            isOpen={showVariationsModal}
            onClose={() => {
              setShowVariationsModal(false);
              setSelectedProduct(null);
            }}
            productId={selectedProduct.id}
            productName={selectedProduct.name}
          />
        )}
      </div>
    </div>
  );
}
