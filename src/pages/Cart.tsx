import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="pt-24 md:pt-32 pb-24 min-h-screen bg-brand-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <Link to="/catalogo" className="inline-flex items-center space-x-2 text-brand-dark/60 hover:text-brand-hotpink mb-4 md:mb-8 transition-colors">
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          <span className="font-sans font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase">Continuar comprando</span>
        </Link>

        <h1 className="font-display font-black text-3xl md:text-5xl text-brand-dark mb-6 md:mb-10 uppercase tracking-tight">Tu Carrito</h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-row gap-3 md:gap-4 bg-white p-3 sm:p-4 md:p-6 rounded-[20px] md:rounded-[2rem] border-2 border-brand-dark/5 relative shadow-[0_4px_14px_0_rgba(26,29,46,0.03)]">
                  
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-brand-cream/50 rounded-xl md:rounded-2xl overflow-hidden shrink-0">
                    <img src={item.product?.image || item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 md:py-1">
                    <div>
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="font-display font-black text-sm sm:text-base md:text-xl text-brand-dark uppercase leading-tight pr-4">{item.product?.name}</h3>
                        <button onClick={() => removeFromCart(item.id)} className="text-brand-dark/40 hover:text-red-500 transition-colors p-1 absolute right-2 top-2 md:relative md:right-0 md:top-0">
                          <Trash2 size={16} className="md:w-5 md:h-5" />
                        </button>
                      </div>
                      
                      {item.packType && (
                        <p className="text-[10px] sm:text-[11px] md:text-sm font-bold text-brand-hotpink uppercase tracking-wider mb-0.5">{item.packType}</p>
                      )}
                      
                      {item.flavors && item.flavors.length > 0 && (
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-brand-dark/60 font-medium uppercase tracking-wide line-clamp-1">
                          Sabores: {item.flavors.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 md:mt-3">
                       {/* Qty Control */}
                        <div className="flex items-center border-2 border-brand-dark rounded-full h-7 sm:h-8 md:h-10 w-20 sm:w-20 md:w-24 bg-white overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 sm:w-6 md:w-8 h-full flex items-center justify-center !text-black hover:text-brand-hotpink transition-colors">
                            <Minus size={12} strokeWidth={4} className="md:w-[14px] md:h-[14px]" />
                          </button>
                          <span className="flex-1 text-center font-sans !font-black text-xs sm:text-sm md:text-base !text-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 sm:w-6 md:w-8 h-full flex items-center justify-center !text-black hover:text-brand-hotpink transition-colors">
                            <Plus size={12} strokeWidth={4} className="md:w-[14px] md:h-[14px]" />
                          </button>
                        </div>
                      
                      <div className="text-right">
                        <span className="font-sans font-black text-sm sm:text-base md:text-lg text-brand-dark pl-2">{formatPrice(item.unitPrice * item.quantity).base}</span>
                        <span className="block font-sans font-bold text-[9px] sm:text-[10px] text-brand-hotpink pl-2">{formatPrice(item.unitPrice * item.quantity).ves}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-brand-dark text-brand-cream p-6 md:p-8 rounded-[2rem] md:sticky md:top-32 shadow-[8px_8px_0px_0px_rgba(213,63,140,1)]">
                <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-widest mb-4 md:mb-6">Resumen</h2>
                
                <div className="flex justify-between items-center mb-4 text-brand-cream/80 text-xs md:text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatPrice(cartTotal).base}</span>
                </div>
                
                <div className="h-px w-full bg-brand-cream/20 my-4 md:my-6"></div>
                
                <div className="flex justify-between items-end mb-6 md:mb-8">
                  <span className="font-bold text-xs md:text-sm tracking-widest uppercase">Total</span>
                  <div className="text-right">
                    <span className="font-bold text-xl md:text-2xl text-brand-hotpink block">{formatPrice(cartTotal).base}</span>
                    <span className="font-bold text-xs md:text-sm text-brand-cream/80 block">{formatPrice(cartTotal).ves}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-brand-hotpink text-white rounded-full py-3 md:py-4 px-6 font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-brand-dark transition-colors"
                  >
                    Ir al Checkout
                  </motion.button>
                </Link>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-brand-dark/10">
            <ShoppingCart size={48} className="mx-auto text-brand-dark/20 mb-6" />
            <h2 className="font-display font-black text-2xl mb-4 text-brand-dark">Tu carrito está vacío</h2>
            <p className="text-brand-dark/60 mb-8 max-w-sm mx-auto">Parece que aún no has añadido ninguna delicia a tu pedido.</p>
            <Link to="/catalogo" className="inline-block bg-brand-dark text-brand-cream px-8 py-4 rounded-full font-bold text-sm tracking-[0.2em] uppercase hover:bg-brand-hotpink transition-colors">
              Explorar el menú
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
