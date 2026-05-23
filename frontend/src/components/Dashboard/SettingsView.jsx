import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Briefcase, Camera, Save, Lock, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

// Recibimos 'initialUserData' desde MainApp para no hacer un GET redundante
export const SettingsView = ({ initialUserData }) => {
  // =====================================================================
  // 1. ESTADOS LOCALES Y REFERENCIAS
  // =====================================================================
  const [loading, setLoading] = useState(false);
  
  // Estado para la información básica
  const [formData, setFormData] = useState(initialUserData || {
    firstName: '', lastName: '', email: '', school: '', avatarUrl: ''
  });

  // Estado para el cambio de contraseña
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  // Estado para mostrar/ocultar contraseñas en la UI
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Referencia para el input de archivo oculto (Subida de Avatar)
  const fileInputRef = useRef(null);

  // Sincronizar el estado si los datos iniciales cambian o tardan en llegar
  useEffect(() => {
    if (initialUserData) {
      setFormData(initialUserData);
    }
  }, [initialUserData]);

  // =====================================================================
  // 2. LÓGICA DE ACTUALIZACIÓN DE DATOS
  // =====================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tu validación de contraseñas de Frontend (Está perfecta, la dejamos intacta)
    if (passwords.new || passwords.current || passwords.confirm) {
      if (!passwords.current) {
        return Swal.fire({
          title: 'Falta información', text: 'Debes ingresar tu contraseña actual para realizar cambios de seguridad.', icon: 'warning', background: '#101010', color: '#ffffff', confirmButtonColor: '#10b981'
        });
      }
      if (passwords.new !== passwords.confirm) {
        return Swal.fire({
          title: 'Error de coincidencia', text: 'Las contraseñas nuevas no coinciden. Intenta de nuevo.', icon: 'error', background: '#101010', color: '#ffffff', confirmButtonColor: '#ef4444'
        });
      }
      if (passwords.new.length > 0 && passwords.new.length < 8) {
        return Swal.fire({
          title: 'Contraseña débil', text: 'La nueva contraseña debe tener al menos 8 caracteres.', icon: 'warning', background: '#101010', color: '#ffffff', confirmButtonColor: '#10b981'
        });
      }
    }

    setLoading(true);
    
    // TODO: BACKEND - Petición PUT/PATCH para actualizar el perfil
    const bodyData = {};
    
    // Unimos firstName y lastName en una sola propiedad 'name' como pide tu Python
    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    if (fullName) bodyData.name = fullName;
    
    // Pasamos school a 'university' como pide tu Python
    if (formData.school) bodyData.university = formData.school;
    
    // Si escribió una nueva contraseña en la sección de seguridad, la agregamos
    if (passwords.new) bodyData.password = passwords.new;

    try {
      // Tu endpoint real definido en user.py es: /user/update
      const response = await fetch('http://localhost:8000/user/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include', // Permite enviar la cookie de sesión automática
        body: JSON.stringify(bodyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al actualizar los datos.");
      }
      
      const updatedUser = await response.json();
      console.log("Respuesta de MongoDB exitosa:", updatedUser);

      // Limpiamos los campos de contraseña en la pantalla tras guardar con éxito
      setPasswords({ current: '', new: '', confirm: '' });

      Swal.fire({
        title: '¡Cambios Guardados!',
        text: 'Tu información ha sido actualizada exitosamente en MongoDB.',
        icon: 'success',
        background: '#101010', color: '#ffffff', confirmButtonColor: '#10b981',
        confirmButtonText: 'Entendido', timer : 3000
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo guardar la configuración.',
        icon: 'error',
        background: '#101010', color: '#ffffff', confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };
  // =====================================================================
  // 3. LÓGICA DE SUBIDA DE IMAGEN Y SESIÓN
  // =====================================================================
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Conexión para la subida de foto de perfil
    const uploadData = new FormData();
    uploadData.append('file', file); // Enviamos el archivo físico binario

    try {
      const response = await fetch('http://localhost:8000/user/avatar', {
        method: 'POST',
        credentials: 'include',
        body: uploadData // Nota: NO se pone 'Content-Type', el navegador lo hace solo
      });

      if (!response.ok) throw new Error("Error al subir el archivo.");

      const data = await response.json();
      // Actualizamos la UI con la URL real de la foto que nos dé el servidor
      setFormData(prev => ({ ...prev, avatarUrl: data.avatar_url }));
      
      Swal.fire({
        toast: true, position: 'bottom-end', icon: 'success',
        title: 'Foto de perfil actualizada', showConfirmButton: false, timer: 3000,
        background: '#101010', color: '#10b981'
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/user/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    // Redirigimos al inicio de la página limpia
    window.location.href = '/';
  };
  // =====================================================================
  // 4. RENDERIZADO DE LA INTERFAZ
  // =====================================================================
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
        
        {/* COLUMNA IZQUIERDA: AVATAR Y MENÚ RÁPIDO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-darkpanel p-6 rounded-2xl shadow-lg border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#10b9810d,transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
            />

            <div className="relative inline-block mb-4 group/avatar z-10">
              <div 
                onClick={handleAvatarClick}
                className="w-32 h-32 rounded-full bg-emerald-950/50 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center justify-center text-emerald-400 text-4xl font-[Satoshi-Bold] overflow-hidden mx-auto cursor-pointer"
              >
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-opacity" />
                ) : (
                  <span className="group-hover/avatar:opacity-50 transition-opacity">
                    {formData.name[0] || ''}
                  </span>
                )}
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full">
                  <Camera size={28} className="text-white" />
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-[#101010] border border-white/10 text-emerald-400 p-2.5 rounded-full shadow-md hover:border-emerald-500/50 hover:bg-white/5 transition-all duration-300 z-20 cursor-pointer"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <h3 className="text-xl font-[Satoshi-Bold] text-white relative z-10">{formData.name}</h3>
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

        {/* COLUMNA DERECHA: FORMULARIOS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BLOQUE 1: INFORMACIÓN BÁSICA */}
          <div className="bg-darkpanel p-8 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[linear-gradient(to_right,#34d39933,#22d3ee33,transparent)]"></div>

            <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6 border-b border-white/5 pb-4">
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="firstName" value={formData.name || ''} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" />
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
                  <input type="email" name="email" value={formData.email} onChange={handleChange} disabled className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl outline-none text-gray-400 cursor-not-allowed" title="El correo no se puede modificar directamente" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escuela / Institución</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" name="school" value={formData.university} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: SEGURIDAD Y CONTRASEÑA */}
          <div className="bg-darkpanel p-8 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group">
            <h3 className="text-lg font-[Satoshi-Bold] text-white mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="text-emerald-400" size={20} />
                Seguridad
              </div>
              <button 
                type="button" 
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showPasswords ? <><EyeOff size={14}/> Ocultar</> : <><Eye size={14}/> Mostrar</>}
              </button>
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contraseña Actual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    name="current" 
                    value={passwords.current} 
                    onChange={handlePasswordChange} 
                    placeholder="Ingresa tu contraseña actual para hacer cambios"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type={showPasswords ? "text" : "password"} 
                      name="new" 
                      value={passwords.new} 
                      onChange={handlePasswordChange} 
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type={showPasswords ? "text" : "password"} 
                      name="confirm" 
                      value={passwords.confirm} 
                      onChange={handlePasswordChange} 
                      placeholder="Repite la nueva contraseña"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-transparent rounded-xl focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 outline-none text-white transition-all duration-300" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* BOTÓN GUARDAR (Global) */}
          <div className="flex justify-end pt-4">
             <button 
               type="submit" 
               disabled={loading} 
               className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-darkbg transition-all duration-300 transform hover:-translate-y-1 shadow-lg cursor-pointer ${loading ? 'bg-emerald-500/50 cursor-wait' : 'bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
             >
                {loading ? <><Loader2 size={20} className="animate-spin" /> Guardando...</> : <><Save size={20} /> Guardar Cambios</>}
             </button>
          </div>
        </div>
      </form>
    </div>
  );
};