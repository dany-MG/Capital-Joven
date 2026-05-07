import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Target, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { format, endOfMonth, getDaysInMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const AnalysisView = ({ transactions = [] }) => {
  // Configuración simulada
  const [budget] = useState(2000); // Presupuesto mensual ejemplo
  const analysisDate = new Date('2023-10-15'); // Simulamos que hoy es 15 de Octubre para la predicción
  
  // Filtrar transacciones del mes de análisis (Octubre)
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith('2023-10'));
  }, [transactions]);

  // 1. Cálculos de Predicción
  const predictionStats = useMemo(() => {
    const currentSpent = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const daysInMonth = getDaysInMonth(analysisDate);
    const dayOfMonth = analysisDate.getDate();
    
    // Gasto promedio diario hasta hoy
    const dailyAvg = currentSpent / dayOfMonth;
    
    // Proyección a fin de mes
    const projectedTotal = dailyAvg * daysInMonth;
    const isOverBudget = projectedTotal > budget;

    return {
      currentSpent,
      projectedTotal,
      isOverBudget,
      remainingBudget: budget - currentSpent,
      dailyAvg
    };
  }, [monthlyTransactions, budget, analysisDate]);

  // 2. Datos para Gráfico de Categorías (Pie Chart)
  const categoryData = useMemo(() => {
    const categories = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [monthlyTransactions]);

  // 3. Datos para Gráfico de Barras (Ingresos vs Gastos)
  const barData = useMemo(() => {
    // Agrupar por días simples para el ejemplo
    const days = {};
    
    monthlyTransactions.forEach(t => {
      const day = format(parseISO(t.date), 'dd MMM', { locale: es });
      if (!days[day]) days[day] = { name: day, ingresos: 0, gastos: 0 };
      
      if (t.type === 'income') days[day].ingresos += t.amount;
      else days[day].gastos += t.amount;
    });

    return Object.values(days).sort((a, b) => a.name.localeCompare(b.name));
  }, [monthlyTransactions]);

  // Colores para el Pie Chart (Adaptados al tema Esmeralda/Cian oscuro)
  const PIE_COLORS = ['#10b981', '#22d3ee', '#059669', '#065f46', '#374151'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Sección de Predicción Principal */}
      <div className="bg-darkpanel rounded-2xl shadow-lg border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-[Satoshi-Bold] text-white flex items-center gap-2">
            <Target className="text-emerald-400" />
            Predicción de Cierre de Mes
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Basado en tu comportamiento hasta el 15 de Octubre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          
          {/* Tarjeta 1: Estado Actual */}
          <div className="p-6">
            <p className="text-sm font-medium text-gray-400 mb-2">Gasto Actual</p>
            <h3 className="text-3xl font-[Satoshi-Bold] text-white">${predictionStats.currentSpent.toFixed(0)}</h3>
            <div className="mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${(predictionStats.currentSpent / budget) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {(predictionStats.currentSpent / budget * 100).toFixed(1)}% del presupuesto
            </p>
          </div>

          {/* Tarjeta 2: Predicción */}
          <div className="p-6 bg-white/5 relative overflow-hidden group">
             {/* Brillo sutil de fondo */}
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

          {/* Tarjeta 3: Presupuesto Total */}
          <div className="p-6">
            <p className="text-sm font-medium text-gray-400 mb-2">Presupuesto Definido</p>
            <h3 className="text-3xl font-[Satoshi-Bold] text-white">${budget}</h3>
            <p className="text-sm text-gray-400 mt-4">
              Te quedan <span className="text-emerald-400 font-bold">${(budget - predictionStats.currentSpent).toFixed(0)}</span> disponibles para los días restantes.
            </p>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Barras: Ingresos vs Gastos */}
        <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 h-[400px] flex flex-col group hover:border-emerald-500/30 transition-colors duration-300">
          <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6">Flujo de Caja Diario</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {/* Cuadrícula adaptada a modo oscuro */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                />
                {/* Tooltip adaptado a modo oscuro */}
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                {/* Colores de barras: Esmeralda y Rojo */}
                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="gastos" name="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Circular: Distribución de Gastos */}
        <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 h-[400px] flex flex-col group hover:border-cyan-500/30 transition-colors duration-300">
          <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6">Distribución de Gastos</h3>
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                {/* Tooltip oscuro */}
                <Tooltip 
                   contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Texto Central del Donut adaptado */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-8">
              <p className="text-xs text-gray-400">Total Gastado</p>
              <p className="text-xl font-[Satoshi-Bold] text-white">${predictionStats.currentSpent}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};