import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, UserCircle, MapPin, CreditCard, Lock, Mail, Store, Bike, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';


import { useSettings } from '../data/useSettings';
import { useProducts } from '../data/useProducts';
import { useToast } from '../context/ToastContext';

export default function Checkout() {
  const { user, login, register } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const { cart, cartTotal, clearCart } = useCart();
  const { deliveryZones, storeSettings, paymentMethods } = useSettings();
  const { updateStockAndLog } = useProducts();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Checkout States
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  
  // Base checkout subtotal mocked (Cart context ideally handles this)
  const orderSubtotal = cartTotal;
  
  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'pickup') return 0;
    const zone = deliveryZones.find(z => z.id === selectedZoneId);
    return zone ? zone.price : 0;
  }, [deliveryMethod, selectedZoneId, deliveryZones]);
  
  const orderTotal = orderSubtotal + deliveryFee;

  // Pre-fill delivery zone based on user's location if it matches partially
  useEffect(() => {
    if (user && user.ubicacionCorta && !selectedZoneId && deliveryZones.length > 0) {
      const match = deliveryZones.find(z => user.ubicacionCorta.toLowerCase().includes(z.name.toLowerCase()));
      if (match) setSelectedZoneId(match.id);
    }
  }, [user, selectedZoneId, deliveryZones]);

  // Dummy State for Form Simulation
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', cedula: '', ubicacionCorta: '', telefono: '', fechaNacimiento: '', email: '', password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };



  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'register') {
        await register(formData as any);
      } else {
        if (!formData.email || !formData.password) {
           setAuthError('Por favor ingresa correo y contraseña.');
           return;
        }
        await login(formData.email, formData.password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cashNote, setCashNote] = useState('');
  
  // Set default payment method once loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      const firstEnabled = paymentMethods.find(p => p.enabled);
      if (firstEnabled) setPaymentMethod(firstEnabled.id);
    }
  }, [paymentMethods, paymentMethod]);

  const submissionLock = React.useRef(false);

  const handleCheckoutSubmit = async () => {
    if (isSubmitting || submissionLock.current) return;
    
    // Validaciones previas
    if (deliveryMethod === 'delivery' && !selectedZoneId) {
      showToast("Por favor selecciona una zona de delivery.", "warning");
      return;
    }
    if (!paymentMethod) {
      showToast("Por favor selecciona un método de pago.", "warning");
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    
    try {
      const zoneName = deliveryMethod === 'delivery' ? deliveryZones.find(z => z.id === selectedZoneId)?.name || '' : 'Pick Up (Retiro en tienda)';
      const paymentName = paymentMethods.find(p => p.id === paymentMethod)?.name || 'Sin seleccionar';
      const itemsText = cart.map(item => `${item.product.name} x ${item.quantity}`).join(', ');

      // Log sale to Supabase
      const { data: saleData, error: saleError } = await supabase
        .from('registro_ventas')
        .insert([{
          cliente_id: user?.uid,
          cliente_nombre: `${user?.nombre} ${user?.apellido}`,
          total: orderTotal,
          detalle_pedido: `Items: ${itemsText} | Delivery: ${zoneName} | Pago: ${paymentName}`
        }])
        .select();

      if (saleError) throw saleError;

      const orderID = saleData[0].id.slice(0, 8).toUpperCase(); // Short version of UUID for WhatsApp

      // 5. Finalizar proceso (WhatsApp y UI)
      const message = `Pedido: #${orderID} > Contenido: [${itemsText}] > Delivery: [${formatPrice(deliveryFee).base}] > Total: [${formatPrice(orderTotal).base}] > Método de Pago: [${paymentName}] > --- Datos del Cliente --- > Nombre: [${user?.nombre} ${user?.apellido}] > Tlf: [${user?.telefono}] > Dirección: [${deliveryMethod === 'delivery' ? user?.ubicacionCorta : 'Retiro en Tienda'}] > Zona: [${deliveryMethod === 'delivery' ? zoneName : 'Pick Up'}]`;

      clearCart();
      showToast("¡Pedido realizado con éxito!", "success");

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${encodedMessage}`;
      
      setTimeout(() => {
        window.location.href = whatsappUrl;
        setTimeout(() => {
          navigate("/");
          submissionLock.current = false;
        }, 1500);
      }, 1000);

    } catch (error: any) {
      submissionLock.current = false;
      setIsSubmitting(false);
      console.error("Error crítico en checkout:", error);
      showToast(`Error: ${error.message || 'No se pudo completar el pedido'}`, "error");
    }
  };


  if (!user) {
    return (
      <div className="pt-24 md:pt-32 pb-24 min-h-screen bg-brand-cream border-t border-brand-dark/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Link to="/carrito" className="inline-flex items-center space-x-2 text-brand-dark/60 hover:text-brand-hotpink mb-8 transition-colors">
            <ArrowLeft size={16} />
            <span className="font-sans font-bold text-xs tracking-[0.2em] uppercase">Volver al carrito</span>
          </Link>

          <div className="bg-white rounded-[2rem] border-2 border-brand-dark/10 shadow-[6px_6px_0px_0px_rgba(26,29,46,0.05)] overflow-hidden">
            <div className="flex border-b-2 border-brand-dark/10 relative">
              {/* Tab Selector */}
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-4 md:py-6 font-display font-black text-xl md:text-2xl uppercase tracking-widest transition-colors ${authMode === 'login' ? 'text-brand-hotpink' : 'text-brand-dark/40 hover:text-brand-dark/70'}`}
              >
                Inicia Sesión
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-4 md:py-6 font-display font-black text-xl md:text-2xl uppercase tracking-widest transition-colors ${authMode === 'register' ? 'text-brand-hotpink' : 'text-brand-dark/40 hover:text-brand-dark/70'}`}
              >
                Regístrate
              </button>
              {/* Active Underline */}
              <motion.div 
                className="absolute bottom-0 h-1 bg-brand-hotpink" 
                initial={false} 
                animate={{ left: authMode === 'login' ? '0%' : '50%', width: '50%' }} 
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            <div className="p-6 md:p-12">
              <p className="text-brand-dark/80 font-sans text-xs md:text-sm font-medium mb-6 md:mb-8 text-center max-w-md mx-auto">
                {authMode === 'login' 
                  ? 'Bienvenido de vuelta. Identifícate para continuar con tu pedido súper rápido.' 
                  : 'Crea tu cuenta de La Lune una sola vez y nunca más repitas tus datos. Tú te enfocas en el antojo, nosotros del resto.'}
              </p>

              <form onSubmit={handleAuthSubmit} className="space-y-6 max-w-2xl mx-auto">
                <AnimatePresence mode="popLayout">
                  {authMode === 'register' && (
                    <motion.div 
                      key="register-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Nombre</label>
                          <input required type="text" name="nombre" onChange={handleInputChange} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl px-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark placeholder:text-brand-dark/40" placeholder="Escribe tu nombre" />
                        </div>
                        <div>
                          <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Apellido</label>
                          <input required type="text" name="apellido" onChange={handleInputChange} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl px-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark placeholder:text-brand-dark/40" placeholder="Escribe tu apellido" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Cédula</label>
                          <input required type="text" name="cedula" onChange={handleInputChange} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl px-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark placeholder:text-brand-dark/40" placeholder="V- / E-" />
                        </div>
                        <div>
                          <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Fecha de Nacimiento</label>
                          <input required type="date" name="fechaNacimiento" onChange={handleInputChange} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl px-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark" />
                        </div>
                      </div>

                      <div>
                        <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Ubicación Corta (Sector, Zona)</label>
                        <input 
                          required 
                          type="text" 
                          name="ubicacionCorta" 
                          list="zonas-list"
                          onChange={handleInputChange} 
                          className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl px-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark placeholder:text-brand-dark/40" 
                          placeholder="Busca o escribe tu zona..." 
                        />
                        <datalist id="zonas-list">
                          {deliveryZones.map(z => (
                            <option key={z.id} value={z.name} />
                          ))}
                        </datalist>
                      </div>
                      
                      <div>
                        <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Teléfono</label>
                        <input required type="tel" name="telefono" onChange={handleInputChange} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl px-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark placeholder:text-brand-dark/40" placeholder="+58 000 000 0000" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Correo Electrónico</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/80" />
                    <input required type="email" name="email" onChange={handleInputChange} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark placeholder:text-brand-dark/50" placeholder="tu@email.com" />
                  </div>
                </div>

                <div>
                  <label className="block font-sans font-bold text-[10px] uppercase tracking-widest text-brand-dark/80 mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/80" />
                    <input required type="password" name="password" onChange={handleInputChange} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-brand-hotpink transition-colors font-medium text-brand-dark placeholder:text-brand-dark/50" placeholder="••••••••" />
                  </div>
                </div>
                
                {authError && (
                  <div className="text-red-500 font-bold text-xs text-center">
                    {authError}
                  </div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full mt-4 bg-brand-hotpink text-white rounded-xl py-4 font-bold text-sm tracking-[0.2em] uppercase hover:bg-brand-dark hover:text-brand-cream transition-colors shadow-[0_4px_14px_0_rgba(213,63,140,0.39)]"
                >
                  {authMode === 'login' ? 'Entrar y Continuar' : 'Crear Cuenta y Continuar'}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN CHECKOUT VIEW
  return (
    <div className="pt-24 md:pt-32 pb-24 min-h-screen bg-brand-cream border-t border-brand-dark/10">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        
        <Link to="/carrito" className="inline-flex items-center space-x-2 text-brand-dark/60 hover:text-brand-hotpink mb-6 md:mb-8 transition-colors">
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          <span className="font-sans font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase">Volver al carrito</span>
        </Link>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
          <h1 className="font-display font-black text-3xl md:text-5xl text-brand-dark uppercase tracking-tight">Checkout</h1>
          
          <div className="flex items-center space-x-3 bg-white px-3 md:px-4 py-2 rounded-full border-2 border-brand-dark/10 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-brand-lavender text-brand-dark flex items-center justify-center font-bold">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-brand-dark/50 font-bold leading-none">Conectado como</span>
              <span className="text-sm font-bold text-brand-dark leading-snug">{user?.nombre || ''} {user?.apellido || ''}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
          <div className="lg:col-span-3 space-y-4 md:space-y-8">
            {/* Delivery/Pickup Selector */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] border-2 border-brand-dark/10 shadow-[4px_4px_0px_0px_rgba(26,29,46,0.03)] md:shadow-[6px_6px_0px_0px_rgba(26,29,46,0.05)] relative overflow-hidden">
              <h2 className="font-display font-black text-xl md:text-2xl mb-4 md:mb-6 text-brand-dark">Método de Entrega</h2>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                <button 
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl md:rounded-[24px] transition-all duration-300 ${deliveryMethod === 'pickup' ? 'bg-brand-dark border-brand-dark text-white shadow-[4px_4px_0px_0px_rgba(26,29,46,1)]' : 'bg-transparent border-brand-dark/20 text-brand-dark hover:border-brand-dark'}`}
                >
                  <Store size={24} className="mb-2" />
                  <span className="font-sans font-bold text-xs md:text-sm tracking-widest uppercase">Pick Up</span>
                </button>
                <button 
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl md:rounded-[24px] transition-all duration-300 ${deliveryMethod === 'delivery' ? 'bg-brand-dark border-brand-dark text-white shadow-[4px_4px_0px_0px_rgba(26,29,46,1)]' : 'bg-transparent border-brand-dark/20 text-brand-dark hover:border-brand-dark'}`}
                >
                  <Bike size={24} className="mb-2" />
                  <span className="font-sans font-bold text-xs md:text-sm tracking-widest uppercase">Delivery</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {deliveryMethod === 'delivery' ? (
                  <motion.div 
                    key="delivery"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 md:space-y-5 relative z-10"
                  >
                    <div className="w-full h-px bg-brand-dark/10 mb-4 md:mb-6"></div>
                    <h3 className="font-sans font-black text-sm md:text-base text-brand-dark tracking-widest uppercase mb-3 text-left">Datos de Envío</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div className="bg-brand-cream/30 p-1 rounded-xl border-2 border-brand-dark/10 relative text-left">
                        <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] md:text-[10px] text-brand-dark uppercase tracking-widest font-black">Nombre</span>
                        <input type="text" defaultValue={`${user.nombre} ${user.apellido}`} className="w-full bg-transparent px-3 py-2 outline-none text-xs md:text-sm text-brand-dark font-black" />
                      </div>
                      <div className="bg-brand-cream/30 p-1 rounded-xl border-2 border-brand-dark/10 relative text-left">
                        <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] md:text-[10px] text-brand-dark uppercase tracking-widest font-black">Teléfono</span>
                        <input type="text" defaultValue={user.telefono} className="w-full bg-transparent px-3 py-2 outline-none text-xs md:text-sm text-brand-dark font-black" />
                      </div>
                    </div>
                    
                    <div className="bg-brand-cream/30 rounded-xl border-2 border-brand-dark/10 relative text-left">
                      <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] md:text-[10px] text-brand-dark uppercase tracking-widest font-black z-10">Zona de Delivery</span>
                      <select 
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full bg-transparent px-4 py-3 md:py-4 outline-none text-xs md:text-sm text-brand-dark font-black appearance-none relative z-0 cursor-pointer"
                      >
                        <option value="" disabled className="text-brand-dark font-black">Selecciona tu zona...</option>
                        {deliveryZones.map(z => (
                          <option key={z.id} value={z.id} className="text-brand-dark bg-white font-black">{z.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/80 pointer-events-none" />
                    </div>

                    <div className="pt-1 text-left">
                      <input type="text" defaultValue={user.ubicacionCorta} className="w-full bg-brand-cream/30 border-2 border-brand-dark/10 rounded-xl px-4 py-3 md:py-4 outline-none focus:border-brand-hotpink transition-colors font-black text-xs md:text-sm text-brand-dark placeholder:text-brand-dark/60" placeholder="Dirección exacta o referencia..." />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="pickup"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-brand-cream/40 p-4 md:p-5 rounded-2xl border-2 border-brand-dark/5 text-left"
                  >
                    <div className="flex items-start space-x-3 text-brand-dark/80">
                      <Store size={20} className="shrink-0 mt-0.5 text-brand-hotpink" />
                      <p className="font-bold text-xs md:text-sm leading-relaxed text-brand-dark">
                        Retira tu pedido directamente en nuestra sede.<br />
                        <span className="text-brand-pink font-black mt-1 block">Te notificaremos cuando esté listo.</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Payment Options */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] border-2 border-brand-dark/10 shadow-[4px_4px_0px_0px_rgba(26,29,46,0.03)] md:shadow-[6px_6px_0px_0px_rgba(26,29,46,0.05)]">
              <h2 className="font-display font-black text-xl md:text-2xl mb-4 md:mb-6 text-brand-dark">Método de Pago</h2>
              
              <div className="space-y-2 md:space-y-3">
                {paymentMethods.filter(pm => pm.enabled).map(pm => (
                  <div key={pm.id} className="space-y-2">
                    <label className={`flex items-center space-x-3 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === pm.id ? 'border-brand-dark bg-brand-dark/5' : 'border-brand-dark/10 hover:border-brand-dark/30'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="text-brand-dark focus:ring-brand-dark" />
                      <div className="flex-1 text-left">
                        <span className="block font-bold text-sm md:text-base text-brand-dark">{pm.name}</span>
                        <span className="text-[10px] md:text-xs text-brand-dark/60 font-medium">{pm.desc}</span>
                      </div>
                    </label>

                    <AnimatePresence>
                      {paymentMethod === pm.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          {/* PAGO MÓVIL */}
                          {pm.name.toLowerCase().includes('pago móvil') && (
                            <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-5 mb-4 text-left shadow-sm">
                              <p className="text-[11px] font-black text-emerald-800 uppercase tracking-[0.15em] mb-4 border-b border-emerald-200/50 pb-2">Datos para Pago Móvil</p>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Banco</span><span className="text-sm font-black text-emerald-900">{pm.banco || '—'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Teléfono</span><span className="text-sm font-black text-emerald-900">{pm.telefono || '—'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Cédula / RIF</span><span className="text-sm font-black text-emerald-900">{pm.cedula || '—'}</span></div>
                                <div className="mt-4 pt-3 border-t border-emerald-200 flex justify-between items-center">
                                  <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Monto a pagar</span>
                                  <span className="text-base font-black text-emerald-900">Bs {(orderTotal * (currency.rate || 1)).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* PAYPAL */}
                          {pm.name.toLowerCase().includes('paypal') && (
                            <div className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-5 mb-4 text-left shadow-sm">
                              <p className="text-[11px] font-black text-blue-800 uppercase tracking-[0.15em] mb-4 border-b border-blue-200/50 pb-2">Datos para PayPal</p>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-blue-800/60 uppercase tracking-widest">Correo PayPal</span><span className="text-sm font-black text-blue-900">{pm.paypalEmail || '—'}</span></div>
                                <div className="mt-4 pt-3 border-t border-blue-200 flex justify-between items-center">
                                  <span className="text-[11px] font-black text-blue-800 uppercase tracking-widest">Monto Bruto a enviar</span>
                                  <span className="text-base font-black text-blue-900">${((orderTotal + 0.30) / (1 - 0.034)).toFixed(2)}</span>
                                </div>
                                <p className="text-[9px] text-blue-800/40 font-bold italic text-center">* Incluye comisión de plataforma para recibir neto.</p>
                              </div>
                            </div>
                          )}

                          {/* ZINLY */}
                          {pm.name.toLowerCase().includes('zinly') && (
                            <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-5 mb-4 text-left shadow-sm">
                              <p className="text-[11px] font-black text-emerald-800 uppercase tracking-[0.15em] mb-4 border-b border-emerald-200/50 pb-2">Datos para Zinly</p>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Correo Zinly</span><span className="text-sm font-black text-emerald-900">{pm.zinliEmail || '—'}</span></div>
                              </div>
                            </div>
                          )}

                          {/* BINANCE */}
                          {pm.name.toLowerCase().includes('binance') && (
                            <div className="bg-amber-50/50 border-2 border-amber-100 rounded-2xl p-5 mb-4 text-left shadow-sm">
                              <p className="text-[11px] font-black text-amber-800 uppercase tracking-[0.15em] mb-4 border-b border-amber-200/50 pb-2">Datos para Binance</p>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest">Correo Binance</span><span className="text-sm font-black text-amber-900">{pm.binanceEmail || '—'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest">Binance ID</span><span className="text-sm font-black text-amber-900">{pm.binanceId || '—'}</span></div>
                              </div>
                            </div>
                          )}

                          {/* EFECTIVO */}
                          {pm.name.toLowerCase().includes('efectivo') && (
                            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 mb-4 text-left shadow-sm">
                              <p className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em] mb-4 border-b border-slate-200 pb-2">Pago en Efectivo</p>
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 leading-tight">Indícanos con qué denominación o billetes cancelas para gestionar tu cambio:</label>
                              <input 
                                type="text" 
                                placeholder="Ej: Pago con billete de $20..."
                                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-[#0A192F] outline-none focus:border-[#FA8072] transition-all"
                                onChange={(e) => setCashNote(e.target.value)}
                                value={cashNote}
                              />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirm Pane */}
          <div className="lg:col-span-2 text-left">
            <div className="bg-brand-dark text-white p-6 md:p-8 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(213,63,140,1)] md:sticky md:top-32">
              <div className="mb-4 text-white/70 text-[10px] tracking-widest uppercase font-black flex justify-between items-end border-b border-white/10 pb-2">
                <span>Resumen de Compra</span>
                <span className="font-bold text-white">3 items</span>
              </div>
              
              <div className="space-y-3 mb-6 md:mb-8 border-b border-white/10 pb-4 md:pb-6">
                <div className="flex justify-between items-center text-xs md:text-sm text-brand-cream/70 font-bold uppercase tracking-widest">
                   <span className="font-bold">Subtotal del pedido</span>
                   <span className="text-brand-cream font-black">${orderSubtotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between items-center text-xs md:text-sm text-brand-cream/70 font-bold uppercase tracking-widest transition-all">
                     <span className="font-bold">Delivery <span className="opacity-70 text-[10px] uppercase">({deliveryZones.find(z => z.id === selectedZoneId)?.name || 'Sin seleccionar'})</span></span>
                     <span className="text-brand-pink font-bold">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-6 md:mb-8">
                <div>
                  <span className="block text-brand-hotpink text-[9px] md:text-[10px] tracking-widest font-black uppercase mb-1">Total a Pagar</span>
                  <span className="font-display font-black text-3xl md:text-4xl text-white">{formatPrice(orderTotal).base}</span>
                  <span className="block text-brand-hotpink font-bold text-xs mt-1">{formatPrice(orderTotal).ves}</span>
                </div>
              </div>



              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckoutSubmit}
                // disabled if delivery chosen but zone not picked
                disabled={deliveryMethod === 'delivery' && !selectedZoneId}
                className={`w-full text-white rounded-full py-4 md:py-5 px-6 font-bold text-[10px] md:text-sm tracking-[0.2em] uppercase transition-colors shadow-[0_4px_14px_0_rgba(213,63,140,0.39)] ${
                  deliveryMethod === 'delivery' && !selectedZoneId 
                  ? 'bg-brand-dark/50 text-white/40 cursor-not-allowed border border-white/10 shadow-none' 
                  : 'bg-brand-hotpink hover:bg-white hover:text-brand-dark'
                }`}
              >
                Completar Pedido
              </motion.button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
