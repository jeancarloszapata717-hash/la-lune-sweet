import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { LOCATIONS } from '../data/mockData';
import { useProducts } from '../data/useProducts';
import ProductCard from '../components/ProductCard';
import SugarParticles from '../components/SugarParticles';
import NoveltyCarousel from '../components/NoveltyCarousel';
import { ArrowRight, MapPin, Play } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { products, loading } = useProducts();
  
  // Show up to 4 recent products (not drafts). Soldout/Inactive handled visually.
  const recentPurchases = products
    .filter(p => p.status !== 'draft')
    .slice(0, 4);

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.video 
            src="/pavlovarota.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover object-center opacity-50 mix-blend-luminosity"
            initial={{ scale: 1.03 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col items-center justify-center text-center mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl lg:text-[8rem] leading-[1.1] md:leading-[0.85] text-brand-cream mb-4 md:mb-6 tracking-tight lg:tracking-tighter uppercase break-words">
              Tremendamente<br />
              <span className="text-brand-pink">Delicioso.</span>
            </h1>
            <p className="font-sans font-bold text-brand-cream/90 max-w-2xl mx-auto mb-6 md:mb-10 tracking-widest md:tracking-[0.2em] uppercase text-[10px] md:text-base px-2 md:px-4">
              Los mejores postres que vas a probar en tu vida.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link 
                to="/catalogo" 
                className="bg-brand-cream text-brand-dark px-10 py-5 sm:px-12 sm:py-6 font-sans font-bold text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-brand-hotpink hover:text-white transition-colors inline-flex items-center space-x-3 rounded-full shadow-[0_0_40px_rgba(213,63,140,0.3)] hover:shadow-[0_0_60px_rgba(213,63,140,0.6)]"
              >
                <span>Ir al menú</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* NOVEDADES / BILLBOARD SECTION */}
      <section className="pt-20 md:pt-24 pb-10 md:pb-12 bg-brand-cream text-brand-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-6 md:mb-12 text-center md:text-left">
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-brand-dark uppercase tracking-tight">Novedades</h2>
          </div>
          
          <NoveltyCarousel />
        </div>
      </section>

      {/* CAROUSEL / HIGHLIGHTS SECTION */}
      <section className="py-10 md:py-24 bg-brand-cream text-brand-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col justify-between items-start mb-6 md:mb-16 border-b border-brand-dark/10 pb-4 md:pb-6 md:flex-row md:items-end">
            <div>
              <span className="text-brand-hotpink font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-1 md:mb-2 block">Tus Favoritos</span>
              <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-brand-dark uppercase tracking-tight">Últimas Compras</h2>
            </div>
            <Link to="/catalogo" className="group flex items-center space-x-2 text-brand-dark font-bold hover:text-brand-hotpink transition-colors mt-2 md:mt-0 font-sans text-[10px] md:text-xs uppercase tracking-widest">
              <span>Ver Catálogo</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform md:w-4 md:h-4" />
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-8 overflow-x-auto pb-4 md:pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 md:mx-0 md:px-0">
            {recentPurchases.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-[50vw] sm:w-[35vw] md:w-auto snap-center shrink-0"
              >
                <div className="scale-95 origin-top md:scale-100">
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US - STORYTELLING */}
      <section id="about" className="py-20 md:py-32 bg-brand-dark text-brand-cream relative overflow-hidden">
         {/* Decorative circle */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-brand-pink/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square overflow-hidden group shadow-2xl shadow-brand-pink/10"
          >
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745a872?auto=format&fit=crop&q=80&w=1000" 
              alt="Nuestra fundadora horneando" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-transparent transition-colors flex items-center justify-center cursor-pointer">
               <div className="w-24 h-24 bg-brand-hotpink rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(213,63,140,0.5)] transition-transform group-hover:scale-110">
                 <Play size={32} className="ml-2" />
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-brand-pink font-bold text-xs tracking-[0.3em] uppercase mb-4 block">El Origen</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl mb-8 leading-[1.1] md:leading-[1] uppercase tracking-tight">La Magia Detrás <br className="hidden md:block" /> Del Bocado</h2>
            <div className="space-y-6 font-sans text-brand-cream/70 text-base md:text-lg leading-relaxed">
              <p>
                Todo comenzó en una pequeña cocina con un gran sueño: crear postres que no solo fueran deliciosos, sino que evocaran emociones. Cada brookie, cada galleta, lleva impresa una parte de nuestra alma.
              </p>
              <p>
                Creemos en los ingredientes premium, en el proceso artesanal y en esa pizca de polvo de estrellas que hace que nuestros dulces sean verdaderamente excepcionales. No hacemos simplemente postres; creamos momentos dulces.
              </p>
            </div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_Walt_Disney.svg" alt="Firma" className="h-12 mt-10 opacity-50 invert" />
          </motion.div>
        </div>
      </section>

      {/* TUTORIAL SECTION */}
      <section className="py-20 md:py-32 bg-brand-cream text-brand-dark relative overflow-hidden border-t border-brand-dark/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <span className="text-brand-hotpink font-bold text-xs tracking-[0.3em] uppercase mb-4 block">Tutorial Rápido</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl mb-8 leading-[1.1] md:leading-[1] uppercase tracking-tight">Cómo realizar <br className="hidden md:block" /> tu pedido</h2>
            <div className="space-y-6 font-sans text-brand-dark/70 text-base md:text-lg leading-relaxed">
              <p>
                Pedir en La Lune Sweet es una experiencia tan fluida como el relleno de nuestras brookies. Diseñamos un sistema pensado en tu comodidad.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="font-display font-black text-brand-hotpink mr-3 text-xl">1.</span>
                  <span>Explora nuestro catálogo premium y arma tu carrito de compras con tus favoritos.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-display font-black text-brand-hotpink mr-3 text-xl">2.</span>
                  <span>Completa tus datos en el Checkout rápido de 4 pasos (puedes crear cuenta para no volver a escribirlos).</span>
                </li>
                <li className="flex items-start">
                  <span className="font-display font-black text-brand-hotpink mr-3 text-xl">3.</span>
                  <span>Tu pedido se conectará instantáneamente a nuestro WhatsApp con un ticket estructurado listo para procesarse.</span>
                </li>
              </ul>
            </div>
            <Link to="/catalogo" className="mt-8 inline-block bg-brand-dark text-white px-8 py-4 font-bold text-xs uppercase tracking-widest hover:bg-brand-hotpink transition-colors rounded-full shadow-lg">
              Empezar Pedido
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/3] overflow-hidden group shadow-xl rounded-3xl order-1 md:order-2"
          >
            <img 
              src="https://images.unsplash.com/photo-1555507036-ab1d4075c6f1?auto=format&fit=crop&q=80&w=1000" 
              alt="Realizando pedido en smartphone" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors flex items-center justify-center cursor-pointer">
               <div className="w-20 h-20 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-brand-hotpink shadow-lg transition-transform group-hover:scale-110">
                 <Play size={28} className="ml-1" />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHERE TO FIND US */}
      <section className="py-16 md:py-32 bg-brand-cream border-t border-brand-dark/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-brand-hotpink font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 block">Aliados Estratégicos</span>
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl mb-10 md:mb-16 text-brand-dark uppercase tracking-tight">Puntos de Venta</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            {LOCATIONS.map((loc, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border-2 border-brand-dark/10 hover:border-brand-dark hover:shadow-[8px_8px_0px_0px_rgba(26,29,46,1)] transition-all duration-300 rounded-[20px] overflow-hidden flex flex-col text-left group"
              >
                <div className="h-48 md:h-64 w-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors z-10" />
                  <img src={loc.image} alt={loc.city} className="w-full h-full object-cover origin-center group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full z-20 flex items-center space-x-2 text-brand-dark">
                    <MapPin size={14} className="text-brand-hotpink" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{loc.city.split(' ')[0]}</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-display font-black uppercase text-2xl mb-2 text-brand-dark">{loc.city}</h3>
                  <p className="font-sans font-medium text-brand-dark/80 mb-6 flex-1">{loc.address}</p>
                  <div className="pt-6 border-t border-brand-dark/10 flex justify-between items-center">
                     <span className="font-bold text-brand-dark/60 text-xs tracking-widest">{loc.phone}</span>
                     <button className="text-brand-hotpink font-bold text-[10px] uppercase tracking-widest hover:text-brand-dark transition-colors flex items-center space-x-1">
                       <span>Ver Mapa</span>
                       <ArrowRight size={12} />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
