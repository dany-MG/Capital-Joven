import React from 'react';
import { Home, ArrowDownUp, BarChart3, PiggyBank, Settings, BrainCircuit, LogOut, UserCircle, BookMarked} from 'lucide-react';

const menuItems = [
    { name: 'Inicio', icon: Home, id: 'dashboard' },
    { name: 'Ingresos y Egresos', icon: ArrowDownUp, id: 'transactions' },
    { name: 'Análisis', icon: BarChart3, id: 'analysis' },
    { name: 'Metas de Ahorro', icon: PiggyBank, id: 'goals' },
    { name: 'Asesor IA', icon: BrainCircuit, id: 'ai' },
    { name: 'Educación Financiera', icon: BookMarked, id: 'tips' },
    { name: 'Configuración', icon: Settings, id: 'settings' },
]

export default function SideBar({ activeTab, setActiveTab }){
    const handleLogout = () => {
        // TODO: BACKEND: Aquí deben limpiar el token de sesión, localStorage o cookies.
        /* Ejemplo:
           localStorage.removeItem('authToken');
           sessionStorage.clear();
        */
        
        // Redirigir a la página de inicio o login (Ajusta la ruta '/login' según tu proyecto en Astro)
        window.location.href = '/';
    }

    return(
        <aside className="w-64 bg-darkpanel h-full flex flex-col border-r border-white/5 p-6">
            <div className="flex items-center gap-2 mb-12">
                <div className="w-12 h-7">
                    <img src="/logo.png" alt="CapitalJoven" className="w-full h-full object-cover" />
                </div> 
                <span className="text-xl font-[Satoshi-Bold] text-white">Capital<span className="text-emerald-400">Joven</span></span>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <a
                            key={item.id}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault(); 
                                setActiveTab(item.id);
                            }}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 border ${
                            isActive
                                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-emerald-400'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors duration-150 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'}`} />
                            <span className="font-medium">{item.name}</span>
                        </a>
                    );
                })}
            </nav>

            <div className="border-t border-white/5 pt-6 mt-6 space-y-4">
                <div className="flex items-center gap-3">
                    <UserCircle className="w-10 h-10 text-gray-600" />
                    <div>
                        <p className="font-[Satoshi-Medium] text-white">Dany MG</p>
                        <p className="text-xs text-gray-500">Estudiante</p>
                    </div>
                </div>
                <button className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-darkbg border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 rounded-lg hover:text-red-400 transition-all duration-300 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    )
}