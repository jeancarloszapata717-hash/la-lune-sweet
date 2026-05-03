import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    basePrice: number;
    image: string;
    category: string;
    status: 'active' | 'soldout' | 'inactive' | 'draft';
    isNew?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.status === 'active';

  return (
    <motion.div 
      className={`group relative h-full flex flex-col ${!isAvailable ? 'cursor-not-allowed' : ''}`}
      whileHover={isAvailable ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Link 
        to={isAvailable ? `/producto/${product.id}` : '#'} 
        className={`flex flex-col h-full bg-transparent rounded-[20px] md:rounded-[2rem] border border-transparent overflow-hidden transition-all duration-300 ${isAvailable ? 'hover:border-brand-dark/10' : ''}`}
        onClick={(e) => !isAvailable && e.preventDefault()}
      >
        <div className="relative aspect-square overflow-hidden bg-brand-cream/50 rounded-[20px] md:rounded-[2rem]">
          {product.isNew && isAvailable && (
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 bg-brand-hotpink text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full">
              Nuevo
            </div>
          )}
          
          {!isAvailable && (
            <div className="absolute inset-0 z-20 bg-brand-dark/20 backdrop-blur-[1px] flex items-center justify-center p-4">
              <span className="bg-white text-red-600 font-display font-black text-xs md:text-sm uppercase tracking-widest px-4 py-2 rounded-lg shadow-xl border-2 border-red-600">
                {product.status === 'soldout' ? 'Agotado' : 'No Disponible'}
              </span>
            </div>
          )}

          <img 
            src={product.image} 
            alt={product.name}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ${isAvailable ? 'group-hover:scale-110 group-hover:rotate-1' : 'opacity-60'}`}
            loading="lazy"
          />
        </div>
        <div className={`flex flex-col items-center text-center px-1 py-2 md:p-5 flex-grow justify-between ${!isAvailable ? 'opacity-50' : ''}`}>
          <div className="w-full text-left">
            <span className="text-[7px] md:text-[10px] uppercase tracking-[0.2em] text-brand-hotpink font-bold block mb-0.5 lg:mb-2 truncate">
              {product.category}
            </span>
            <h3 className={`font-display font-black text-[15px] leading-[1.1] lg:text-2xl text-brand-dark uppercase line-clamp-2 transition-colors ${isAvailable ? 'group-hover:text-brand-hotpink' : ''}`}>
              {product.name}
            </h3>
          </div>
          <div className="w-full text-left mt-1 lg:mt-3">
             <p className="font-sans font-black text-sm lg:text-xl text-brand-dark">
               ${product.basePrice.toFixed(2)}
             </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
