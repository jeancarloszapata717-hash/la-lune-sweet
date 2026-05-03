import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts, Product } from '../data/useProducts';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

type PackType = '1 BOMB' | 'PROMO DE 2';
type Flavor = { id: string, name: string, plusPrice: number };

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const product = products.find(p => p.id === id);
  
  // Standard product variant state
  const [selectedVariant, setSelectedVariant] = useState<any>(
    (product as any)?.variants && (product as any).variants.length > 0 ? (product as any).variants[0] : null
  );
  
  // Bombs custom options state
  const [packType, setPackType] = useState<PackType>('1 BOMB');
  const [selectedFlavors, setSelectedFlavors] = useState<(Flavor | null)[]>([null, null]);

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePackTypeChange = (type: PackType) => {
    setPackType(type);
    if (type === '1 BOMB') {
      setSelectedFlavors([selectedFlavors[0], null]);
      setQuantity(1); // Force back to 1 quantity logically matching prompt requirements
    }
  };

  const handleFlavorSelect = (index: number, flavor: Flavor) => {
    const newFlavors = [...selectedFlavors];
    newFlavors[index] = flavor;
    setSelectedFlavors(newFlavors);
  };

  // Auto-advance carousel if images exist
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [product]);

  // Derive current image and price based on selections
  const currentImage = product?.images && product.images.length > 0
    ? product.images[currentImageIndex]
    : (selectedVariant ? selectedVariant.image : product?.image);
  
  // Modifiers state
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});

  const handleModifierSelect = (modId: string, optionId: string) => {
    setSelectedModifiers(prev => ({ ...prev, [modId]: optionId }));
  };

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (product.hasPackOptions) {
      const basePrice = product.packPrices ? product.packPrices[packType] : (packType === 'PROMO DE 2' ? 10 : 6);
      let extras = 0;
      if (selectedFlavors[0]) extras += selectedFlavors[0].plusPrice;
      if (packType === 'PROMO DE 2' && selectedFlavors[1]) extras += selectedFlavors[1].plusPrice;
      return basePrice + extras;
    }
    
    let modsExtras = 0;
    if ((product as any).modifiers) {
      (product as any).modifiers.forEach((mod: any) => {
        const selectedOptId = selectedModifiers[mod.id];
        if (selectedOptId) {
          const opt = mod.options.find((o: any) => o.id === selectedOptId);
          if (opt && opt.plusPrice) modsExtras += opt.plusPrice;
        }
      });
    }

    return product.basePrice + (selectedVariant ? selectedVariant.plusPrice : 0) + modsExtras;
  }, [product, packType, selectedFlavors, selectedVariant, selectedModifiers]);

  const isAvailable = product?.status === 'active';

  const isReadyToAddToCart = useMemo(() => {
    if (!product || !isAvailable) return false;
    
    // Validate Required Modifiers
    if ((product as any).modifiers) {
      const missingRequired = (product as any).modifiers.some((mod: any) => mod.isRequired && !selectedModifiers[mod.id]);
      if (missingRequired) return false;
    }

    if (product.hasPackOptions) {
       if (packType === '1 BOMB') return !!selectedFlavors[0];
       if (packType === 'PROMO DE 2') return !!selectedFlavors[0] && !!selectedFlavors[1];
    }
    return true;
  }, [product, packType, selectedFlavors, selectedModifiers, isAvailable]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <h2 className="font-display font-black text-xl">Cargando producto...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="font-display font-black text-3xl mb-4">Producto no encontrado</h2>
          <Link to="/catalogo" className="text-brand-pink underline">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
      if (!isReadyToAddToCart || !product || !isAvailable) return;
      addToCart({
        product,
        quantity,
        unitPrice: currentPrice,
        packType: product.hasPackOptions ? packType : undefined,
        variant: selectedVariant?.name,
        flavors: product.hasPackOptions ? selectedFlavors.filter(Boolean).map(f => f?.name as string) : undefined
      });
      showToast('¡Añadido al carrito!', 'success');
  };

  return (
    <div className="pt-20 md:pt-24 pb-16 md:pb-20 min-h-screen bg-brand-cream border-t border-brand-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <Link to="/catalogo" className="inline-flex items-center space-x-2 text-brand-dark/60 hover:text-brand-hotpink mb-4 md:mb-6 transition-colors">
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          <span className="font-sans font-bold text-[11px] md:text-xs tracking-[0.2em] uppercase">Volver al catálogo</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16 items-start">
          
          {/* Images Section */}
          <div className="relative aspect-square bg-brand-dark/5 overflow-hidden rounded-[2rem] border-2 border-brand-dark/10 shadow-[8px_8px_0px_0px_rgba(26,29,46,0.1)] group">
             <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImage}
                  src={currentImage} 
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`w-full h-full object-cover object-center absolute inset-0 ${!isAvailable ? 'opacity-50' : ''}`}
                />
             </AnimatePresence>

             {!isAvailable && (
                <div className="absolute inset-0 z-20 bg-brand-dark/10 backdrop-blur-[1px] flex items-center justify-center p-4">
                  <span className="bg-white text-red-600 border-4 border-red-600 font-display font-black text-3xl md:text-5xl uppercase tracking-tighter px-10 py-5 rounded-2xl shadow-2xl rotate-[-5deg]">
                    {product.status === 'soldout' ? 'Agotado' : 'No Disponible'}
                  </span>
                </div>
             )}
             
             {/* Carousel Controls */}
             {product.images && product.images.length > 1 && isAvailable && (
               <>
                 <button 
                   onClick={(e) => { e.preventDefault(); setCurrentImageIndex((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1)); }}
                   className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border-2 border-brand-dark/10 text-brand-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-dark hover:text-white"
                 >
                   <ChevronLeft size={20} />
                 </button>
                 <button 
                   onClick={(e) => { e.preventDefault(); setCurrentImageIndex((prev) => (prev + 1) % product.images!.length); }}
                   className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border-2 border-brand-dark/10 text-brand-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-dark hover:text-white"
                 >
                   <ChevronRight size={20} />
                 </button>
                 {/* Carousel Indicators */}
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                   {product.images.map((_, i) => (
                     <button
                       key={i}
                       onClick={() => setCurrentImageIndex(i)}
                       className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === i ? 'bg-brand-dark w-4' : 'bg-brand-dark/30 hover:bg-brand-dark/60'}`}
                     />
                   ))}
                 </div>
               </>
             )}
          </div>

          {/* Details Section */}
          <div className={`flex flex-col py-0 md:py-4 ${!isAvailable ? 'opacity-60' : ''}`}>
            <span className="text-brand-hotpink text-[11px] sm:text-xs tracking-[0.3em] font-bold uppercase mb-1 md:mb-2 block">
              {product.category}
            </span>
            <h1 className="font-display font-black text-[32px] sm:text-5xl md:text-6xl text-brand-dark mb-2 sm:mb-4 uppercase leading-none">{product.name}</h1>
            <div className="mb-4 sm:mb-8">
              <p className="font-sans font-black text-[22px] sm:text-3xl text-brand-dark">{formatPrice(currentPrice).base}</p>
              <p className="font-sans font-bold text-xs sm:text-sm text-brand-hotpink mt-1">{formatPrice(currentPrice).ves}</p>
            </div>
            
            <p className="font-sans text-brand-dark/80 font-medium leading-relaxed mb-6 sm:mb-10 text-[13px] sm:text-lg">
              {product.longDesc}
            </p>

            <div className="w-full h-px bg-brand-dark/10 mb-6 sm:mb-10"></div>

            {/* Custom Pack & Flavor Selector for BOMBS */}
            {product.hasPackOptions && isAvailable ? (
              <div className="mb-6 sm:mb-10">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                   <button 
                     onClick={() => handlePackTypeChange('1 BOMB')}
                     className={`py-3 sm:py-4 px-4 text-[13px] sm:text-sm font-bold uppercase tracking-wider transition-all border-2 rounded-xl md:rounded-2xl sm:rounded-[24px] flex flex-col items-center justify-center ${
                       packType === '1 BOMB' ? 'border-brand-dark bg-brand-dark text-brand-cream shadow-[4px_4px_0px_0px_rgba(26,29,46,1)]' : 'border-brand-dark/20 text-brand-dark hover:border-brand-dark'
                     }`}
                   >
                     1 BOMB
                   </button>
                   <button 
                     onClick={() => handlePackTypeChange('PROMO DE 2')}
                     className={`py-3 sm:py-4 px-4 text-[13px] sm:text-sm font-bold uppercase tracking-wider transition-all border-2 rounded-xl md:rounded-2xl sm:rounded-[24px] flex flex-col items-center justify-center ${
                       packType === 'PROMO DE 2' ? 'border-brand-dark bg-brand-dark text-brand-cream shadow-[4px_4px_0px_0px_rgba(26,29,46,1)]' : 'border-brand-dark/20 text-brand-dark hover:border-brand-dark'
                     }`}
                   >
                     PROMO DE 2
                   </button>
                </div>

                {/* Grid Sabor 1 */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="font-display font-black italic text-base md:text-lg sm:text-xl text-brand-dark/80 mb-2 md:mb-3 sm:mb-4">
                    {packType === '1 BOMB' ? 'Elige tu sabor' : 'Sabor #1'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {product.flavors?.map((f: any) => {
                      const isSelected = selectedFlavors[0]?.id === f.id;
                      return (
                        <button
                          key={`f1-${f.id}`}
                          onClick={() => handleFlavorSelect(0, f)}
                          className={`relative p-2 md:p-3 sm:p-4 border-2 rounded-xl md:rounded-2xl sm:rounded-[24px] flex flex-col justify-center items-center text-center transition-all ${
                            isSelected 
                            ? 'bg-brand-dark border-brand-dark text-white shadow-[0_4px_14px_0_rgba(26,29,46,0.39)]' 
                            : 'bg-transparent border-brand-dark/20 text-brand-dark hover:border-brand-dark'
                          }`}
                        >
                          <span className="font-sans font-bold text-[10px] md:text-[11px] sm:text-xs tracking-widest uppercase">{f.name}</span>
                          {f.plusPrice > 0 && (
                            <span className={`text-[9px] mt-0.5 md:mt-1 font-medium ${isSelected ? 'text-brand-cream/80' : 'text-brand-dark/60'}`}>
                              +${f.plusPrice.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Sabor 2 (Only if Promo de 2) */}
                {packType === 'PROMO DE 2' && (
                  <div className="mb-6 sm:mb-8">
                    <div className="w-full h-px bg-brand-dark/10 mb-4 md:mb-6 sm:mb-8"></div>
                    <h3 className="font-display font-black italic text-base md:text-lg sm:text-xl text-brand-dark/80 mb-2 md:mb-3 sm:mb-4">Sabor #2</h3>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {product.flavors?.map((f: any) => {
                        const isSelected = selectedFlavors[1]?.id === f.id;
                        return (
                          <button
                            key={`f2-${f.id}`}
                            onClick={() => handleFlavorSelect(1, f)}
                            className={`relative p-2 md:p-3 sm:p-4 border-2 rounded-xl md:rounded-2xl sm:rounded-[24px] flex flex-col justify-center items-center text-center transition-all ${
                              isSelected 
                              ? 'bg-brand-dark border-brand-dark text-white shadow-[0_4px_14px_0_rgba(26,29,46,0.39)]' 
                              : 'bg-transparent border-brand-dark/20 text-brand-dark hover:border-brand-dark'
                            }`}
                          >
                            <span className="font-sans font-bold text-[10px] md:text-[11px] sm:text-xs tracking-widest uppercase">{f.name}</span>
                            {f.plusPrice > 0 && (
                              <span className={`text-[9px] mt-0.5 md:mt-1 font-medium ${isSelected ? 'text-brand-cream/80' : 'text-brand-dark/60'}`}>
                                +${f.plusPrice.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (product as any).variants && (product as any).variants.length > 0 ? (
              /* Standard Variants Selector */
              <div className="mb-6 sm:mb-10">
                <h3 className="font-sans font-bold text-[10px] tracking-[0.2em] uppercase text-brand-dark mb-4">Selecciona el Sabor</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {(product as any).variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`py-3 sm:py-4 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-2 rounded-2xl sm:rounded-full ${
                        selectedVariant?.id === v.id 
                        ? 'border-brand-dark bg-brand-dark text-brand-cream shadow-[4px_4px_0px_0px_rgba(213,63,140,1)]' 
                        : 'border-brand-dark/20 text-brand-dark hover:border-brand-dark'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Modifiers UI */}
            {(product as any).modifiers && (product as any).modifiers.map((mod: any) => (
              <div key={mod.id} className="mb-6 sm:mb-10">
                <h3 className="font-sans font-bold text-[10px] tracking-[0.2em] uppercase text-brand-dark mb-4">
                  {mod.name} {mod.isRequired && <span className="text-brand-hotpink ml-1">*Requerido</span>}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {mod.options.map((opt: any) => {
                    const isSelected = selectedModifiers[mod.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleModifierSelect(mod.id, opt.id)}
                        className={`relative py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all border-2 rounded-xl flex flex-col justify-center items-center text-center ${
                          isSelected 
                          ? 'border-brand-dark bg-brand-dark text-brand-cream shadow-[4px_4px_0px_0px_rgba(213,63,140,1)]' 
                          : 'border-brand-dark/20 text-brand-dark hover:border-brand-dark'
                        }`}
                      >
                        {opt.name}
                        {opt.plusPrice > 0 && <span className={`text-[9px] mt-1 ${isSelected ? 'text-brand-cream/80' : 'text-brand-dark/60'}`}>+${opt.plusPrice.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-2 mt-4">
              {/* Only show quantity selector if not 1 BOMB mode AND is available */}
              {isAvailable && (!product.hasPackOptions || packType === 'PROMO DE 2') && (
                <div className="flex items-center border-2 border-brand-dark rounded-full overflow-hidden h-12 md:h-14 sm:h-16 lg:h-20 w-full sm:w-32 lg:w-40 bg-white shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 sm:w-12 h-full flex items-center justify-center text-brand-dark hover:bg-brand-dark/5 hover:text-brand-hotpink transition-colors"
                  >
                    <Minus size={18} strokeWidth={2.5} className="md:w-[18px] md:h-[18px] w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-sans !font-black text-base md:text-lg sm:text-xl !text-black">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 sm:w-12 h-full flex items-center justify-center text-brand-dark hover:bg-brand-dark/5 hover:text-brand-hotpink transition-colors"
                  >
                    <Plus size={18} strokeWidth={2.5} className="md:w-[18px] md:h-[18px] w-4 h-4" />
                  </button>
                </div>
              )}

              <motion.button 
                whileHover={isReadyToAddToCart ? { scale: 1.02 } : { scale: 1 }}
                whileTap={isReadyToAddToCart ? { scale: 0.98 } : { scale: 1 }}
                onClick={handleAddToCart}
                disabled={!isReadyToAddToCart}
                className={`flex-1 rounded-full text-white h-12 md:h-14 sm:h-16 lg:h-20 flex items-center justify-center space-x-2 sm:space-x-3 border-2 border-transparent transition-all ${
                  isReadyToAddToCart 
                  ? 'bg-brand-hotpink hover:bg-brand-dark shadow-[0_4px_14px_0_rgba(213,63,140,0.39)] hover:shadow-[0_6px_20px_rgba(213,63,140,0.23)]'
                  : 'bg-brand-dark/30 cursor-not-allowed opacity-80'
                }`}
              >
                <ShoppingBag size={24} strokeWidth={2.5} className="md:w-6 md:h-6 w-5 h-5" />
                <span className="font-sans font-bold text-xs md:text-base tracking-[0.2em] uppercase">
                  {!isAvailable ? 'Agotado Temporalmente' : (product.hasPackOptions && !isReadyToAddToCart ? 'Selecciona Sabores' : 'Añadir al Carrito')}
                </span>
              </motion.button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
