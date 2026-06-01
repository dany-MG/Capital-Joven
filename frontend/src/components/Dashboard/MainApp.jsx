import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import SideBar from './SideBar'; 
import { TipsView } from './TipsView'; 
import { SettingsView } from './SettingsView'; 
import { AnalysisView } from './AnalysisView';
import { TransactionsView } from './TransactionsView';
import { HomeView } from './HomeView';  
import { Bell, User, Settings, ArrowRight, Loader2, Menu } from 'lucide-react';
import { SavingView } from './SavingsView';
import { AssesorView } from './AssesorView';

// Importamos los mocks solo para la simulación temporal
import { MOCK_TRANSACTIONS, MOCK_USER_PROFILE } from './MockData';

export const MainApp = () => {
  // =====================================================================
  // 1. ESTADOS PRINCIPALES (Data Driven)
  // =====================================================================
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para el menú móvil
  
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
  // 3. CONEXIÓN CON EL BACKEND (Carga inicial de datos)
  // =====================================================================
  useEffect(() => {
    const cargardatos = async () => {
      try {
        setIsLoading(true);
        
        const options = {method: 'GET', credentials: 'include'};
        
        const [perfilRes, billsRes, incomesRes] = await Promise.all([
          fetch('http://localhost:8000/user/profile', options),
          fetch('http://localhost:8000/bill/', options),
          fetch('http://localhost:8000/income/', options)
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

        // Procesamos los Gastos (Bills) e inyectamos el 'type' de forma implícita
        let dbTransactions = [];

        if (billsRes.ok) {
          const billsData = await billsRes.json();
          dbTransactions = dbTransactions.concat(
            billsData.map(b => ({
              id: b.bill_id || b.id || b._id,
              date: b.date || new Date().toISOString(), // Fallback si la proyección no da fecha
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
              date: i.date || new Date().toISOString(), // Fallback seguro
              category: i.origin || 'Otros',
              description: i.title || i.description,
              amount: parseFloat(i.amount) || 0,
              type: 'income'
            }))
          );
        }

        setTransactions(dbTransactions);

      } catch (error) {
        console.error("Error al conectar con el servidor de Capital Joven:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargardatos();
  }, []);

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
      // Usamos clearProps: "transform" para evitar conflictos visuales con los elementos fixed en móviles
      tl.from(".gsap-sidebar", { x: -100, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" })
        .from(".gsap-header", { y: -30, opacity: 0, duration: 0.6, ease: "power3.out", clearProps: "transform" }, "-=0.5")
        .from(".gsap-content", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out", clearProps: "transform" }, "-=0.4");
    }, appRef);

    return () => ctx.revert(); 
  }, [isLoading]);

// Agrega la nueva transacción al inicio de la lista en tiempo real
  const handleAddTransaction = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleUpdateTransaction = (updatedTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  const handleDeleteTransaction = (idToDelete) => {
    setTransactions(prev => 
      prev.filter(t => t.id !== idToDelete)
    );
  };

  const showUserInfo = () => setShowUserMenu(!showUserMenu);

  // 🌟 NUEVO: Remueve la transacción eliminada del estado al instante
  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

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
      
      {/* Pasamos los estados de apertura al SideBar */}
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
            {/* Botón de Hamburguesa solo visible en móviles */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Menu size={24} />
            </button>
            
            <div>
              <h2 className="text-xl md:text-2xl font-[Satoshi-Bold] text-white">
                {activeTab === 'dashboard' && 'Tus Finanzas'}
                {activeTab === 'tips' && 'Tips Financieros'}
                {activeTab === 'settings' && 'Configuración'}
                {activeTab === 'analysis' && 'Analicemos tus Finanzas'}
                {activeTab === 'transactions' && 'Tus Movimientos'}
                {activeTab === 'goals' && 'Tus Metas de Ahorro'}
                {activeTab === 'aiAssesor' && 'Tu Asesor IA'}
              </h2>
              {/* Ocultamos el subtítulo en móviles para ahorrar espacio en la barra superior */}

            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative" ref={userMenuRef}>
              <div onClick={showUserInfo} className="w-10 h-10 rounded-full bg-emerald-950/50 flex items-center justify-center text-emerald-400 border border-emerald-500/30 cursor-pointer hover:bg-emerald-600/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                {/* Fallback inicial de avatar en el botón */}
                <span className="font-[Satoshi-Bold] text-sm">{userProfile.firstname?.[0] || ''}{userProfile.lastname?.[0] || ''}</span>
              </div>

              {showUserMenu && (
                <>
                  <div className="absolute right-0 mt-3 w-72 bg-[#101010]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div className="p-6 border-b border-white/5 bg-white/2 relative overflow-hidden flex flex-col items-center">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                      
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full bg-emerald-950/50 border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          {/* TODO: BACKEND - Usar userProfile.avatarUrl */}
                          <img 
                            src={userProfile.avatarUrl || "/avatar-placeholder.png"} 
                            alt="Foto de perfil" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement.innerHTML = `<span class="text-emerald-400 text-2xl font-[Satoshi-Bold]">${userProfile.firstname?.[0] || ''}{userProfile.lastname?.[0] || ''}</span>`;
                            }}
                          />
                        </div>
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-4 border-[#101010] rounded-full"></div>
                      </div>

                      <div className="text-center relative z-10">
                        {/* INYECCIÓN DE DATOS DEL ESTADO */}
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

        {/* Espaciado ajustado para móviles */}
        <main className="gsap-content flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <HomeView onNavigateToTransactions={() => setActiveTab('transactions')} />
              </div>
            )}
            {activeTab === 'tips' && <TipsView />}
            
            {/* Ahora le pasamos el userProfile real a SettingsView para que lo editen */}
            {activeTab === 'settings' && <SettingsView initialUserData={userProfile} onProfileUpdate={setUserProfile} />}
            
            {activeTab === 'analysis' && <AnalysisView transactions={transactions}/>}
            {activeTab === 'transactions' && <TransactionsView transactions={transactions} onAddTransaction={handleAddTransaction} 
                                                                                                                                         onUpdateTransaction={handleUpdateTransaction} 
                                                                                                                                         onDeleteTransaction={handleDeleteTransaction} />}
            {activeTab === 'goals' && <SavingView />}
            {activeTab === 'aiAssesor' && <AssesorView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainApp;