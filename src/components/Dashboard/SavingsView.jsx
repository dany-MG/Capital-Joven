import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, Info, ChevronRight, DollarSign, Flag, Plus, Loader2 } from 'lucide-react';

export const SavingView = () => {
  // =====================================================================
  // 1. ZONA DE ESTADOS (Preparado para la inyección de datos del Backend)
  // =====================================================================
  const [loading, setLoading] = useState(true);
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    targetAmount: 0,
    currentAmount: 0,
    startDate: "",
    endDate: "",
    chartPoints: [] // Puntos para dibujar la gráfica
  });

  // =====================================================================
  // 2. PETICIONES AL BACKEND (Donde el equipo conectará las APIs)
  // =====================================================================
  useEffect(() => {
    // TODO: BACKEND - Aquí deben hacer la petición GET a la base de datos
    /* Ejemplo de implementación real:
      fetch('/api/users/123/savings-goal')
        .then(res => res.json())
        .then(data => {
          setGoalData(data);
          setLoading(false);
        })
        .catch(err => console.error("Error al cargar la meta:", err));
    */

    // Simulación temporal (Mock) para que el frontend funcione mientras conectan
    setTimeout(() => {
      setGoalData({
        title: "Fondo de Emergencia",
        description: "Dinero reservado para imprevistos médicos o reparaciones urgentes durante el semestre.",
        targetAmount: 5000,
        currentAmount: 3200,
        startDate: "01/01/2024",
        endDate: "30/06/2024",
        chartPoints: [0, 800, 1500, 2200, 3200]
      });
      setLoading(false);
    }, 800); // 800ms de carga simulada
  }, []);

  const handleAddSavings = () => {
    // TODO: BACKEND - Lógica para abrir un modal, pedir el monto al usuario y hacer el POST
    /* Ejemplo de implementación:
      fetch('/api/users/123/savings/add', {
        method: 'POST',
        body: JSON.stringify({ amount: 500 }), 
        headers: { 'Content-Type': 'application/json' }
      })
      .then(() => {
        // Actualizar el estado local o volver a hacer el GET
      });
    */
    alert("Aquí se abrirá el modal para inyectar fondos. (Tarea para Backend)");
  };

  // =====================================================================
  // 3. CÁLCULOS DEL FRONTEND (El backend no necesita enviar porcentajes)
  // =====================================================================
  const progressPercentage = goalData.targetAmount > 0 
    ? ((goalData.currentAmount / goalData.targetAmount) * 100).toFixed(1) 
    : 0;
  
  const remainingAmount = goalData.targetAmount - goalData.currentAmount;

  // =====================================================================
  // 4. RENDER DE LA INTERFAZ
  // =====================================================================

  // Pantalla de carga mientras el backend responde
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-emerald-400 animate-in fade-in">
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
        <p className="text-gray-400 font-medium">Sincronizando tus metas...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-8 p-4">
      
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
        
        <button onClick={handleAddSavings} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-2xl font-bold transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2">
          <Plus size={20} />
          Añadir Ahorro
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* PANEL PRINCIPAL: GRÁFICA Y PROGRESO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TARJETA DE GRÁFICA */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden">
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

            {/* GRÁFICA SVG (Línea Recta de Progreso) */}
            <div className="h-64 w-full relative">
              <svg viewBox="0 0 1000 250" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                {/* Líneas de guía estáticas */}
                <line x1="0" y1="0" x2="1000" y2="0" stroke="#ffffff05" strokeWidth="1" />
                <line x1="0" y1="125" x2="1000" y2="125" stroke="#ffffff05" strokeWidth="1" />
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#ffffff10" strokeWidth="2" />
                
                {/* TODO: BACKEND / FRONTEND AVANZADO
                  La ruta "d" y los "circle" pueden ser mapeados dinámicamente usando goalData.chartPoints
                  cuando las matemáticas de coordenadas se conecten a la API real. 
                */}
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

            {/* TODO: BACKEND - Las etiquetas de meses también deben venir de la BD */}
            <div className="flex justify-between mt-4 text-xs font-bold text-gray-500 uppercase">
              <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span>
            </div>
          </div>

          {/* BARRA DE PROGRESO DETALLADA */}
          <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8">
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
                <p className="text-xl font-[Satoshi-Bold] text-white">${goalData.currentAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1 uppercase font-bold">Objetivo</p>
                <p className="text-xl font-[Satoshi-Bold] text-emerald-400">${goalData.targetAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1 uppercase font-bold">Restante</p>
                <p className="text-xl font-[Satoshi-Bold] text-cyan-400">${remainingAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs mb-1 uppercase font-bold">Mensual Sug.</p>
                {/* TODO: BACKEND - Sugerencia calculada por la API */}
                <p className="text-xl font-[Satoshi-Bold] text-white">$450</p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: DETALLES Y FECHAS */}
        <div className="space-y-6">
          <div className="bg-darkpanel border border-white/5 rounded-3xl p-6">
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
              <Info className="text-cyan-400 flex-shrink-0" size={18} />
              <p className="text-xs text-gray-400">
                Basado en tu ritmo actual, alcanzarás tu meta antes de lo previsto. ¡Sigue así!
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
             <h3 className="text-lg font-[Satoshi-Bold] text-white mb-4">Consejo Financiero</h3>
             <p className="text-sm text-gray-400 leading-relaxed italic">
               "Automatiza tus ahorros el mismo día que recibas tus ingresos para evitar la tentación de gastarlos."
             </p>
             <button className="w-full mt-6 flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm transition-all">
                Ver más tips de ahorro
                <ChevronRight size={16} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};