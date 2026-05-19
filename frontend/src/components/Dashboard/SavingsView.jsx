import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Info, ChevronRight, DollarSign, Flag, Plus, Loader2, Check } from 'lucide-react';
import Swal from 'sweetalert2'; // Asumiendo que ya usas SweetAlert por el AsesorView

export const SavingView = () => {
  // =====================================================================
  // 1. ESTADOS LOCALES (Preparados para la API)
  // =====================================================================
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false); // Estado para evitar doble-clic al guardar
  
  // Estructura exacta que el Backend debería devolver en su JSON
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    targetAmount: 0,
    currentAmount: 0,
    startDate: "",
    endDate: "",
    monthlySuggestion: 0,
    chartPoints: [], 
    chartLabels: [] 
  });

  // =====================================================================
  // 2. OBTENCIÓN DE DATOS (GET)
  // =====================================================================
  useEffect(() => {
    // TODO: BACKEND - Petición GET para traer la meta de ahorro activa del usuario
    /* Ejemplo real:
      fetch('/api/savings/current')
        .then(res => res.json())
        .then(data => {
          setGoalData(data);
          setIsLoading(false);
        })
        .catch(err => console.error("Error al cargar la meta:", err));
    */

    // Simulación temporal para el Frontend
    setTimeout(() => {
      setGoalData({
        title: "Fondo de Emergencia",
        description: "Dinero reservado para imprevistos médicos o reparaciones urgentes durante el semestre.",
        targetAmount: 5000,
        currentAmount: 3200,
        startDate: "01/01/2024",
        endDate: "30/06/2024",
        monthlySuggestion: 450,
        chartPoints: [0, 800, 1500, 2200, 3200],
        chartLabels: ['Ene', 'Feb', 'Mar', 'Abr', 'May']
      });
      setIsLoading(false);
    }, 800);
  }, []);

  // =====================================================================
  // 3. ACTUALIZACIÓN DE DATOS (POST / PUT)
  // =====================================================================
  const handleAddSavings = async () => {
    // 1. Preguntar al usuario cuánto quiere ahorrar usando SweetAlert
    const { value: amount } = await Swal.fire({
      title: 'Añadir Ahorro',
      input: 'number',
      inputLabel: 'Monto a transferir a tu meta',
      inputPlaceholder: 'Ej. 500',
      showCancelButton: true,
      confirmButtonText: 'Añadir',
      cancelButtonText: 'Cancelar',
      background: '#101010',
      color: '#ffffff',
      confirmButtonColor: '#10b981',
      inputAttributes: { min: 1, step: 1 }
    });

    if (amount) {
      setIsAdding(true); // Deshabilita el botón y muestra loader
      
      const numericAmount = Number(amount);

      // TODO: BACKEND - Petición POST para registrar el nuevo ahorro
      /* Ejemplo real:
      try {
        const response = await fetch('/api/savings/add', {
          method: 'POST',
          body: JSON.stringify({ amount: numericAmount }), 
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error("Fallo en la transacción");
        
        // Si el backend responde con el objeto actualizado, lo seteamos:
        // const updatedData = await response.json();
        // setGoalData(updatedData);

      } catch(error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo guardar el ahorro', 'error');
      } finally {
        setIsAdding(false);
      }
      */

      // Simulación optimista para Frontend
      setTimeout(() => {
        setGoalData(prev => ({
          ...prev,
          currentAmount: prev.currentAmount + numericAmount
        }));
        setIsAdding(false);
        
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: `¡Felicidades! Sumaste $${numericAmount} a tu meta.`,
          showConfirmButton: false,
          timer: 3000,
          background: '#101010',
          color: '#10b981'
        });
      }, 1000);
    }
  };

  // =====================================================================
  // 4. CÁLCULOS SEGUROS DEL FRONTEND
  // =====================================================================
  const progressPercentage = goalData.targetAmount > 0 
    ? Math.min(((goalData.currentAmount / goalData.targetAmount) * 100), 100).toFixed(1) 
    : 0;
  
  const remainingAmount = Math.max(goalData.targetAmount - goalData.currentAmount, 0);

  // =====================================================================
  // 5. RENDERIZADO DE LA INTERFAZ
  // =====================================================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-emerald-400 animate-in fade-in">
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
        <p className="text-gray-400 font-[Satoshi-Medium]">Sincronizando tus metas...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-8xl w-full mx-auto space-y-8 p-4">
      
      {/* HEADER DE LA META */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Target size={24} />
            </div>
            <h2 className="text-3xl font-[Satoshi-Bold] text-white">{goalData.title}</h2>
          </div>
          <p className="text-gray-400 max-w-xl">{goalData.description}</p>
        </div>
        
        <button 
          onClick={handleAddSavings} 
          disabled={isAdding || goalData.currentAmount >= goalData.targetAmount}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-black px-6 py-3 rounded-2xl font-bold transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
        >
          {isAdding ? (
            <Loader2 size={20} className="animate-spin" />
          ) : goalData.currentAmount >= goalData.targetAmount ? (
            <Check size={20} />
          ) : (
            <Plus size={20} />
          )}
          {goalData.currentAmount >= goalData.targetAmount ? 'Meta Completada' : 'Añadir Ahorro'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* PANEL PRINCIPAL: GRÁFICA Y PROGRESO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TARJETA DE GRÁFICA */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden hover:border-white/10 transition-colors duration-300">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Progreso Histórico</p>
                <h3 className="text-2xl font-[Satoshi-Bold] text-white">Visualización de Meta</h3>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold text-xl">+{progressPercentage}%</p>
                <p className="text-gray-500 text-xs">Crecimiento constante</p>
              </div>
            </div>

            {/* GRÁFICA SVG */}
            <div className="h-64 w-full relative">
              <svg viewBox="0 0 1000 250" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="0" x2="1000" y2="0" stroke="#ffffff05" strokeWidth="1" />
                <line x1="0" y1="125" x2="1000" y2="125" stroke="#ffffff05" strokeWidth="1" />
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#ffffff10" strokeWidth="2" />
                
                {/* TODO: BACKEND - Para hacer esto dinámico, reemplazar por Recharts 
                    o un generador de SVG basado en goalData.chartPoints */}
                <path 
                  d="M 0 250 L 250 210 L 500 175 L 750 140 L 1000 90" 
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                />
                
                <circle cx="0" cy="250" r="6" fill="#10b981" />
                <circle cx="250" cy="210" r="6" fill="#10b981" />
                <circle cx="500" cy="175" r="6" fill="#10b981" />
                <circle cx="750" cy="140" r="6" fill="#10b981" />
                <circle cx="1000" cy="90" r="8" fill="#22d3ee" className="animate-pulse" />
              </svg>
            </div>

            {/* Inyección dinámica de las etiquetas de la gráfica desde el Backend */}
            <div className="flex justify-between mt-4 text-xs font-bold text-gray-500 uppercase">
              {goalData.chartLabels.length > 0 ? (
                goalData.chartLabels.map((label, index) => (
                  <span key={index}>{label}</span>
                ))
              ) : (
                <><span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span></>
              )}
            </div>
          </div>

          {/* BARRA DE PROGRESO DETALLADA */}
          <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-medium">Estado del Objetivo</span>
              <span className="text-gray-400 text-sm">{progressPercentage}% Completado</span>
            </div>
            
            <div className="h-4 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-linear-to-r from-emerald-500 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1 uppercase font-bold">Actual</p>
                <p className="text-xl font-[Satoshi-Bold] text-white">${goalData.currentAmount.toLocaleString('es-MX')}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1 uppercase font-bold">Objetivo</p>
                <p className="text-xl font-[Satoshi-Bold] text-emerald-400">${goalData.targetAmount.toLocaleString('es-MX')}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1 uppercase font-bold">Restante</p>
                <p className="text-xl font-[Satoshi-Bold] text-cyan-400">${remainingAmount.toLocaleString('es-MX')}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1 uppercase font-bold">Mensual Sug.</p>
                <p className="text-xl font-[Satoshi-Bold] text-white">${goalData.monthlySuggestion.toLocaleString('es-MX')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: DETALLES Y FECHAS */}
        <div className="space-y-6">
          <div className="bg-darkpanel border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors duration-300">
            <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6 flex items-center gap-2">
              <Calendar className="text-emerald-400" size={20} />
              Cronograma de Meta
            </h3>
            
            <div className="space-y-6 relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10"></div>
              
              <div className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-darkbg"></div>
                <p className="text-xs text-gray-500 uppercase font-bold">Fecha de Inicio</p>
                <p className="text-white font-medium">{goalData.startDate}</p>
              </div>

              <div className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-cyan-500 border-2 border-darkbg animate-pulse"></div>
                <p className="text-xs text-gray-500 uppercase font-bold">Fecha Final Estimada</p>
                <p className="text-white font-medium">{goalData.endDate}</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
              <Info className="text-cyan-400 shrink-0" size={18} />
              <p className="text-xs text-gray-400">
                Basado en tu ritmo actual, alcanzarás tu meta antes de lo previsto. ¡Sigue así!
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors duration-300">
             <h3 className="text-lg font-[Satoshi-Bold] text-white mb-4">Consejo Financiero</h3>
             <p className="text-sm text-gray-400 leading-relaxed italic">
               "Automatiza tus ahorros el mismo día que recibas tus ingresos para evitar la tentación de gastarlos."
             </p>
             <button className="w-full mt-6 flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm transition-all cursor-pointer">
                Ver más tips de ahorro
                <ChevronRight size={16} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};