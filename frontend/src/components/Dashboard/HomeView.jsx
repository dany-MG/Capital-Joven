import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, TrendingUp as TrendingUpIcon, AlertCircle, Lightbulb, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { MOCK_CHART_DATA, MOCK_RECENT_TRANSACTIONS } from './MockData';

// Componente reutilizable para las tarjetas de métricas
const StatsCard = ({ title, value, trend, isPositive, icon: Icon, colorType }) => {
  const isEmerald = colorType === 'emerald';
  const isRed = colorType === 'red';
  
  return (
    <div className="bg-darkpanel border border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors duration-300">
      <div className={`absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 group-hover:scale-110 ${isEmerald ? 'text-emerald-400' : isRed ? 'text-red-400' : 'text-cyan-400'}`}>
        <Icon size={80} />
      </div>
      
      <p className="text-sm font-medium text-gray-400 mb-2 relative z-10">{title}</p>
      <h3 className="text-3xl font-[Satoshi-Bold] text-white relative z-10 mb-3">${value.toLocaleString('es-MX')}</h3>
      
      <div className="flex items-center gap-2 relative z-10">
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? '+' : ''}{trend}%
        </span>
        <span className="text-xs text-gray-500">vs mes anterior</span>
      </div>
    </div>
  );
};

export const HomeView = () => {
  // =====================================================================
  // 1. ESTADOS LOCALES PARA EL BACKEND
  // =====================================================================
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Objeto centralizado para todas las métricas del Dashboard
  const [metrics, setMetrics] = useState({
    balanceTotal: 0,
    balanceTrend: 0,
    ingresosMensuales: 0,
    ingresosTrend: 0,
    gastosTotales: 0,
    gastosTrend: 0,
    prediccionGastoActual: 0,
    prediccionProyeccion: 0,
    metaAhorroNombre: "",
    metaAhorroActual: 0,
    metaAhorroObjetivo: 0
  });

  // =====================================================================
  // 2. OBTENCIÓN DE DATOS (GET)
  // =====================================================================
  useEffect(() => {
    // TODO: BACKEND - Aquí deben hacer el fetch de los datos del Dashboard
    /* Ejemplo de implementación real:
    Promise.all([
      fetch('/api/dashboard/metrics').then(res => res.json()),
      fetch('/api/dashboard/trend-chart').then(res => res.json()),
      fetch('/api/transactions/recent?limit=5').then(res => res.json())
    ])
    .then(([metricsData, chartRes, transactionsRes]) => {
      setMetrics(metricsData);
      setChartData(chartRes);
      setRecentTransactions(transactionsRes);
      setIsLoading(false);
    })
    .catch(error => console.error("Error al cargar el dashboard:", error));
    */

    // Simulación temporal para el Frontend
    setTimeout(() => {
      setMetrics({
        balanceTotal: 3325,
        balanceTrend: 12,
        ingresosMensuales: 3850,
        ingresosTrend: 5,
        gastosTotales: 525,
        gastosTrend: -2,
        prediccionGastoActual: 850,
        prediccionProyeccion: 1250,
        metaAhorroNombre: "Vacaciones de Verano",
        metaAhorroActual: 2450,
        metaAhorroObjetivo: 5000
      });
      setChartData(MOCK_CHART_DATA);
      setRecentTransactions(MOCK_RECENT_TRANSACTIONS);
      setIsLoading(false);
    }, 1000);
  }, []);

  // =====================================================================
  // 3. PANTALLA DE CARGA
  // =====================================================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-emerald-400 animate-in fade-in">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-gray-400 font-[Satoshi-Medium]">Analizando tus finanzas...</p>
      </div>
    );
  }

  // Cálculos derivados seguros (Frontend)
  const metaAhorroPorcentaje = metrics.metaAhorroObjetivo > 0 
    ? (metrics.metaAhorroActual / metrics.metaAhorroObjetivo) * 100 
    : 0;
  const prediccionPorcentaje = metrics.prediccionProyeccion > 0 
    ? (metrics.prediccionGastoActual / metrics.prediccionProyeccion) * 100 
    : 0;

  // =====================================================================
  // 4. RENDERIZADO DE LA INTERFAZ
  // =====================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* TARJETAS PRINCIPALES (Métricas dinámicas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Balance Total" 
          value={metrics.balanceTotal} 
          trend={metrics.balanceTrend} 
          isPositive={metrics.balanceTrend >= 0} 
          icon={Wallet} 
          colorType="emerald" 
        />
        <StatsCard 
          title="Ingresos Mensuales" 
          value={metrics.ingresosMensuales} 
          trend={metrics.ingresosTrend} 
          isPositive={metrics.ingresosTrend >= 0} 
          icon={TrendingUp} 
          colorType="cyan" 
        />
        <StatsCard 
          title="Gastos Totales" 
          value={metrics.gastosTotales} 
          trend={metrics.gastosTrend} 
          isPositive={metrics.gastosTrend <= 0} // Gastar menos (tendencia negativa) es positivo para la UI
          icon={TrendingDown} 
          colorType="red" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          
          {/* GRÁFICA DE TENDENCIAS */}
          <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 h-105 flex flex-col group hover:border-white/10 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
              <h3 className="text-lg font-[Satoshi-Bold] text-white">Tendencia de Gastos vs Predicción</h3>
            </div>
            
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400/80"></span>
                <span className="text-sm text-gray-400">Predicción</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80"></span>
                <span className="text-sm text-gray-400">Gasto Real</span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="predicted" name="Predicción" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" />
                  <Area type="monotone" dataKey="real" name="Gasto Real" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TRANSACCIONES RECIENTES */}
          <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 hover:border-white/10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-[Satoshi-Bold] text-white">Transacciones Recientes</h3>
              {/* TODO: BACKEND - Conectar este botón para cambiar de vista a TransactionsView */}
              <button className="text-emerald-400 text-sm font-medium hover:underline cursor-pointer">Ver Todo</button>
            </div>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl border ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-[Satoshi-Bold] text-white">{tx.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-[Satoshi-Bold] text-lg ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-MX')}
                  </span>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">No hay transacciones recientes.</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA LATERAL (Widgets de Estado) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* WIDGET: PREDICCIÓN SEMANAL */}
          <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 group hover:border-emerald-500/30 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <TrendingUpIcon size={20} />
              </div>
              <h3 className="text-lg font-[Satoshi-Bold] text-white">Predicción Semanal</h3>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-400">Gasto Actual</span>
                <span className="font-[Satoshi-Bold] text-white">${metrics.prediccionGastoActual.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-500">Proyección</span>
                <span className="text-sm text-gray-400">${metrics.prediccionProyeccion.toLocaleString('es-MX')}</span>
              </div>
              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-400 h-full rounded-l-full transition-all duration-1000" style={{ width: `${prediccionPorcentaje}%` }}></div>
                <div className="bg-white/10 h-full rounded-r-full transition-all duration-1000" style={{ width: `${100 - prediccionPorcentaje}%` }}></div>
              </div>
            </div>
            
            {/* TODO: BACKEND - Lógica para mostrar la alerta condicionalmente */}
            {metrics.prediccionGastoActual > metrics.prediccionProyeccion * 0.8 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start animate-in zoom-in duration-300">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300 leading-relaxed">
                  Basado en tus hábitos, podrías superar tu presupuesto esta semana.
                </p>
              </div>
            )}
          </div>

          {/* WIDGET: META DE AHORRO */}
          <div className="bg-[linear-gradient(to_bottom_right,#022c22,#101010)] p-6 rounded-2xl shadow-lg border border-emerald-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-emerald-400 transition-transform duration-500 group-hover:scale-110">
              <Wallet size={80} />
            </div>
            <h3 className="text-xl font-[Satoshi-Bold] text-white mb-2 relative z-10">Meta de Ahorro</h3>
            <p className="text-emerald-400 text-sm mb-6 relative z-10">{metrics.metaAhorroNombre || "Sin meta activa"}</p>
            <div className="flex justify-between items-end mb-3 relative z-10">
              <span className="text-3xl font-bold text-white">${metrics.metaAhorroActual.toLocaleString('es-MX')}</span>
              <span className="text-sm text-gray-400">de ${metrics.metaAhorroObjetivo.toLocaleString('es-MX')}</span>
            </div>
            <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden relative z-10">
              <div className="bg-[linear-gradient(to_right,#34d399,#22d3ee)] h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${metaAhorroPorcentaje}%` }}></div>
            </div>
          </div>

          {/* WIDGET: TIP DEL DÍA (Estático o Aleatorio desde el backend) */}
          <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 group hover:border-cyan-500/30 transition-colors duration-300">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                <Lightbulb size={20} />
              </div>
            </div>
            {/* TODO: BACKEND - Podrían inyectar un tip aleatorio distinto cada día */}
            <h4 className="font-[Satoshi-Bold] text-white mb-2">Evita Deudas Hormiga</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Registra cada pequeño gasto. Ese café diario suma más de $900 al mes. ¡Mantén el control!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};