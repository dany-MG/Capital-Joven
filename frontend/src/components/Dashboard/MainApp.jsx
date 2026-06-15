import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import SideBar from './SideBar'; 
import { TipsView } from './TipsView'; 
import { SettingsView } from './SettingsView'; 
import { AnalysisView } from './AnalysisView';
import { TransactionsView } from './TransactionsView';
import { HomeView } from './HomeView';  
import { Settings, ArrowRight, Loader2, Menu } from 'lucide-react';
import { SavingView } from './SavingsView';
import { AssesorView } from './AssesorView';

export const MainApp = () => {
  // =====================================================================
  // 1. ESTADOS PRINCIPALES (Data Driven)
  // =====================================================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const [showOnBoarding, setShowOnboarding] = useState(false); // Para mostrar el onboarding solo la primera vez
  const [onboardData, setOnboardData] = useState({source: 'Nomina', 'amount':0})
  const  [isOnboardingSubmit, setIsOnboardingSubmit] = useState(false);
  
  // Estados para datos del Backend
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // =====================================================================
  // 2. REFERENCIAS (DOM & GSAP)
  // =====================================================================
  const appRef = useRef(null);
  const userMenuRef = useRef(null);

  // =====================================================================
  // 3. CONEXIÓN CON EL BACKEND (Carga y Recarga de datos)
  // =====================================================================
  const cargarDatos = async () => {
    try {
      // Solo mostramos la pantalla de carga completa si es la primera vez
      if (transactions.length === 0) setIsLoading(true);
      
      const options = { method: 'GET', credentials: 'include' };
      
      const [perfilRes, billsRes, incomesRes] = await Promise.all([
        fetch('https://capital-joven.onrender.com/user/profile', options),
        fetch('https://capital-joven.onrender.com/bill/', options),
        fetch('https://capital-joven.onrender.com/income/', options)
      ]);

      if (!perfilRes.ok) {
        window.location.href = '/login';
        return;
      }

      const perfilData = await perfilRes.json();
      
      setUserProfile({
        firstname: perfilData.firstname || '',
        lastname: perfilData.lastname || '',
        email: perfilData.email || '',
        university: perfilData.university || 'Sin institución', 
        avatarUrl: perfilData.avatarUrl || ''
      });

      let dbTransactions = [];

      // Procesamos los Gastos (Bills) e inyectamos el 'type' de forma implícita
      if (billsRes.ok) {
        const billsData = await billsRes.json();
        dbTransactions = dbTransactions.concat(
          billsData.map(b => ({
            id: b.bill_id || b.id || b._id,
            date: b.date || new Date().toISOString(), 
            category: b.category || 'Otros',
            description: b.title || b.description,
            amount: parseFloat(b.amount) || 0,
            type: 'expense'
          }))
        );
      }

      // Procesamos los Ingresos (Incomes)
      if (incomesRes.ok) {
        const incomesData = await incomesRes.json();
        dbTransactions = dbTransactions.concat(
          incomesData.map(i => ({
            id: i.income_id || i.id || i._id,
            date: i.date || new Date().toISOString(), 
            category: i.origin || 'Otros',
            description: i.title || i.description,
            amount: parseFloat(i.amount) || 0,
            type: 'income'
          }))
        );
      }

      setTransactions(dbTransactions);

      const hasOnBoard = localStorage.getItem(`onboarded_${perfilData.email}`)
      if (dbTransactions.length === 0 && !hasOnBoard){
        setShowOnboarding(true);
      }

    } catch (error) {
      console.error("Error al conectar con el servidor de Capital Joven:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // =====================================================================
  // FUNCIÓN DE ONBOARDING
  // =====================================================================
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    if (!onboardData.amount) return;
    setIsOnboardingSubmit(true);

    const amount = parseFloat(onboardData.amount);

    // 1. Guardamos el presupuesto en el navegador (Para que AnalysisView lo lea)
    localStorage.setItem('capitalJoven_budget', amount.toString());
    
    // 2. Marcamos que este usuario ya hizo el onboarding para que no le vuelva a salir
    localStorage.setItem(`onboarded_${userProfile.email}`, 'true');

    // 3. Preparamos el primer ingreso para el backend
    const backendPayload = {
      title: 'Saldo Inicial',
      amount: amount,
      description: 'Mi primer registro en Capital Joven',
      date: new Date().toISOString(),
      frequency: "Único",
      origin: onboardData.source
    };

    try {
      const response = await fetch('https://capital-joven.onrender.com/income/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(backendPayload)
      });

      if (!response.ok) throw new Error('Error al registrar el saldo inicial');

      // Cerramos el modal, recargamos los datos y damos la bienvenida
      setShowOnboarding(false);
      cargarDatos(); 

      Swal.fire({
        title: '¡Todo listo!',
        text: 'Tu perfil está configurado. ¡Bienvenido a Capital Joven!',
        icon: 'success',
        background: '#101010', color: '#ffffff', confirmButtonColor: '#10b981'
      });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar la configuración inicial.', 'error');
    } finally {
      setIsOnboardingSubmit(false);
    }
  };

  // =====================================================================
  // 4. LÓGICA DE INTERFAZ Y EVENTOS
  // =====================================================================
  
  // Cierre del menú de usuario al dar clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Animación GSAP (Solo corre cuando ya no está cargando)
  useEffect(() => {
    if (isLoading) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".gsap-sidebar", { x: -100, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" })
        .from(".gsap-header", { y: -30, opacity: 0, duration: 0.6, ease: "power3.out", clearProps: "transform" }, "-=0.5")
        .from(".gsap-content", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out", clearProps: "transform" }, "-=0.4");
    }, appRef);

    return () => ctx.revert(); 
  }, [isLoading]);

  // Sincronización activa con la Base de Datos en lugar de mutación local
  const handleAddTransaction = () => cargarDatos();
  const handleUpdateTransaction = () => cargarDatos();
  const handleDeleteTransaction = () => cargarDatos();

  const showUserInfo = () => setShowUserMenu(!showUserMenu);
  
  // =====================================================================
  // 5. PANTALLA DE CARGA (Loading Screen)
  // =====================================================================
  if (isLoading || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-darkbg text-emerald-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-gray-400 font-[Satoshi-Medium]">Iniciando entorno de Capital Joven...</p>
      </div>
    );
  }

  // =====================================================================
  // 6. RENDER PRINCIPAL DEL DASHBOARD
  // =====================================================================
  return (
    <div ref={appRef} className="flex h-screen bg-darkbg font-sans text-white overflow-hidden">
      
      <div className="gsap-sidebar h-full shrink-0 z-50">
        <SideBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userProfile={userProfile} 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen} 
        />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <header className="gsap-header bg-darkbg/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Menu size={24} />
            </button>
            
            <div>
              <h2 className="text-xl md:text-2xl font-[Satoshi-Bold] text-white">
                {activeTab === 'dashboard' && 'Tu Resumen Financiero'}
                {activeTab === 'tips' && 'Tips para tu Economía'}
                {activeTab === 'settings' && 'Configuración de Perfil'}
                {activeTab === 'analysis' && 'Tu Análisis Financiero'}
                {activeTab === 'transactions' && 'Tus Ingresos y Egresos'}
                {activeTab === 'goals' && 'Tus Ahorros y Metas'}
                {activeTab === 'aiAssesor' && 'Tu Asesor IA'}
              </h2>
              <p className="text-gray-400 text-sm mt-1 hidden md:block">Panel de Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            
            <div className="relative" ref={userMenuRef}>
              <div onClick={showUserInfo} className="w-10 h-10 rounded-full bg-emerald-950/50 flex items-center justify-center text-emerald-400 border border-emerald-500/30 cursor-pointer hover:bg-emerald-600/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                <span className="font-[Satoshi-Bold] text-sm">{userProfile.firstname?.[0] || ''}{userProfile.lastname?.[0] || ''}</span>
              </div>

              {showUserMenu && (
                <>
                  <div className="absolute right-0 mt-3 w-72 bg-[#101010]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div className="p-6 border-b border-white/5 bg-white/2 relative overflow-hidden flex flex-col items-center">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                      
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full bg-emerald-950/50 border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          <span className="text-emerald-400 text-3xl font-[Satoshi-Bold] uppercase tracking-wider">
                            {userProfile.firstname?.charAt(0) || ''}
                            {userProfile.lastname?.charAt(0) || ''}
                          </span>
                        </div>
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-4 border-[#101010] rounded-full"></div>
                      </div>

                      <div className="text-center relative z-10">
                        <p className="font-[Satoshi-Bold] text-white text-xl leading-tight">
                          {userProfile.firstname} {userProfile.lastname}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">{userProfile.email}</p>
                        
                        <div className="mt-4 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                            {userProfile.university}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-emerald-500/10 rounded-2xl transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Settings size={18} className="text-emerald-400 group-hover:rotate-45 transition-transform duration-500" />
                          Modificar Perfil
                        </div>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="gsap-content flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <HomeView setActiveTab={setActiveTab} />
              </div>
            )}
            {activeTab === 'tips' && <TipsView />}
            
            {activeTab === 'settings' && <SettingsView initialUserData={userProfile} onProfileUpdate={setUserProfile} />}
            
            {activeTab === 'analysis' && <AnalysisView transactions={transactions}/>}
            {activeTab === 'transactions' && (
              <TransactionsView 
                transactions={transactions} 
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}
            {activeTab === 'goals' && <SavingView onTransactionAdded={handleAddTransaction} />}
            {activeTab === 'aiAssesor' && <AssesorView userProfile={userProfile} transactions={transactions} />}
          </div>
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL DE BIENVENIDA (ONBOARDING) */}
      {/* ===================================================================== */}
      {showOnBoarding && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-darkpanel bg-zinc-900/90 rounded-3xl shadow-2xl border border-emerald-500/30 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500">
            
            <div className="p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
               <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4]">
                  <span className="text-4xl font-[Satoshi-Bold] text-emerald-400"><img src="/logo.png" alt="Logo" /></span>
               </div>
               <h2 className="text-2xl font-[Satoshi-Bold] text-white">¡Hola, {userProfile?.firstname}!</h2>
               <p className="text-gray-400 mt-2">Para darte la mejor experiencia, configuremos tu punto de partida.</p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="p-8 pt-0 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Tu principal fuente de ingresos</label>
                  <select
                    value={onboardData.source}
                    onChange={(e) => setOnboardData({...onboardData, source: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-darkbg border border-white/10 focus:border-emerald-500/50 outline-none text-white"
                  >
                    <option value="Nomina" className='bg-zinc-900'>Salario / Nómina</option>
                    <option value="Beca" className='bg-zinc-900'>Beca Estudiantil</option>
                    <option value="Ventas" className='bg-zinc-900'>Freelance / Proyectos</option>
                    <option value="Otros" className='bg-zinc-900'>Apoyo familiar / Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Monto mensual aproximado ($)</label>
                  <input 
                    type="number" 
                    required
                    value={onboardData.amount}
                    onChange={(e) => setOnboardData({...onboardData, amount: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-darkbg border border-white/10 focus:border-emerald-500/50 outline-none text-white text-lg font-[Satoshi-Bold]"
                    placeholder="Ej. 3000"
                  />
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3 text-sm text-emerald-400/90 leading-relaxed">
                <span className="shrink-0">💡</span>
                <p>
                  Usaremos este monto como tu <b>Presupuesto Mensual Inicial</b> para tus gráficas de análisis. No te preocupes, <b>podrás modificarlo más adelante</b> en la pestaña de Análisis.
                </p>
              </div>

              <button
                type="submit"
                disabled={isOnboardingSubmit || !onboardData.amount}
                className="w-full flex justify-center items-center gap-2 font-bold py-3.5 px-4 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOnboardingSubmit ? <Loader2 size={20} className="animate-spin" /> : null}
                {isOnboardingSubmit ? 'Configurando...' : 'Comenzar mi aventura'}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
    
  );
};

export default MainApp;