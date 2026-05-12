import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import SideBar from './SideBar'; 
import { TipsView } from './TipsView'; 
import { SettingsView } from './SettingsView'; 
import { AnalysisView } from './AnalysisView';
import { TransactionsView } from './TransactionsView';
import { HomeView } from './HomeView';  
import { Bell, User } from 'lucide-react';
import { SavingView } from './SavingsView';

// Importamos el archivo central de mocks
import { MOCK_TRANSACTIONS } from './MockData';

export const MainApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  
  // Referencia para el contenedor principal de GSAP
  const appRef = useRef(null);

  // Animación de entrada fluida con GSAP
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".gsap-sidebar", {
        x: -100,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out"
      })
      .from(".gsap-header", {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.5")
      .from(".gsap-content", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      }, "-=0.4");

    }, appRef);

    return () => ctx.revert(); // Limpieza para evitar bugs en React
  }, []);

  // TODO: BACKEND: Utilizar este useEffect para cargar las transacciones reales de la BD al iniciar sesión.
  useEffect(() => {
    /* Ejemplo de integración con axios o fetch:
    fetch('/api/transactions/user/123')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(error => console.error("Error cargando transacciones", error));
    */
  }, []);

  const handleAddTransaction = (newTx) => {
    // TODO: BACKEND: Reemplazar esta lógica local por un POST a la API.
    /*
    fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(newTx),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => setTransactions(prev => [data, ...prev]));
    */

    // Lógica local temporal para el frontend
    if (Array.isArray(newTx)) {
      const newTransactions = newTx.map(tx => ({
        ...tx,
        id: Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9),
      }));
      setTransactions(prev => [...newTransactions, ...prev]);
    } else {
      const transaction = {
        ...newTx,
        id: Math.random().toString(36).substr(2, 9),
      };
      setTransactions(prev => [transaction, ...prev]);
    }
  };

  return (
    // Agregamos el ref al contenedor principal
    <div ref={appRef} className="flex h-screen bg-darkbg font-sans text-white overflow-hidden">
      
      {/* Envolvemos el Sidebar con la clase gsap-sidebar */}
      <div className="gsap-sidebar h-full shrink-0 z-50">
        <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Agregamos la clase gsap-header al header */}
        <header className="gsap-header bg-darkbg/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-[Satoshi-Bold] text-white">
              {activeTab === 'dashboard' && 'Resumen Financiero'}
              {activeTab === 'tips' && 'Educación Financiera'}
              {activeTab === 'settings' && 'Configuración'}
              {activeTab === 'analysis' && 'Análisis Financiero'}
              {activeTab === 'transactions' && 'Ingresos y Egresos'}
              {}{activeTab === 'goals' && 'Ahorros y Metas'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">Panel de Control</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-emerald-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-emerald-950/50 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Agregamos la clase gsap-content al main */}
        <main className="gsap-content flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <HomeView />
              </div>
            )}
            {activeTab === 'tips' && <TipsView />}
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'analysis' && <AnalysisView transactions={transactions}/>}
            {activeTab === 'transactions' && <TransactionsView transactions={transactions} onAddTransaction={handleAddTransaction}/>}
            {activeTab === 'goals' && <SavingView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainApp;