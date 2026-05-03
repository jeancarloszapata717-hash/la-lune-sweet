import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, ShoppingBag, LogOut, Search, Users, Menu, X, Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../supabase';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'crm' | 'catalog'>('crm');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#0A192F] text-white p-6 flex flex-col">
        <div className="mb-12">
          <h1 className="font-display font-black text-2xl tracking-tighter uppercase">La Lune <span className="text-[#FA8072]">Sweet</span></h1>
          <p className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('crm')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'crm' ? 'bg-[#FA8072] text-[#0A192F]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <Users size={18} /> <span>CRM / Clientes</span>
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'catalog' ? 'bg-[#FA8072] text-[#0A192F]' : 'text-white/60 hover:bg-white/5'}`}
          >
            <ShoppingBag size={18} /> <span>Catálogo</span>
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={18} /> <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="font-display font-black text-4xl text-[#0A192F] uppercase tracking-tight">
            {activeTab === 'crm' ? 'Gestión de Clientes' : 'Gestión de Catálogo'}
          </h2>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</p>
            <p className="font-bold text-[#0A192F]">{user?.nombre} {user?.apellido}</p>
          </div>
        </header>

        {activeTab === 'crm' ? <TabCRM /> : <TabCatalog />}
      </div>
    </div>
  );
}

function TabCRM() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfiles')
        .select('*');
      
      if (data) setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filtered = users.filter(u => 
    (u.nombre?.toLowerCase() + " " + u.apellido?.toLowerCase() + " " + u.email?.toLowerCase()).includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-3 outline-none focus:border-[#FA8072] text-sm font-medium transition-all" 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="py-5 px-8 text-[10px] font-bold tracking-widest uppercase text-slate-400">Cliente</th>
              <th className="py-5 px-8 text-[10px] font-bold tracking-widest uppercase text-slate-400">Contacto</th>
              <th className="py-5 px-8 text-[10px] font-bold tracking-widest uppercase text-slate-400">Ubicación</th>
              <th className="py-5 px-8 text-[10px] font-bold tracking-widest uppercase text-slate-400">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center text-sm font-bold text-slate-400">Cargando base de datos...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-sm font-bold text-slate-400">No se encontraron clientes.</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-6 px-8">
                  <p className="text-base font-bold text-[#0A192F]">{c.nombre} {c.apellido}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">ID: {c.id.slice(0,8)}</p>
                </td>
                <td className="py-6 px-8">
                  <p className="text-sm font-bold text-slate-600">{c.email}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{c.telefono}</p>
                </td>
                <td className="py-6 px-8 text-sm font-bold text-slate-500 uppercase tracking-tighter">{c.ubicacion_corta || '—'}</td>
                <td className="py-6 px-8">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.role === 'admin' ? 'bg-[#FA8072]/10 text-[#FA8072]' : 'bg-slate-100 text-slate-400'}`}>
                    {c.role || 'client'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabCatalog() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
      <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
      <h3 className="font-display font-bold text-2xl text-[#0A192F] mb-2">Editor de Catálogo</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm">Gestiona tus productos directamente desde la base de datos de Supabase para mayor agilidad en esta versión ligera.</p>
      <a 
        href="https://supabase.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 bg-[#0A192F] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#FA8072] transition-colors"
      >
        <span>Ir a Supabase Dashboard</span>
      </a>
    </div>
  );
}
