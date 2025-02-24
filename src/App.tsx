import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { CategoryList } from './components/CategoryList';
import { ProductList } from './components/ProductList';
import { Footer } from './components/Footer';
import { CartModal } from './components/CartModal';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { StockManagement } from './pages/StockManagement';
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
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('acai');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  React.useEffect(() => {
    loadCategories();
    loadProducts();

    // Subscribe to real-time product updates
    const subscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          // Reload products when there's an update
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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

  React.useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, categories]);

  return (
    <Router>
      <NotificationProvider>
        <CartProvider>
          <Routes>
            <Route
              path="/"
              element={
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
              }
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/stock" element={<StockManagement />} />
          </Routes>
        </CartProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;