import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Search, Calendar,
  Wallet, ShoppingBag, Zap, Coffee, Car, Home, Briefcase, HeartPulse, Film, Plus, X, Loader2,
  Pencil, Trash2 // <-- Importamos los iconos para Editar y Eliminar
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, addMonths, addWeeks, addDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

const getCategoryIcon = (category) => {
  const lowerCat = category ? category.toLowerCase() : '';
  if (lowerCat.includes('comida') || lowerCat.includes('food')) return ShoppingBag;
  if (lowerCat.includes('servicios') || lowerCat.includes('utilities')) return Zap;
  if (lowerCat.includes('transporte') || lowerCat.includes('transport')) return Car;
  if (lowerCat.includes('salario') || lowerCat.includes('salary') || lowerCat.includes('nomina')) return Wallet;
  if (lowerCat.includes('beca') || lowerCat.includes('scholarship')) return Wallet;
  if (lowerCat.includes('freelance') || lowerCat.includes('project') || lowerCat.includes('ventas')) return Briefcase;
  if (lowerCat.includes('salud') || lowerCat.includes('health')) return HeartPulse;
  if (lowerCat.includes('entretenimiento') || lowerCat.includes('entertainment')) return Film;
  if (lowerCat.includes('casa') || lowerCat.includes('home')) return Home;
  return Coffee;
};

// =====================================================================
// NOTA PARA BACKEND: Ahora recibimos también funciones para actualizar y eliminar
// =====================================================================
export const TransactionsView = ({ transactions = [], onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
  // =====================================================================
  // 1. ESTADOS LOCALES
  // =====================================================================
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados del Modal
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    category: 'Comida',
    type: 'expense',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    frequency: 'Mensual',
    endDate: ''
  });

  // =====================================================================
  // 2. LÓGICA DE GUARDADO Y EDICIÓN (POST / PUT)
  // =====================================================================
  
  const openEditModal = (t) => {
    // Rellenamos el formulario con los datos de la transacción seleccionada
    setNewTransaction({
      amount: Math.abs(t.amount), 
      description: t.description,
      category: t.category,
      type: t.type,
      date: t.date ? t.date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'), 
      isRecurring: false, 
      frequency: 'Mensual',
      endDate: ''
    });
    setEditId(t.id);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleModalClose = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditId(null);
    setNewTransaction({
      amount: '', description: '', category: 'Comida', type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'), isRecurring: false, frequency: 'Mensual', endDate: ''
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description) return;
    
    setIsSubmitting(true);

    const currentTime = format(new Date(), 'HH:mm:ss');
    const baseDate = new Date(`${newTransaction.date}T${currentTime}`);
    const amount = parseFloat(newTransaction.amount);
    
    const isincome = newTransaction.type === 'income';
    let endpoint = '';
    if (isEditing) {
      endpoint = isincome
        ? `http://localhost:8000/income/update/${editId}`
        : `http://localhost:8000/bill/update/${editId}`;
    } else {
      endpoint = isincome 
        ? 'http://localhost:8000/income/register' 
        : 'http://localhost:8000/bill/register';
    }
    
    // payload mapeado
    let backendPayload = {
      title: newTransaction.description.substring(0, 20),
      amount: amount,
      description: newTransaction.description,
      date: baseDate.toISOString(),
      frequency: newTransaction.isRecurring ? newTransaction.frequency : "Único"
    };

    // categorias adaptadas
    if (isincome) {
      let originMapping = "Otros";
      if (newTransaction.category === "Salario") originMapping = "Nomina";
      if (newTransaction.category === "Freelance") originMapping = "Ventas";
      if (newTransaction.category === "Inversiones") originMapping = "Inversiones";
      if (newTransaction.category === "Otros") originMapping = "Otros";
      backendPayload.origin = originMapping;
    } else {
      backendPayload.category = newTransaction.category;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(backendPayload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al guardar en el servidor');
      }

      await response.json(); // Consumimos el {"message": "..."} del Backend

      const localNewTx = {
        id: Math.random().toString(36).substr(2, 9), 
        date: baseDate.toISOString(),
        category: isincome ? (backendPayload.origin || 'Otros') : (backendPayload.category || 'Otros'),
        description: newTransaction.description,
        amount: amount,
        type: newTransaction.type
      };

      if (onAddTransaction) onAddTransaction(localNewTx);
      
      Swal.fire({
        toast: true, position: 'bottom-end', icon: 'success', 
        title: 'Transacción guardada exitosamente', showConfirmButton: false, 
        timer: 3000, background: '#101010', color: '#10b981'
      });

      handleModalClose();

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message || 'No se pudo procesar la transacción', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================================
  // 3. LÓGICA DE ELIMINACIÓN (DELETE conectado al Backend)
  // =====================================================================
  const handleDeleteClick = async (id, type) => {
    const result = await Swal.fire({
      title: '¿Eliminar transacción?',
      text: "Esta acción eliminará el registro de la base de datos permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#101010',
      color: '#ffffff'
    });

    if (result.isConfirmed) {
      // Determinamos ruta según el tipo unificado ('income' o 'expense')
      const isIncome = type === 'income';
      const deleteEndpoint = isIncome 
        ? `http://localhost:8000/income/delete/${id}`
        : `http://localhost:8000/bill/delete/${id}`;

      try {
        const response = await fetch(deleteEndpoint, { 
          method: 'DELETE',
          credentials: 'include' 
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Ocurrió un error al eliminar en el servidor');
        }

        // Avisamos a MainApp para remover la fila local de inmediato
        if (onDeleteTransaction) onDeleteTransaction(id);
        
        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'success', 
          title: 'Registro eliminado', showConfirmButton: false, timer: 3000, background: '#101010', color: '#10b981'
        });

      } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message || 'No se pudo eliminar el registro', 'error');
      }
    }
  };

  // =====================================================================
  // 4. FILTROS Y CÁLCULOS
  // =====================================================================
  const filteredTransactions = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    return transactions.filter(t => {
      if (!t || !t.date) return false;

      try {
        const date = parseISO(t.date);
        const inMonth = isWithinInterval(date, { start, end });
        const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        return inMonth && matchesSearch;
      } catch (err) {
        return false;
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMonth, searchTerm]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const balance = totals.income - totals.expense;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // =====================================================================
  // 5. RENDERIZADO DE LA INTERFAZ
  // =====================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Controles de Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-darkpanel p-4 rounded-2xl shadow-lg border border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full text-emerald-400 transition-colors duration-300 cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-[Satoshi-Bold] text-white min-w-45 text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full text-emerald-400 transition-colors duration-300 cursor-pointer">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-auto group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar transacción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-xl bg-white/5 border border-transparent focus:border-emerald-500/30 focus:bg-white/10 outline-none text-white placeholder-gray-500 transition-all duration-300"
            />
          </div>
          
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-emerald-500 text-black hover:bg-emerald-400 px-4 py-2 rounded-xl transition-colors duration-300 font-bold whitespace-nowrap shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Mensual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex items-center justify-between group hover:bg-emerald-500/10 transition-colors duration-300">
          <div>
            <p className="text-md text-emerald-400 font-medium mb-1">Ingresos de {format(currentMonth, 'MMM', { locale: es })}</p>
            <p className="text-2xl font-[Satoshi-Bold] text-emerald-400">+${totals.income.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl flex items-center justify-between group hover:bg-red-500/10 transition-colors duration-300">
          <div>
            <p className="text-md text-red-400 font-medium mb-1">Gastos de {format(currentMonth, 'MMM', { locale: es })}</p>
            <p className="text-2xl font-[Satoshi-Bold] text-red-400">-${totals.expense.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="p-3 bg-red-500/20 rounded-xl text-red-400 group-hover:scale-110 transition-transform">
            <ArrowDownLeft size={24} />
          </div>
        </div>

        <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-2xl flex items-center justify-between group hover:bg-cyan-500/10 transition-colors duration-300">
          <div>
            <p className="text-md text-cyan-400 font-medium mb-1">Balance Mensual</p>
            <p className={`text-2xl font-[Satoshi-Bold] ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : ''}${balance.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </p>
          </div>
          <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Lista Detallada de Transacciones (Columnas Reordenadas) */}
      <div className="bg-darkpanel rounded-2xl shadow-lg border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider font-[Satoshi-Bold] border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Fecha & Hora</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((t) => {
                const date = parseISO(t.date);
                const CategoryIcon = getCategoryIcon(t.category);
                const isIncome = t.type === 'income';

                return (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                    {/* 1. Descripción */}
                    <td className="px-6 py-4">
                      <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                        {t.description}
                      </span>
                    </td>

                    {/* 2. Categoría */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${
                          isIncome ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <CategoryIcon size={18} />
                        </div>
                        <span className="font-medium text-gray-300">{t.category}</span>
                      </div>
                    </td>

                    {/* 3. Fecha y Hora */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-[Satoshi-Bold] text-gray-300 text-md">{format(date, 'dd')} {format(date, 'MMM, yyyy', { locale: es })}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Calendar size={12} />
                          <span>{format(date, 'HH:mm')}</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. Monto */}
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-[Satoshi-Bold] text-lg ${
                      isIncome ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isIncome ? '+' : '-'}${Math.abs(t.amount).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                    </td>

                    {/* 5. Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2 opacity-100">
                        <button 
                          onClick={() => openEditModal(t)}
                          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Editar registro"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(t.id, t.type)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-white/5 rounded-full border border-white/10">
                        <Search size={32} className="text-gray-600" />
                      </div>
                      <p>No se encontraron transacciones en este mes.</p>
                      <button 
                        onClick={() => setCurrentMonth(new Date())}
                        className="text-emerald-400 font-medium hover:underline text-sm transition-colors cursor-pointer"
                      >
                        Volver al mes actual
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Agregar/Editar Transacción */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-darkbg/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-darkpanel bg-zinc-900/80 rounded-3xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-xl font-[Satoshi-Bold] text-white">
                {isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
              </h3>
              <button 
                onClick={handleModalClose}
                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Tipo</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                    className={`py-2 rounded-xl border transition-all font-bold cursor-pointer ${
                      newTransaction.type === 'expense' 
                        ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                        : 'border-white/10 text-gray-500 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                    className={`py-2 rounded-xl border transition-all font-bold cursor-pointer ${
                      newTransaction.type === 'income' 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                        : 'border-white/10 text-gray-500 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Monto ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-transparent focus:border-emerald-500/30 focus:bg-white/10 outline-none text-white transition-all duration-300"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Descripción</label>
                <input 
                  type="text" 
                  required
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-transparent focus:border-emerald-500/30 focus:bg-white/10 outline-none text-white transition-all duration-300"
                  placeholder="Ej. Cena con amigos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Categoría</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-darkpanel border border-white/10 focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 outline-none text-white transition-all duration-300"
                  >
                    {newTransaction.type === 'expense' ? (
                      <>
                        <option value="Comida" className='bg-zinc-900'>Comida</option>
                        <option value="Transporte" className='bg-zinc-900'>Transporte</option>
                        <option value="Servicios" className='bg-zinc-900'>Servicios</option>
                        <option value="Salud" className='bg-zinc-900'>Salud</option>
                        <option value="Entretenimiento" className='bg-zinc-900'>Entretenimiento</option>
                        <option value="Casa" className='bg-zinc-900'>Casa</option>
                        <option value="Otros" className='bg-zinc-900'>Otros</option>
                      </>
                    ) : (
                      <>
                        <option value="Salario" className='bg-zinc-900'>Salario</option>
                        <option value="Beca" className='bg-zinc-900'>Beca</option>
                        <option value="Freelance" className='bg-zinc-900'>Freelance</option>
                        <option value="Inversiones" className='bg-zinc-900'>Inversiones</option>
                        <option value="Otros" className='bg-zinc-900'>Otros</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Fecha de registro</label>
                  <input 
                    type="date" 
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-transparent focus:border-emerald-500/30 focus:bg-white/10 outline-none text-gray-300 transition-all duration-300 scheme-dark"
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="border-t border-white/5 pt-4 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer mb-4 group">
                    <input 
                      type="checkbox" 
                      checked={newTransaction.isRecurring}
                      onChange={(e) => setNewTransaction({...newTransaction, isRecurring: e.target.checked})}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"
                    />
                    <span className="text-sm font-[Satoshi-Bold] text-gray-300 group-hover:text-white transition-colors">Es un registro fijo/recurrente</span>
                  </label>

                  {newTransaction.isRecurring && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Frecuencia</label>
                        <select
                          value={newTransaction.frequency}
                          onChange={(e) => setNewTransaction({...newTransaction, frequency: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-darkpanel border border-white/10 focus:border-emerald-500/30 outline-none text-white transition-all duration-300"
                        >
                          <option value="Mensual" className='bg-zinc-900'>Mensual</option>
                          <option value="Quincenal" className='bg-zinc-900'>Quincenal</option>
                          <option value="Semanal" className='bg-zinc-900'>Semanal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Fecha límite</label>
                        <input 
                          type="date" 
                          value={newTransaction.endDate}
                          onChange={(e) => setNewTransaction({...newTransaction, endDate: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-transparent focus:border-emerald-500/30 focus:bg-white/10 outline-none text-gray-300 transition-all duration-300 scheme-dark"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center gap-2 font-bold py-3 px-4 rounded-xl transition-all duration-300 transform shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer ${
                    isSubmitting 
                      ? 'bg-emerald-500/50 text-darkbg cursor-wait' 
                      : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:-translate-y-1'
                  }`}
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
                  {isSubmitting ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar Transacción' : 'Guardar Transacción')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};