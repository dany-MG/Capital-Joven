import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Camera, Save, Lock } from 'lucide-react';
import { MOCK_USER_PROFILE } from './MockData';
import Swal from 'sweetalert2';

export const SettingsView = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(MOCK_USER_PROFILE);

  const handleLogout = () => {
    // TODO: BACKEND: Aquí deben limpiar el token de sesión, localStorage o cookies.
        /* Ejemplo:
           localStorage.removeItem('authToken');
           sessionStorage.clear();
        */
        
        // Redirigir a la página de inicio o login (Ajusta la ruta '/login' según tu proyecto en Astro)
        window.location.href = '/';
  }

  // TODO: BACKEND: Obtener perfil del usuario al montar el componente
  useEffect(() => {
    /*
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => setFormData(data))
      .catch(err => console.error("Error al cargar el perfil", err));
    */
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: BACKEND: Petición PUT/POST para actualizar el perfil en la DB
    /*
    fetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
      setLoading(false);
      Swal.fire('¡Éxito!', '¡Perfil actualizado con éxito en la Base de Datos!', 'success');
    });
    */

    setTimeout(() => {
      setLoading(false);
      Swal.fire({
        title: '¡Cambios Guardados!',
        text: 'Tu información ha sido actualizada exitosamente.',
        icon: 'success',
        background: '#101010', // Color de fondo darkpanel
        color: '#ffffff', // Texto en blanco
        confirmButtonColor: '#10b981', // Color bg-emerald-500
        confirmButtonText: 'Entendido',
        backdrop: `rgba(0,0,0,0.6)`, // Fondo oscurecido detrás de la alerta
        customClass: {
          // Inyectamos las clases de Tailwind para redondear bordes y dar estilo
          popup: 'border border-white/10 rounded-3xl shadow-2xl',
          confirmButton: 'px-8 py-3 rounded-full font-bold text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105',
        }
      });
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="mb-8">
        <h2 className="text-2xl font-[Satoshi-Bold] text-white flex items-center gap-2">
          <User className="text-emerald-400" />
          Configuración de Perfil
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Administra tu información personal y preferencias de la cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative inline-block mb-4 group/avatar z-10">
              <div className="w-32 h-32 rounded-full bg-emerald-950/50 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center justify-center text-emerald-400 text-4xl font-[Satoshi-Bold] overflow-hidden mx-auto">
                <span className="group-hover/avatar:opacity-50 transition-opacity">
                  {formData.firstName[0]}{formData.lastName[0]}
                </span>
                <div className="absolute inset-0 bg-darkbg/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <button type="button" className="absolute bottom-0 right-0 bg-darkbg border border-white/10 text-emerald-400 p-2 rounded-full shadow-md hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 z-20">
                <Camera size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-[Satoshi-Bold] text-white relative z-10">{formData.firstName} {formData.lastName}</h3>
            <p className="text-gray-400 text-sm relative z-10">{formData.email}</p>
          </div>

          <div className="bg-darkpanel/50 rounded-2xl p-4 border border-white/5">
            <nav className="space-y-1">
              <button type="button" className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 text-white font-medium rounded-xl shadow-sm border border-white/5">
                <User size={18} className="text-emerald-400" /> Información Personal
              </button>
              <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors duration-300 rounded-xl mt-4 border border-transparent cursor-pointer">
                <Lock size={18} /> Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-darkpanel p-8 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-400/20 via-cyan-400/20 to-transparent"></div>

            <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6 border-b border-white/5 pb-4">
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apellido</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escuela</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="school" value={formData.school} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
             <button type="submit" disabled={loading} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-darkbg transition-all duration-300 transform hover:-translate-y-1 shadow-lg cursor-pointer ${loading ? 'bg-gray-600 cursor-wait' : 'bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>
                {loading ? (<>Guardando...</>) : (<><Save size={20} />Guardar Cambios</>)}
             </button>
          </div>
        </div>
      </form>
    </div>
  );
};