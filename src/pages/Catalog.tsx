import { motion } from 'motion/react';
import { useState } from 'react';
import { useProducts } from '../data/useProducts';
import ProductCard from '../components/ProductCard';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Catalog() {
  const [filter, setFilter] = useState('todos');
  const navigate = useNavigate();
  const { products, categories: dynamicCategories } = useProducts();

  const categories = ['todos', ...dynamicCategories.map(c => c.name)];
  
  // Show products that are not drafts. Inactive/Soldout will be visually handled in ProductCard.
  const visibleProducts = products.filter(p => p.status !== 'draft');
  const filteredProducts = filter === 'todos' 
    ? visibleProducts 
    : visibleProducts.filter(p => p.category === filter);

  const handleRandomRecommend = () => {
    const activeProducts = visibleProducts.filter(p => p.status === 'active');
    if (activeProducts.length === 0) return;
    const randomIndex = Math.floor(Math.random() * activeProducts.length);
    const randomProduct = activeProducts[randomIndex];
    navigate(`/producto/${randomProduct.id}`);
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 min-h-screen bg-brand-cream border-t border-brand-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative">
          <div className="relative">
            <h1 className="font-display font-black text-5xl md:text-7xl text-brand-dark mb-2 uppercase tracking-tight relative z-10">
              El Antojo <br className="hidden md:block" />Que Mereces, <br className="hidden md:block"/> Ahora
            </h1>
            <p className="font-sans font-bold text-brand-dark/90 max-w-xl text-sm md:text-base uppercase tracking-widest mt-4">
              Descubre por qué todos hablan de La Lune
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRandomRecommend}
            className="flex items-center space-x-2 bg-brand-hotpink text-white px-6 py-4 rounded-xl hover:bg-brand-dark transition-colors shadow-[0_0_20px_rgba(213,63,140,0.3)] hover:shadow-[0_0_30px_rgba(213,63,140,0.5)]"
          >
            <Sparkles size={18} className="animate-pulse" />
            <span className="font-sans text-[10px] sm:text-xs tracking-[0.2em] uppercase font-bold">¡Sugiéreme algo!</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`font-sans font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase py-2 md:py-3 px-4 md:px-8 border-2 transition-all rounded-full ${
                filter === cat 
                ? 'bg-brand-dark text-white border-brand-dark' 
                : 'bg-transparent text-brand-dark border-brand-dark hover:border-brand-hotpink hover:text-brand-hotpink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid - 2 columns on mobile */}
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8"
        >
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={product.id}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-brand-dark/50">
            No se encontraron productos en esta categoría.
          </div>
        )}

      </div>
    </div>
  );
}
