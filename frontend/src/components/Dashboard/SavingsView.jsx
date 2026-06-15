import React, { useState, useEffect } from 'react';
import { Target, Calendar, Plus, Loader2, Check, X, Info, ChevronRight, TrendingUp, Trash2, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';

export const SavingView = ({onTransactionAdded}) => {
  // =====================================================================
  // 1. ESTADOS
  // =====================================================================
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState([]); 
  const [showForm, setShowForm] = useState(false); 
  const [editGoalId, setEditGoalId] = useState(null); // NUEVO: Rastrea si estamos editando
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: ''
  });

  // URL Base de tu API
  const API_BASE_URL = 'http://localhost:8000/goal';

  // Configuración por defecto para fetch con manejo de Cookies (Sesión)
  const fetchOptions = (method, body = null) => {
    const options = {
      method: method,
      headers: {},
      credentials: 'include' 
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    return options;
  };

  // =====================================================================
  // 2. OBTENCIÓN DE DATOS (GET)
  // =====================================================================
  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/`, fetchOptions('GET'));
      
      if (res.status === 404) {
        setGoals([]);
        return;
      }
      
      if (!res.ok) throw new Error('Error al obtener las metas');
      
      const data = await res.json();
      
      const mappedGoals = data.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        startDate: g.start_date ? g.start_date.split('T')[0] : '',
        endDate: g.end_date ? g.end_date.split('T')[0] : ''
      }));

      setGoals(mappedGoals);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar tus metas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // =====================================================================
  // 3. LÓGICA DE ACCIONES (POST / PUT / DELETE)
  // =====================================================================

  // CREAR O ACTUALIZAR META (POST / PUT)
  const handleSaveGoal = async (e) => {
    e.preventDefault();

    const amountTarget = Number(formData.targetAmount)

    if(isNaN(amountTarget) || amountTarget <= 0) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Monto inválido',
            text: 'Por favor, ingresa una cantidad mayor a 0.',
            showConfirmButton: false,
            timer: 3000,
            background: '#101010',
            color: '#ffffff'
          });
          return
        }
  
    // Buscamos la meta actual si estamos editando para no perder su progreso (current_amount)
    const existingGoal = editGoalId ? goals.find(g => g.id === editGoalId) : null;

    const backendGoalData = {
      title: formData.title,
      description: formData.description,
      target_amount: Number(formData.targetAmount),
      current_amount: existingGoal ? existingGoal.currentAmount : 0, 
      start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null
    }

    try {
      let res;
      if (editGoalId) {
        // MODO EDICIÓN: PUT al backend
        // TODO: BACKEND - Verifica si tu ruta es /update/, /edit/ o similar en FastAPI
        res = await fetch(`${API_BASE_URL}/update/${editGoalId}`, fetchOptions('PUT', backendGoalData));
      } else {
        // MODO CREACIÓN: POST al backend
        res = await fetch(`${API_BASE_URL}/register`, fetchOptions('POST', backendGoalData));
      }
      
      if (!res.ok) throw new Error(editGoalId ? 'No se pudo actualizar la meta' : 'No se pudo registrar la meta');
      
      await fetchGoals();
      resetForm();

      Swal.fire({
        toast: true, position: 'bottom-end', icon: 'success',
        title: editGoalId ? 'Meta actualizada exitosamente' : 'Meta creada exitosamente', 
        showConfirmButton: false, timer: 3000,
        background: '#101010', color: '#10b981'
      });
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  // PREPARAR FORMULARIO PARA EDICIÓN
  const handleEditClick = (goal) => {
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      startDate: goal.startDate,
      endDate: goal.endDate
    });
    setEditGoalId(goal.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // LIMPIAR FORMULARIO
  const resetForm = () => {
    setShowForm(false);
    setEditGoalId(null);
    setFormData({ title: '', description: '', targetAmount: '', startDate: '', endDate: '' });
  };

  // ABONAR A META (PUT)
  const handleAddFunds = async (goalId) => {
    const { value: amount } = await Swal.fire({
      title: 'Añadir Ahorro',
      input: 'number',
      inputLabel: '¿Cuánto deseas abonar a esta meta?',
      inputPlaceholder: 'Ej. 500',
      showCancelButton: true,
      confirmButtonText: 'Abonar',
      cancelButtonText: 'Cancelar',
      background: '#101010', color: '#ffffff', confirmButtonColor: '#10b981',
    });

    if (amount) {
      const numericAmount = Number(amount);
      const backendAmountData = { amount: numericAmount };

      if(isNaN(amount) || amount <= 0) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Monto inválido',
            text: 'Por favor, ingresa una cantidad mayor a 0.',
            showConfirmButton: false,
            timer: 3000,
            background: '#101010',
            color: '#ffffff'
          })
          return
        }
      try {
        const res = await fetch(`${API_BASE_URL}/add/${goalId}`, fetchOptions('PUT', backendAmountData));
        
        if (!res.ok) throw new Error('No se pudo añadir el monto');

        setGoals(prevGoals => prevGoals.map(goal => 
          goal.id === goalId 
            ? { ...goal, currentAmount: goal.currentAmount + numericAmount } 
            : goal
        ));

        if (onTransactionAdded) {
          onTransactionAdded();
        }

        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'success',
          title: `Abono de $${numericAmount} registrado`,
          showConfirmButton: false, timer: 3000, background: '#101010', color: '#10b981'
        });
      } catch (error) {
        Swal.fire({title: 'Error', text: `No se pudo registrar el abono: ${error.message}`, icon: 'error'});
      }
    }
  };

  // ELIMINAR META (DELETE)
  const handleDeleteGoal = async (goalId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará esta meta y su progreso. Esta acción no se puede deshacer.",
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
      try {
        const res = await fetch(`${API_BASE_URL}/delete/${goalId}`, fetchOptions('DELETE'));
        
        if (!res.ok) throw new Error("Fallo al eliminar");
        
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));

        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'success',
          title: 'Meta eliminada correctamente',
          showConfirmButton: false, timer: 3000, background: '#101010', color: '#10b981'
        });
      } catch (error) {
        Swal.fire({title: 'Error', text: `No se pudo eliminar la meta: ${error.message}`, icon: 'error'});
      }
    }
  };

  // =====================================================================
  // 4. CÁLCULOS AUXILIARES
  // =====================================================================
  const calculateProgress = (current, target) => {
    if (!target || target <= 0) return "0.0";
    return Math.min((current / target) * 100, 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-emerald-400">
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
        <p className="text-gray-400">Cargando tus objetivos...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-darkpanel p-6 rounded-3xl border border-white/5 shadow-lg">
        <div>
          <h2 className="text-3xl font-[Satoshi-Bold] text-white flex items-center gap-3">
            <Target className="text-emerald-400" size={32} />
            Metas de Ahorro
          </h2>
          <p className="text-gray-400 mt-1">Gestiona tus objetivos financieros a corto y largo plazo.</p>
        </div>
        
        <button 
          onClick={showForm ? resetForm : () => setShowForm(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg cursor-pointer ${
            showForm ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-emerald-500 text-black hover:bg-emerald-400'
          }`}
        >
          {showForm ? <><X size={20} /> Cancelar</> : <><Plus size={20} /> Añadir Meta</>}
        </button>
      </div>

      {/* FORMULARIO DE NUEVA / EDITAR META */}
      {showForm && (
        <div className="bg-darkpanel border border-emerald-500/30 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-[Satoshi-Bold] text-white mb-6">
            {editGoalId ? 'Editar Meta Existente' : 'Configurar Nueva Meta'}
          </h3>
          <form onSubmit={handleSaveGoal} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Nombre de la Meta</label>
                <input 
                  required type="text" placeholder="Ej. Viaje a la playa" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Descripción</label>
                <textarea 
                  placeholder="¿Para qué es este ahorro?" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 h-24 resize-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Monto Objetivo ($)</label>
                <input 
                  required type="number" placeholder="0.00" 
                  value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Inicio</label>
                  <input 
                    required type="date" 
                    value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none focus:border-emerald-500/50 scheme-dark"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Fin Esperado</label>
                  <input 
                    required type="date" 
                    value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none focus:border-emerald-500/50 scheme-dark"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl transition-all mt-4">
                {editGoalId ? 'Actualizar Meta' : 'Guardar Meta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA DE METAS */}
      <div className="bg-darkpanel rounded-3xl border border-white/5 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">Objetivo</th>
                <th className="px-6 py-5">Progreso Visual</th>
                <th className="px-6 py-5">Monto Actual / Total</th>
                <th className="px-6 py-5">Fechas</th>
                <th className="px-6 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {goals.map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                const isCompleted = goal.currentAmount >= goal.targetAmount;

                return (
                  <tr key={goal.id} className={`transition-colors group ${isCompleted ? 'bg-emerald-500/10 ' : 'hover:bg-white/2'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-[Satoshi-Bold]">{goal.title}</p>
                        {isCompleted && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 animate-in zoom-in duration-300">
                            ¡Completada!
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate max-w-50 ${isCompleted ? 'text-emerald-400/80 font-medium' : 'text-gray-500'}`}>
                        {isCompleted ? "🎉 ¡Felicidades! Meta alcanzada." : goal.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 min-w-50">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-400' : 'bg-[linear-gradient(to_right,#10b981,#22d3ee)]'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-400' : 'text-gray-400'}`}>{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                        ${goal.currentAmount.toLocaleString('es-MX')}
                      </p>
                      <p className="text-gray-500 text-xs">de ${goal.targetAmount.toLocaleString('es-MX')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {goal.startDate}</span>
                        <span className="flex items-center gap-1 mt-1"><Check size={12}/> {goal.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        {/* Botón Añadir Fondos */}
                        <button 
                          onClick={() => handleAddFunds(goal.id)}
                          disabled={isCompleted}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isCompleted 
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                            : 'border-white/10 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                          }`}
                          title={isCompleted ? "Meta alcanzada" : "Añadir fondos"}
                        >
                          {isCompleted ? <Check size={18} /> : <Plus size={18} />}
                        </button>
                        
                        {/* Botón Editar Meta */}
                        <button 
                          onClick={() => handleEditClick(goal)}
                          className="p-2.5 rounded-xl border border-white/10 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all cursor-pointer"
                          title="Editar meta"
                        >
                          <Edit2 size={18} />
                        </button>

                        {/* Botón Eliminar Meta */}
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2.5 rounded-xl border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Eliminar meta"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {goals.length === 0 && (
            <div className="p-20 text-center">
              <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                <Target size={40} className="text-gray-600" />
              </div>
              <p className="text-gray-400">Aún no tienes metas registradas.</p>
              <button onClick={() => setShowForm(true)} className="text-emerald-400 font-bold hover:underline mt-2">Empieza creando tu primera meta</button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER TIPS */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 flex items-start gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
          <TrendingUp size={24} />
        </div>
        <div>
          <h4 className="text-white font-[Satoshi-Bold]">Consejo de Ahorro</h4>
          <p className="text-gray-400 text-sm mt-1">
            "La mejor forma de alcanzar tus metas es automatizando un pequeño porcentaje de tus ingresos apenas los recibas. 
            Incluso $100 semanales pueden marcar la diferencia al final del año."
          </p>
        </div>
      </div>

    </div>
  );
};