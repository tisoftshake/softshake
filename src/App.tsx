import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { CategoryList } from './components/CategoryList';
import { ProductList } from './components/ProductList';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { CartProvider } from './contexts/CartContext';
import { supabase } from './lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  in_stock: boolean;
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('acai'); // Set default to 'acai'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    setCategories(data || []);
  }

  async function loadProducts() {
    let query = supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (selectedCategory) {
      const category = categories.find(cat => cat.slug === selectedCategory);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }
    
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }
    
    const { data } = await query;
    setProducts(data || []);
  }

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, categories]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header onSearch={setSearchQuery} />
        
        <main>
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <ProductList products={products} />
        </main>
        
        <Footer onOpenCart={() => setIsCartOpen(true)} />
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  );
}

export default App;