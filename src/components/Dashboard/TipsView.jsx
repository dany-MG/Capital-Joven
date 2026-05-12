import React, { useState } from 'react';
import { Shield, TrendingUp, PiggyBank, AlertTriangle, BookOpen, Target, Umbrella, Calculator, Plus, Trash2, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

export const TipsView = () => {
  // Estados para la calculadora
  const [showCalculator, setShowCalculator] = useState(false);
  const [income, setIncome] = useState(0);
  const [months, setMonths] = useState(3);
  
  // Lista de gastos dinámicos
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Comida / Despensa', amount: 1500 },
    { id: 2, name: 'Transporte', amount: 600 },
  ]);
  
  // Estados para nuevos gastos
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Matemáticas de la calculadora
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const idealFund = totalExpenses * months;
  const savingCapacity = income - totalExpenses;

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseAmount) return;
    
    setExpenses([
      ...expenses, 
      { id: Date.now(), name: newExpenseName, amount: Number(newExpenseAmount) }
    ]);
    setNewExpenseName('');
    setNewExpenseAmount('');
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleSetGoal = () => {
    // Aquí iría la lógica del Backend para guardar la meta de ahorro

    Swal.fire({
        title: '¡Meta Establecida!',
        html: `Tu fondo de emergencia ideal de <b>$${idealFund.toLocaleString('es-MX')}</b> ha sido guardado en tus Metas de Ahorro. <br/><br/> ¡Poco a poco llegarás al objetivo!`,
        icon: 'success',
        background: '#101010', // Color de fondo darkpanel
        color: '#ffffff', // Texto en blanco
        confirmButtonColor: '#10b981', // Color bg-emerald-500
        confirmButtonText: '¡A ahorrar!',
        backdrop: `rgba(0,0,0,0.6)`, // Fondo oscurecido detrás de la alerta
        customClass: {
          // Inyectamos las clases de Tailwind para redondear bordes y dar estilo
          popup: 'border border-white/10 rounded-3xl shadow-2xl',
          confirmButton: 'px-8 py-3 rounded-full font-bold text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105',
        }
      });
      setShowCalculator(false); // Cerramos la calculadora tras guardar
  };

  const educationalTips = [
    {
      title: "La Regla 50/30/20",
      description: "Una fórmula simple para presupuestar: 50% para necesidades básicas, 30% para deseos y estilo de vida, y 20% para ahorro e inversión.",
      icon: Calculator,
    },
    {
      title: "Interés Compuesto",
      description: "Es el interés sobre el interés. Empezar a invertir joven, aunque sea poco, permite que tu dinero crezca exponencialmente con el tiempo.",
      icon: TrendingUp,
    },
    {
      title: "Gastos Hormiga",
      description: "Esos pequeños gastos diarios (café, snacks, propinas) que parecen insignificantes pero pueden sumar miles al año. ¡Identifícalos!",
      icon: AlertTriangle,
    },
    {
      title: "Método Bola de Nieve",
      description: "Para pagar deudas: ordena tus deudas de menor a mayor saldo. Paga el mínimo de todas excepto la más pequeña, atácala con todo.",
      icon: Target,
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Sección Hero */}
      <div className="bg-darkpanel border border-white/5 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Shield size={14} />
              Estrategia Recomendada
            </div>
            <h2 className="text-4xl md:text-5xl font-[Satoshi-Bold] mb-4 leading-tight">
              Construye tu <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">Fondo de Emergencia</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Un fondo de emergencia es dinero reservado exclusivamente para imprevistos. Es tu cinturón de seguridad financiero para evitar deudas malas.
            </p>
            
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="bg-white/5 border border-white/10 hover:bg-emerald-500 hover:border-emerald-400 text-white hover:text-darkbg font-bold py-3.5 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transform hover:-translate-y-1">
              {showCalculator ? 'Ocultar Calculadora' : 'Calcular mi Fondo Ideal'}
            </button>
          </div>

          {/* Rutas de seguridad */}
          <div className="bg-darkbg/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5">
            <h3 className="text-xl font-[Satoshi-Bold] mb-6 flex items-center gap-2">
              <Umbrella className="text-emerald-400" />
              La Ruta de Seguridad
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-darkbg font-bold flex items-center justify-center">1</div>
                <div>
                  <h4 className="font-bold text-white">Fondo Inicial ($1,000)</h4>
                  <p className="text-sm text-gray-400">Tu primer objetivo. Suficiente para cubrir reparaciones menores sin endeudarte.</p>
                </div>
              </div>
              <div className="w-0.5 h-6 bg-white/10 ml-4"></div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center">2</div>
                <div>
                  <h4 className="font-bold text-white">3 Meses de Gastos</h4>
                  <p className="text-sm text-gray-400">Cubre tus necesidades básicas (renta, comida, servicios) por un trimestre.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CALCULADORA EXPANDIBLE */}
      {showCalculator && (
        <div className="bg-darkpanel border border-emerald-500/30 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-2xl font-[Satoshi-Bold] text-white mb-2 flex items-center gap-2">
            <Calculator className="text-emerald-400" />
            Calculadora de Fondo de Emergencia
          </h3>
          <p className="text-gray-400 mb-8">Ingresa tus ingresos y gastos <b>esenciales</b> (lo mínimo para sobrevivir un mes).</p>

          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Formulario de Datos */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider block mb-2">Ingreso Mensual Promedio</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    type="number" 
                    value={income || ''} 
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all" 
                    placeholder="Ej. 5000"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider block mb-4">Tus Gastos Esenciales</label>
                
                {/* Lista de gastos */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {expenses.map(exp => (
                    <div key={exp.id} className="flex justify-between items-center bg-darkbg p-3 rounded-lg border border-white/5">
                      <span className="text-white font-medium">{exp.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300">${exp.amount.toLocaleString('es-MX')}</span>
                        <button onClick={() => removeExpense(exp.id)} className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && <p className="text-gray-500 text-sm text-center py-2">No has agregado gastos.</p>}
                </div>

                {/* Agregar nuevo gasto */}
                <form onSubmit={handleAddExpense} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    placeholder="Ej. Renta" 
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500/50 outline-none text-white text-sm"
                  />
                  <input 
                    type="number" 
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    placeholder="$ Monto" 
                    className="w-28 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500/50 outline-none text-white text-sm"
                  />
                  <button type="submit" className="bg-white/10 hover:bg-emerald-500 hover:text-darkbg text-white p-2 rounded-lg transition-colors">
                    <Plus size={20} />
                  </button>
                </form>
              </div>
            </div>

            {/* Resultados y Proyección */}
            <div className="bg-darkbg/50 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">Tu Diagnóstico</h4>
                
                <div className="flex justify-between items-end mb-4">
                  <span className="text-gray-300">Total Gastos Esenciales:</span>
                  <span className="text-xl font-bold text-white">${totalExpenses.toLocaleString('es-MX')} /mes</span>
                </div>
                
                {income > 0 && (
                  <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/5">
                    <span className="text-gray-300">Capacidad de Ahorro:</span>
                    <span className={`text-lg font-bold ${savingCapacity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${savingCapacity.toLocaleString('es-MX')} /mes
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-gray-300 text-sm block mb-3">¿Cuántos meses de seguridad quieres?</label>
                  <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-max">
                    <button onClick={() => setMonths(3)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${months === 3 ? 'bg-emerald-500 text-darkbg' : 'text-gray-400 hover:text-white'}`}>3 Meses</button>
                    <button onClick={() => setMonths(6)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${months === 6 ? 'bg-emerald-500 text-darkbg' : 'text-gray-400 hover:text-white'}`}>6 Meses</button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider block mb-1">Tu Fondo Ideal</span>
                  <span className="text-4xl font-[Satoshi-Bold] text-white">${idealFund.toLocaleString('es-MX')}</span>
                </div>
              </div>

              <button onClick={handleSetGoal} disabled={idealFund === 0} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-darkbg font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Target size={18} />
                Establecer como Meta de Ahorro
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Grid de Tips Educativos */}
      <div>
        <h3 className="text-2xl font-[Satoshi-Bold] text-white mb-6 flex items-center gap-2">
          <BookOpen className="text-emerald-400" />
          Conceptos Clave
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {educationalTips.map((tip, index) => (
            <div key={index} className="bg-darkpanel p-6 rounded-2xl shadow-sm border border-white/5 hover:border-emerald-500/30 hover:bg-white/5 transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300">
                  <tip.icon size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-[Satoshi-Bold] text-white mb-2">{tip.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner de Motivación */}
      <div className="bg-darkpanel border border-emerald-500/20 rounded-2xl p-8 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <PiggyBank size={48} className="mx-auto text-emerald-400 mb-4 relative z-10" />
        <h3 className="text-xl font-[Satoshi-Bold] text-white mb-2 relative z-10">¿Listo para mejorar tus finanzas?</h3>
        <p className="text-gray-400 max-w-lg mx-auto mb-0 relative z-10">
          La educación financiera no es sobre ser rico rápidamente, es sobre tomar el control de tu vida y reducir el estrés por dinero.
        </p>
      </div>

    </div>
  );
};