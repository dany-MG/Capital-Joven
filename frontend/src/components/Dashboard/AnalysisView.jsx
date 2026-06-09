import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Target, AlertTriangle, CheckCircle, Edit2, Loader2 } from 'lucide-react'; // Añadimos Loader2
import { format, getDaysInMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const AnalysisView = ({ transactions = [] }) => {
  // =====================================================================
  // 1. ESTADOS LOCALES
  // =====================================================================
  const [budget, setBudget] = useState(0); 
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(0);
  const [isLoadingBudget, setIsLoadingBudget] = useState(true);
  
  // =====================================================================
  // 2. CONFIGURACIÓN DE FECHAS
  // =====================================================================
  // TODO: BACKEND - En producción, esto debe ser `new Date()` para evaluar el mes actual.
  // Se mantiene estático en '2023-10-15' para coincidir con los MOCKS de prueba.
  const analysisDate = new Date(); 
  const currentMonthStr = format(analysisDate, 'yyyy-MM'); // Genera dinámicamente "2023-10"

  // =====================================================================
  // 3. OBTENCIÓN DE DATOS (GET)
  // =====================================================================
  useEffect(() => {
      // TODO: BACKEND - Hacer fetch a la BD para traer el límite mensual del usuario
      /* Ejemplo real:
      fetch('/api/user/settings/budget')
        .then(res => res.json())
        .then(data => {
            setBudget(data.monthlyLimit);
            setTempBudget(data.monthlyLimit);
            setIsLoadingBudget(false);
        })
        .catch(err => console.error("Error cargando el presupuesto:", err));
      */

      // Simulación temporal para el Frontend
      setTimeout(() => {
        setBudget(2000);
        setTempBudget(2000);
        setIsLoadingBudget(false);
      }, 800);
  }, []);

  // =====================================================================
  // 4. ACTUALIZACIÓN DE DATOS (PUT/POST)
  // =====================================================================
  const saveBudget = () => {
    setIsEditingBudget(false);
    const newBudget = Number(tempBudget); 
    
    if (newBudget > 0 && newBudget !== budget) {
      // Actualización Optimista (Cambia en pantalla antes de que responda el server)
      setBudget(newBudget);
      
      // TODO: BACKEND - Enviar el nuevo presupuesto a la base de datos
      /* Ejemplo real:
      fetch('/api/user/settings/budget', {
        method: 'PUT',
        body: JSON.stringify({ monthlyLimit: newBudget }),
        headers: { 'Content-Type': 'application/json' }
      })
      .then(res => {
        if(!res.ok) throw new Error("Fallo al actualizar en el servidor");
      })
      .catch(err => {
        console.error("Error guardando presupuesto", err);
        // Si el servidor falla, revertimos al presupuesto anterior en pantalla
        setBudget(budget);
        setTempBudget(budget);
      });
      */
    } else {
      setTempBudget(budget); // Restaurar si es inválido (ej. si lo dejaron en 0)
    }
  };

  // =====================================================================
  // 5. PROCESAMIENTO Y MATEMÁTICAS (Lógica manejada por el Frontend)
  // =====================================================================
  // Nota para Backend: Solo inyecten las 'transactions' en bruto. 
  // Estos useMemo se encargan de calcular promedios, proyecciones y categorías solos.

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t && t.date && t.date.startsWith(currentMonthStr));
  }, [transactions, currentMonthStr]);

  const predictionStats = useMemo(() => {
    if (budget === 0) return { currentSpent: 0, projectedTotal: 0, isOverBudget: false, remainingBudget: 0, dailyAvg: 0 }; //no necesario, solo es carga

    const currentSpent = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const daysInMonth = getDaysInMonth(analysisDate);
    const dayOfMonth = analysisDate.getDate() || 1; //evita dividir con 0
    const dailyAvg = currentSpent / dayOfMonth;
    const projectedTotal = dailyAvg * daysInMonth;
    const isOverBudget = projectedTotal > budget;

    return { currentSpent, projectedTotal, isOverBudget, remainingBudget: budget - currentSpent, dailyAvg };
  }, [monthlyTransactions, budget, analysisDate]);

  const categoryData = useMemo(() => {
    const categories = {};
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
        const catName = t.category || 'Otros';
        categories[catName] = (categories[catName] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [monthlyTransactions]);

  const barData = useMemo(() => {
    const days = {};
    monthlyTransactions.forEach(t => {
      try {
        const day = format(parseISO(t.date), 'dd MMM', { locale: es });
        if (!days[day]) days[day] = { name: day, ingresos: 0, gastos: 0 };
        if (t.type === 'income') days[day].ingresos += t.amount;
        else days[day].gastos += t.amount;
      } catch (e) { //solo por si la fecha se manda mal
      }
    });
    return Object.values(days).sort((a, b) => a.name.localeCompare(b.name));
  }, [monthlyTransactions]);

  const PIE_COLORS = ['#10b981', '#22d3ee', '#059669', '#065f46', '#374151'];

  // Eventos de Teclado
  const handleBudgetClick = () => {
    setTempBudget(budget);
    setIsEditingBudget(true);
  };

  const handleBudgetKeyDown = (e) => {
    if (e.key === 'Enter') saveBudget();
    if (e.key === 'Escape') {
      setIsEditingBudget(false);
      setTempBudget(budget);
    }
  };

  // =====================================================================
  // 6. RENDERIZADO DE LA INTERFAZ (Tu diseño original intacto)
  // =====================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-darkpanel rounded-2xl shadow-lg border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-[Satoshi-Bold] text-white flex items-center gap-2">
            <Target className="text-emerald-400" />
            Predicción de Cierre de Mes
          </h2>
          <p className="text-sm text-gray-400 mt-1">Basado en tu comportamiento hasta el {format(analysisDate, "d 'de' MMMM", { locale: es })}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          <div className="p-6">
            <p className="text-sm font-medium text-gray-400 mb-2">Gasto Actual</p>
            <h3 className="text-3xl font-[Satoshi-Bold] text-white">${predictionStats.currentSpent.toFixed(0)}</h3>
            <div className="mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-linear-to-r from-emerald-400 to-cyan-400 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${Math.min((predictionStats.currentSpent / (budget || 1)) * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {budget > 0 ? ((predictionStats.currentSpent / budget) * 100).toFixed(1) : 0}% del presupuesto
            </p>
          </div>

          <div className="p-6 bg-white/5 relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${predictionStats.isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <p className="text-sm font-medium text-gray-400 mb-2 relative z-10">Proyección a Fin de Mes</p>
            <h3 className={`text-3xl font-[Satoshi-Bold] relative z-10 ${predictionStats.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
              ${predictionStats.projectedTotal.toFixed(0)}
            </h3>
            <div className="flex items-center gap-2 mt-4 relative z-10">
              {predictionStats.isOverBudget ? (
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                  <AlertTriangle size={16} />
                  <span>Excede presupuesto por ${(predictionStats.projectedTotal - budget).toFixed(0)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <CheckCircle size={16} />
                  <span>Dentro del presupuesto</span>
                </div>
              )}
            </div>
          </div>

          {/* TARJETA 3: PRESUPUESTO EDITABLE */}
          <div className="p-6">
            <p className="text-sm font-medium text-gray-400 mb-2">Presupuesto Definido</p>
            
            {/* Animación de carga si aún no llega el presupuesto del Backend */}
            {isLoadingBudget ? (
              <div className="h-9 flex items-center">
                 <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            ) : isEditingBudget ? (
              <div className="flex items-center text-3xl font-[Satoshi-Bold] text-white">
                <span className="mr-1">$</span>
                <input
                  type="number"
                  autoFocus
                  value={tempBudget}
                  onFocus={(e) => e.target.select()} 
                  onChange={(e) => setTempBudget(e.target.value === '' ? '' : Number(e.target.value))} 
                  onBlur={saveBudget}
                  onKeyDown={handleBudgetKeyDown}
                  className="bg-transparent border-b-2 border-emerald-400 outline-none w-24 text-white p-0 m-0 focus:ring-0 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ) : (
              <h3 
                onClick={handleBudgetClick}
                className="text-3xl font-[Satoshi-Bold] text-white cursor-pointer hover:text-emerald-400 transition-colors inline-flex items-center gap-2 group"
                title="Clic para editar"
              >
                ${budget}
                <Edit2 size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
              </h3>
            )}

            <p className="text-sm text-gray-400 mt-4">
              {predictionStats.currentSpent > budget ? (
                <>
                  ¡Excediste tu presupuesto por <span className="text-red-400 font-bold">${(predictionStats.currentSpent - budget).toFixed(0)}</span>!
                </>
              ) : (
                <>
                  Te quedan <span className="text-emerald-400 font-bold">${(budget - predictionStats.currentSpent).toFixed(0)}</span> disponibles para los días restantes.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 h-100 flex flex-col group hover:border-emerald-500/30 transition-colors duration-300">
          <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6">Flujo de Caja Diario</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="gastos" name="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 h-100 flex flex-col group hover:border-cyan-500/30 transition-colors duration-300">
          <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6">Distribución de Gastos</h3>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-8">
              <p className="text-xs text-gray-400">Total Gastado</p>
              <p className="text-xl font-[Satoshi-Bold] text-white">${predictionStats.currentSpent.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};