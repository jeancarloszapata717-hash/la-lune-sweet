import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  shortDesc: string;
  longDesc?: string;
  image: string;
  category: string;
  status: 'active' | 'draft' | 'soldout' | 'inactive';
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const prods: Product[] = data.map(p => ({
          id: p.id,
          name: p.nombre,
          basePrice: p.precio,
          shortDesc: p.descripcion || '',
          image: p.imagen_url || '',
          category: p.categoria || 'Sin categoría',
          status: p.status || 'active'
        }));
        
        setProducts(prods);

        const catCounts: Record<string, number> = {};
        prods.forEach(p => {
          catCounts[p.category] = (catCounts[p.category] || 0) + 1;
        });

        const cats = Object.entries(catCounts).map(([name, count]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          count
        }));
        setCategories(cats);
      }
      setLoading(false);
    };

    fetchProducts();

    // Set up real-time subscription for products
    const channel = supabase
      .channel('public:productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, categories, loading };
}
