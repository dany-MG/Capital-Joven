import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, PiggyBank, AlertTriangle, BookOpen, Target, Umbrella, Calculator, Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { format, addMonths } from 'date-fns'; // Importamos las herramientas de fechas

export const TipsView = () => {
  // =====================================================================
  // 1. ESTADOS LOCALES (Calculadora y UI)
  // =====================================================================
  const [showCalculator, setShowCalculator] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false); // Estado de carga para el botón de guardar
  
  const [income, setIncome] = useState(0);
  const [months, setMonths] = useState(3);
  
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Comida / Despensa', amount: 1500 },
    { id: 2, name: 'Transporte', amount: 600 },
  ]);
  
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // =====================================================================
  // 2. OBTENCIÓN DE DATOS PREVIOS (GET - Opcional)
  // =====================================================================
  useEffect(() => {
    // TODO: BACKEND - (Opcional) Traer el ingreso mensual del perfil del usuario para auto-llenar la calculadora.
    /* Ejemplo:
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if(data.incomeAmount) setIncome(data.incomeAmount);
      });
    */
  }, []);

  // =====================================================================
  // 3. MATEMÁTICAS DEL FRONTEND (En tiempo real)
  // =====================================================================
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

  // =====================================================================
  // 4. GUARDAR RESULTADO EN BASE DE DATOS (POST)
  // =====================================================================
  const handleSetGoal = async () => {
    setIsSavingGoal(true);

    // Cálculos de fecha automáticos
    const today = new Date();
    // Formato 'yyyy-MM-dd' estándar para bases de datos
    const dbStartDate = format(today, 'yyyy-MM-dd'); 
    const dbEndDate = format(addMonths(today, months), 'yyyy-MM-dd');

    // Fechas formateadas para mostrarlas bonitas al usuario (dd/MM/yyyy)
    const displayStartDate = format(today, 'dd/MM/yyyy');
    const displayEndDate = format(addMonths(today, months), 'dd/MM/yyyy');

    // TODO: BACKEND - Petición POST para crear una nueva "Meta de Ahorro" con fechas dinámicas
    /* Ejemplo real:
    try {
      const response = await fetch('/api/savings/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Fondo de Emergencia',
          description: `Fondo de seguridad para cubrir ${months} meses de gastos básicos.`,
          targetAmount: idealFund,
          currentAmount: 0,
          startDate: dbStartDate, // Inyectamos la fecha calculada
          endDate: dbEndDate      // Inyectamos el límite de 3 o 6 meses
        })
      });

      if (!response.ok) throw new Error("Error al guardar la meta");
      
      // Mostrar éxito y cerrar
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar la meta en este momento.', 'error');
    } finally {
      setIsSavingGoal(false);
    }
    */

    // Simulación Frontend
    setTimeout(() => {
      setIsSavingGoal(false);
      setShowCalculator(false); // Cerramos la calculadora tras guardar
      
      Swal.fire({
          title: '¡Meta Establecida!',
          html: `
            Tu fondo de emergencia de <b>$${idealFund.toLocaleString('es-MX')}</b> ha sido guardado en tus Metas de Ahorro.
            <br/><br/>
            <div style="font-size: 0.9em; text-align: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px;">
              <b>Inicio:</b> ${displayStartDate}<br/>
              <b>Objetivo final:</b> ${displayEndDate}
            </div>
            <br/>
            ¡Poco a poco llegarás al objetivo!
          `,
          icon: 'success',
          background: '#101010',
          color: '#ffffff', 
          confirmButtonColor: '#10b981', 
          confirmButtonText: '¡A ahorrar!',
          backdrop: `rgba(0,0,0,0.6)`, 
          customClass: {
            popup: 'border border-white/10 rounded-3xl shadow-2xl',
            confirmButton: 'px-8 py-3 rounded-full font-bold text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105',
          }
      });
    }, 1000);
  };

  // =====================================================================
  // 5. DATOS ESTÁTICOS (Tips)
  // =====================================================================
  // TODO: BACKEND - Estos tips podrían venir de un CMS o base de datos si desean hacerlos dinámicos en el futuro.
  const educationalTips = [
    { title: "La Regla 50/30/20", description: "Una fórmula simple para presupuestar: 50% para necesidades básicas, 30% para deseos y estilo de vida, y 20% para ahorro e inversión.", icon: Calculator },
    { title: "Interés Compuesto", description: "Es el interés sobre el interés. Empezar a invertir joven, aunque sea poco, permite que tu dinero crezca exponencialmente con el tiempo.", icon: TrendingUp },
    { title: "Gastos Hormiga", description: "Esos pequeños gastos diarios (café, snacks, propinas) que parecen insignificantes pero pueden sumar miles al año. ¡Identifícalos!", icon: AlertTriangle },
    { title: "Método Bola de Nieve", description: "Para pagar deudas: ordena tus deudas de menor a mayor saldo. Paga el mínimo de todas excepto la más pequeña, atácala con todo.", icon: Target }
  ];

  // =====================================================================
  // 6. RENDERIZADO DE LA INTERFAZ
  // =====================================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Sección Hero */}
      <div className="bg-darkpanel border border-white/5 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg hover:border-white/10 transition-colors duration-300">
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
              <span className="text-transparent bg-clip-text bg-[linear-gradient(to_right,#34d399,#22d3ee)]">Fondo de Emergencia</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Un fondo de emergencia es dinero reservado exclusivamente para imprevistos. Es tu cinturón de seguridad financiero para evitar deudas malas.
            </p>
            
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="bg-white/5 border border-white/10 hover:bg-emerald-500 hover:border-emerald-400 text-white hover:text-darkbg font-bold py-3.5 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transform hover:-translate-y-1 cursor-pointer">
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
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-darkbg font-bold flex items-center justify-center">1</div>
                <div>
                  <h4 className="font-bold text-white">Fondo Inicial ($1,000)</h4>
                  <p className="text-sm text-gray-400">Tu primer objetivo. Suficiente para cubrir reparaciones menores sin endeudarte.</p>
                </div>
              </div>
              <div className="w-0.5 h-6 bg-white/10 ml-4"></div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center">2</div>
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
                        <button onClick={() => removeExpense(exp.id)} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer">
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
                  <button type="submit" className="bg-white/10 hover:bg-emerald-500 hover:text-darkbg text-white p-2 rounded-lg transition-colors cursor-pointer">
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
                    <button onClick={() => setMonths(3)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${months === 3 ? 'bg-emerald-500 text-darkbg' : 'text-gray-400 hover:text-white'}`}>3 Meses</button>
                    <button onClick={() => setMonths(6)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${months === 6 ? 'bg-emerald-500 text-darkbg' : 'text-gray-400 hover:text-white'}`}>6 Meses</button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider block mb-1">Tu Fondo Ideal</span>
                  <span className="text-4xl font-[Satoshi-Bold] text-white">${idealFund.toLocaleString('es-MX')}</span>
                </div>
              </div>

              {/* Botón con Estado de Carga */}
              <button 
                onClick={handleSetGoal} 
                disabled={idealFund === 0 || isSavingGoal} 
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-darkbg font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSavingGoal ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
                {isSavingGoal ? 'Guardando Meta...' : 'Establecer como Meta de Ahorro'}
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
      <div className="bg-darkpanel border border-emerald-500/20 rounded-2xl p-8 text-center relative overflow-hidden group hover:border-white/10 transition-colors duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810d,#06b6d40d)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <PiggyBank size={48} className="mx-auto text-emerald-400 mb-4 relative z-10" />
        <h3 className="text-xl font-[Satoshi-Bold] text-white mb-2 relative z-10">¿Listo para mejorar tus finanzas?</h3>
        <p className="text-gray-400 max-w-lg mx-auto mb-0 relative z-10">
          La educación financiera no es sobre ser rico rápidamente, es sobre tomar el control de tu vida y reducir el estrés por dinero.
        </p>
      </div>

    </div>
  );
};