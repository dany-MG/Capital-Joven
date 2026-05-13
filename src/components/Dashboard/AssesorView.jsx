import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, BrainCircuit, Info, Eraser } from 'lucide-react';
import Swal from 'sweetalert2';

export const AssesorView = () => {
  // Estados del Chat
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: '¡Hola Dany! Soy tu Asesor Inteligente de Capital Joven. He analizado tus últimos movimientos y tengo algunas sugerencias para optimizar tu Beca. ¿En qué puedo ayudarte hoy?',
      timestamp: '10:00 AM'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Manejador de envío (Simulación)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // TODO: BACKEND - Aquí se enviaría el texto + parámetros del usuario (ingresos, gastos) a la API de IA.
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = {
        id: Date.now() + 1,
        role: 'ai',
        text: 'Excelente pregunta. Basado en que recibes tu beca de forma quincenal y tus gastos en transporte han subido un 15%, te recomiendo ajustar tu meta de ahorro a $400 por quincena para no comprometer tu presupuesto de alimentos.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  // --- LÓGICA PARA LIMPIAR Y GUARDAR CHAT ---

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        role: 'ai',
        text: '¡Hola Dany! Soy tu Asesor Inteligente de Capital Joven. He analizado tus últimos movimientos y tengo algunas sugerencias para optimizar tu Beca. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Actualizamos a la hora actual
      }
    ]);
  };

  const downloadMarkdown = () => {
    // 1. Crear el contenido del archivo .md
    let mdContent = `# Historial de Asesoría IA - Capital Joven\n`;
    mdContent += `*Fecha: ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    messages.forEach(msg => {
      const author = msg.role === 'ai' ? '🤖 **Asesor IA**' : '👤 **Dany**';
      mdContent += `${author} _(${msg.timestamp})_:\n${msg.text}\n\n`;
    });

    // 2. Crear un Blob (archivo en memoria)
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 3. Crear un enlace temporal para forzar la descarga
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Asesoria_CapitalJoven_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    // NUEVO: Dar retroalimentación si el chat ya está vacío
    if (messages.length <= 1) {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'info',
        iconColor : '#10b981',
        title: 'La conversación ya está limpia',
        color: '#ffffff',
        showConfirmButton: false,
        timer: 2000,
        background: '#101010',
        customClass: { popup: 'border border-white/10' }
      });
      return;
    }

    Swal.fire({
      title: '¿Limpiar conversación?',
      text: 'Puedes eliminar el historial o guardarlo en tu dispositivo como un archivo Markdown (.md).',
      icon: 'question',
      background: '#101010',
      color: '#ffffff',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Guardar y Limpiar',
      denyButtonText: 'Solo Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981', // Emerald 500
      denyButtonColor: '#ef4444',    // Red 500
      backdrop: `rgba(0,0,0,0.7)`,
      customClass: {
        popup: 'border border-white/10 rounded-3xl shadow-2xl',
        confirmButton: 'px-5 py-2.5 rounded-full font-bold text-black hover:scale-105 transition-all',
        denyButton: 'px-5 py-2.5 rounded-full font-bold text-white hover:scale-105 transition-all',
        cancelButton: 'px-5 py-2.5 rounded-full font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Usuario eligió "Guardar y Limpiar"
        downloadMarkdown();
        resetChat();
        
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Chat guardado y limpiado',
          showConfirmButton: false,
          timer: 3000,
          background: '#101010',
          color: '#10b981',
          customClass: { popup: 'border border-white/10' }
        });

      } else if (result.isDenied) {
        // Usuario eligió "Solo Eliminar"
        resetChat();
      }
    });
  };

  const suggestions = [
    "¿Cómo optimizar mi presupuesto?",
    "Analiza mis gastos del mes",
    "¿Cuánto puedo ahorrar este semestre?",
    "Plan de pago de deudas"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* CABECERA DE CONTEXTO IA */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-t-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Degradado arbitrario insertado aquí */}
          <div className="w-10 h-10 bg-[linear-gradient(to_right,#34d399,#22d3ee)] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <BrainCircuit className="text-black" size={20} />
          </div>
          <div>
            <h2 className="text-white font-[Satoshi-Bold]">Asesor Financiero IA</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Contexto Activo: Ingresos, Gastos y Metas
            </div>
          </div>
        </div>
        <button onClick={handleClearChat} className="text-gray-500 hover:text-white transition-colors mr-3 p-2 rounded-full border border-white/10 cursor-pointer hover:border-white/50" title="Limpiar conversación">
          <Eraser size={18} />
        </button>
      </div>

      {/* ÁREA DE MENSAJES CON FONDO DEGRADADO */}
      <div className="flex-1 relative overflow-hidden bg-zinc-900/20 border-x border-white/5">
        
        <div className="absolute top-0 right-0 -mt-10 -mr-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-30 -ml-30 w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl"></div>

        {/* Contenedor scrolleable de los mensajes */}
        <div 
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar z-10"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                  msg.role === 'ai' ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-white/5 border-white/10'
                }`}>
                  {msg.role === 'ai' ? <Bot size={16} className="text-emerald-400" /> : <User size={16} className="text-gray-400" />}
                </div>

                {/* Burbuja */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'ai' 
                      ? 'bg-[#101010] border border-white/5 text-gray-200' 
                      : 'bg-[linear-gradient(to_right,#34d399,#22d3ee)] text-black font-medium shadow-lg'
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[10px] text-gray-500 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-emerald-400 flex items-center gap-2">
                <Sparkles size={12} /> El asesor está analizando tus datos...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: INPUT Y SUGERENCIAS */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-b-3xl space-y-4">
        
        {/* Sugerencias rápidas */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => setInputValue(s)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Barra de Entrada (usando bg-zinc-900/30 en lugar de bg-black) */}
        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Hazle una pregunta a tu Asesor IA..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all"
          />
          {/* Degradado arbitrario insertado en el botón */}
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[linear-gradient(to_right,#34d399,#22d3ee)] rounded-xl flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
          >
            <Send size={18} />
          </button>
        </form>

        <p className="text-[12px] text-center text-white/30 flex items-center justify-center gap-1">
          <Info size={15} /> Recuerda que soy una IA. Verifica siempre tus decisiones financieras importantes.
        </p>
      </div>
    </div>
  );
};