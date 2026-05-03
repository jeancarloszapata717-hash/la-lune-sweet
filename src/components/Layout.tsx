import { ReactNode } from 'react';
import Navbar from './Navbar';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-brand-dark border-t border-brand-cream/10 text-brand-cream pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex flex-col items-start relative inline-flex group mb-6 w-fit">
              <span className="font-display font-bold text-2xl tracking-widest text-brand-pink group-hover:text-brand-hotpink transition-colors">
                LA LUNE
              </span>
              <span className="font-sans font-bold text-[0.65rem] tracking-[0.3em] uppercase transition-colors text-brand-cream">
                Sweet Bites
              </span>
              <motion.img 
                src="/inconolune.png"
                alt="La Lune Moon"
                className="absolute -top-2 -right-8 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen object-contain"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </Link>
            <p className="text-sm text-brand-cream/60 max-w-sm font-medium leading-relaxed">
              Experiencias de repostería de autor, horneadas diariamente para aquellos que buscan lo extraordinario. 
              Un mordisco perfecto a la vez.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase mb-6 text-brand-pink">Enlaces</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><a href="/" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="/catalogo" className="hover:text-white transition-colors">Catálogo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase mb-6 text-brand-pink">Síguenos</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">TikTok</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pinterest</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-500 font-light">
          © {new Date().getFullYear()} La Lune Sweet Bites. Todos los derechos reservados.
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/something"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <MessageCircle size={24} className="md:w-7 md:h-7" />
      </motion.a>
    </div>
  );
}
