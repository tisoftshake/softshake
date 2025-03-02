import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  in_stock: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product: Product | null;
  categories: Category[];
  isNew: boolean;
}

export function ProductEditModal({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  isNew
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category_id: '',
    in_stock: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.image_url);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category_id: categories[0]?.id || '',
        in_stock: true
      });
      setImagePreview('');
    }
  }, [product, categories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (!formData.image_url || !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'URL da imagem inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {isNew ? 'Novo Produto' : 'Editar Produto'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                      rows={4}
                      required
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Selecione...</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                        required
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Imagem
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={handleImageChange}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.image_url ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                        required
                      />
                      {errors.image_url && (
                        <p className="text-sm text-red-500 mt-1">{errors.image_url}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.in_stock}
                      onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Disponível em estoque</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <div className="w-full h-64 lg:h-96 rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={imagePreview}
                        alt="Preview do Produto"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 lg:h-96 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                      <span className="ml-2">Preview da Imagem</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {isNew ? 'Criar Produto' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
