import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, User, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHomePage = location.pathname === '/';
  const hasDarkBackground = isScrolled || isHomePage;
  const textColorClass = hasDarkBackground ? 'text-brand-cream' : 'text-brand-dark';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: 'Nuestra Historia', path: '#about' }, 
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-brand-dark/95 backdrop-blur-md shadow-lg py-4 md:py-5 border-b border-brand-pink/10' : 'bg-transparent py-6 md:py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center group relative z-50">
            <span className="font-display font-bold text-xl md:text-2xl tracking-widest text-brand-pink group-hover:text-brand-hotpink transition-colors">
              LA LUNE
            </span>
            <span className={`font-sans font-bold text-[0.55rem] md:text-[0.65rem] tracking-[0.3em] uppercase transition-colors ${textColorClass}`}>
              Sweet Bites
            </span>
            {/* Moon Icon */}
            <motion.img 
              src="/inconolune.png"
              alt="La Lune Moon"
              className="absolute -top-1 -right-6 md:-top-2 md:-right-8 w-5 h-5 md:w-6 md:h-6 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen object-contain"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-sans font-bold text-xs tracking-[0.2em] uppercase transition-colors hover:text-brand-hotpink
                  ${location.pathname === link.path ? 'text-brand-hotpink' : textColorClass}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons Context */}
          <div className="flex items-center space-x-4 md:space-x-6 relative z-50">
            
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center space-x-1.5 md:space-x-2 transition-colors hover:text-brand-hotpink ${textColorClass}`}
                >
                  <User size={18} strokeWidth={2} className="md:w-5 md:h-5" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] md:text-xs font-sans font-bold tracking-wide leading-none pt-0.5">Hola, {user.nombre}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-4 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-brand-dark/5 overflow-hidden py-2"
                    >
                      <button onClick={() => { setUserMenuOpen(false); /* navigate to profile */ }} className="w-full text-left px-5 py-3 text-sm font-bold text-brand-dark hover:bg-brand-lavender/20 hover:text-brand-hotpink transition-colors">
                        Mi perfil
                      </button>

                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block w-full text-left px-5 py-3 text-sm font-bold text-brand-dark hover:bg-brand-lavender/20 hover:text-brand-hotpink transition-colors">
                          Panel de Admin
                        </Link>
                      )}
                      <div className="h-px bg-brand-dark/5 my-1" />
                      <button 
                        onClick={() => { 
                          logout(); 
                          setUserMenuOpen(false); 
                        }} 
                        className="w-full text-left px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/checkout" className={`transition-colors relative hover:text-brand-hotpink ${textColorClass}`}>
                <User size={20} strokeWidth={2} />
              </Link>
            )}

            <Link to="/carrito" className={`transition-colors relative hover:text-brand-hotpink ${textColorClass}`}>
              <ShoppingCart size={20} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-hotpink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            <button 
              className={`md:hidden ${textColorClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-brand-dark flex flex-col items-center justify-center space-y-8"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={handleNavClick}
                className="font-display font-black text-4xl text-brand-cream hover:text-brand-hotpink transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex space-x-6 mt-8">
               <button className="text-brand-cream">
                  <User size={28} strokeWidth={2} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
