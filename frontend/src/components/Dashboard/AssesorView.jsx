import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, BrainCircuit, Info, Eraser } from 'lucide-react';
import Swal from 'sweetalert2';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export const AssesorView = ({ userProfile, transactions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [cooldown, setCooldown] = useState(0); 
  const scrollRef = useRef(null);

  // Recuperamos el presupuesto actual guardado y limitamos transacciones
  const budget = typeof window !== 'undefined' ? localStorage.getItem('capitalJoven_budget') || '0' : '0';
  const recentTx = transactions.slice(0, 10);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // CONFIGURACIÓN DEL HOOK CON TRANSPORT (SDK V5/V6)
  const { 
    messages, 
    status, 
    setMessages,
    sendMessage 
  } = useChat({
    transport : new DefaultChatTransport({
      api: '/api/gemini', 
    }), 
    onError: (error) => {
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.error === 'RATE_LIMIT') {
          setCooldown(parsedError.retryAfter || 60);
          Swal.fire({
            toast: true, position: 'bottom-end', icon: 'warning',
            title: 'Límite alcanzado',
            text: `Espera ${parsedError.retryAfter} segundos antes de seguir.`,
            color: '#ffffff', showConfirmButton: false, timer: 3000, background: '#101010'
          });
          return;
        }
      } catch (e) {
        console.error("Error no parseable:", e);
      }

      Swal.fire({
        toast: true, position: 'bottom-end', icon: 'error',
        title: 'Error de conexión con la IA', color: '#ffffff',
        showConfirmButton: false, timer: 3000, background: '#101010'
      });
    }
  });

  // =====================================================================
  // LA MAGIA DE LA PERSISTENCIA
  // =====================================================================
  const chatStorageKey = userProfile?.email ? `capitalJoven_chat_history_${userProfile.email}` : null;
  useEffect(() => {
    if (!chatStorageKey) return;

    const savedHistory = localStorage.getItem(chatStorageKey);
    
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      setMessages([
        {
          id: 'welcome-msg-' + Date.now(),
          role: 'assistant',
          parts: [
            { 
              type: 'text', 
              text: `¡Hola ${userProfile?.firstname || 'Usuario'}! Soy tu Asesor Inteligente de Capital Joven. He analizado tus últimos movimientos y tengo algunas sugerencias para optimizar tu presupuesto. ¿En qué puedo ayudarte hoy?` 
            }
          ]
        }
      ]);
    }
  }, [setMessages, chatStorageKey, userProfile?.firstname]);

  useEffect(() => { 
    if (messages.length > 0 && chatStorageKey) {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    }
  }, [messages, chatStorageKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const getMessageText = (msg) => {
    if (msg.parts && msg.parts.length > 0) {
      return msg.parts.map(p => p.text).join('');
    }
    return msg.text || msg.content || '';
  };

  // =====================================================================
  // ENVÍO EN TIEMPO REAL CON CONTEXTO (SDK 6)
  // =====================================================================
  const handleFormSubmit = async (e) => {
    e.preventDefault(); 
    if (!inputValue.trim() || cooldown > 0) return;
    
    const userMessage = inputValue;
    setInputValue(''); 

    // 🟢 ENVIAMOS EL MENSAJE JUNTO CON EL CONTEXTO FINANCIERO DINÁMICO
    await sendMessage(
      { text: userMessage },
      {
        body: {
          financialContext: {
            firstname: userProfile?.firstname || 'Usuario',
            budget: budget,
            transactions: recentTx
          }
        }
      }
    );
  };

  // =====================================================================
  // UTILIDADES DEL CHAT
  // =====================================================================
  const resetChat = () => {
    const nombreUsuario = userProfile?.firstname || 'Usuario';
    const mensajeBienvenida = [
      {
        id: 'welcome-msg-' + Date.now(),
        role: 'assistant',
        parts: [{ type: 'text', text: `¡Hola ${nombreUsuario}! Soy tu Asesor Inteligente de Capital Joven. ¿En qué puedo ayudarte hoy?` }]
      }
    ];
    setMessages(mensajeBienvenida);
    if (chatStorageKey) {
      localStorage.setItem(chatStorageKey, JSON.stringify(mensajeBienvenida));
    }
  };

  const downloadMarkdown = () => {
    let mdContent = `# Historial de Asesoría IA - Capital Joven\n`;
    mdContent += `*Fecha: ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    messages.forEach(msg => {
      const author = msg.role === 'assistant' ? '🤖 **Asesor IA**' : '👤 **Usuario**';
      mdContent += `${author}:\n${getMessageText(msg)}\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Asesoria_CapitalJoven_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    if (messages.length <= 1) {
      Swal.fire({
        toast: true, position: 'bottom-end', icon: 'info', iconColor : '#10b981',
        title: 'La conversación ya está limpia', color: '#ffffff',
        showConfirmButton: false, timer: 2000, background: '#101010',
        customClass: { popup: 'border border-white/10' }
      });
      return;
    }

    Swal.fire({
      title: '¿Limpiar conversación?',
      text: 'Puedes eliminar el historial o guardarlo en tu dispositivo como un archivo Markdown (.md).',
      icon: 'question', background: '#101010', color: '#ffffff',
      showCancelButton: true, showDenyButton: true,
      confirmButtonText: 'Guardar y Limpiar', denyButtonText: 'Solo Eliminar', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981', denyButtonColor: '#ef4444', backdrop: `rgba(0,0,0,0.7)`,
      customClass: {
        popup: 'border border-white/10 rounded-3xl shadow-2xl',
        confirmButton: 'px-5 py-2.5 rounded-full font-bold text-black hover:scale-105 transition-all',
        denyButton: 'px-5 py-2.5 rounded-full font-bold text-white hover:scale-105 transition-all',
        cancelButton: 'px-5 py-2.5 rounded-full font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        downloadMarkdown();
        resetChat();
        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'success', title: 'Chat guardado y limpiado',
          showConfirmButton: false, timer: 3000, background: '#101010', color: '#10b981',
          customClass: { popup: 'border border-white/10' }
        });
      } else if (result.isDenied) {
        resetChat();
      }
    });
  };

  const suggestions = [
    "¿Cómo optimizar mi presupuesto?", "Analiza mis gastos del mes",
    "¿Cuánto puedo ahorrar este semestre?", "Plan de pago de deudas"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-t-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[linear-gradient(to_right,#34d399,#22d3ee)] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <BrainCircuit className="text-black" size={20} />
          </div>
          <div>
            <h2 className="text-white font-[Satoshi-Bold] text-xl">Asesor Financiero IA</h2>
            <div className="flex items-center gap-1.5 text-sm text-emerald-400 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Conectado a Gemini 2.5 Flash
            </div>
          </div>
        </div>
        <button onClick={handleClearChat} className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all cursor-pointer" title="Limpiar conversación">
          <Eraser size={18} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-zinc-900/20 border-x border-white/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-30 -ml-30 w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl"></div>

        <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar z-10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                  msg.role === 'assistant' ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-white/5 border-white/10'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={16} className="text-emerald-400" /> : <User size={16} className="text-gray-400" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl text-md leading-relaxed ${
                    msg.role === 'assistant' 
                      ? 'bg-[#101010] border border-white/5 text-gray-200' 
                      : 'bg-[linear-gradient(to_right,#34d399,#22d3ee)] text-black font-medium shadow-lg'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-a:text-emerald-400 prose-strong:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {getMessageText(msg)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      getMessageText(msg)
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(status === 'submitted' || status === 'streaming') && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-md text-emerald-400 flex items-center gap-2">
                <Sparkles size={12} /> Procesando datos...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-b-3xl space-y-4">
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => setInputValue(s)}
              disabled={cooldown > 0}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[13px] text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleFormSubmit} className="relative">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={cooldown > 0}
            placeholder={cooldown > 0 ? `Espera ${cooldown} segundos para enviar otro mensaje...` : "Hazle una pregunta a tu Asesor IA..."}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || status === 'submitted' || status === 'streaming' || cooldown > 0}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[linear-gradient(to_right,#34d399,#22d3ee)] rounded-xl flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
          >
            {cooldown > 0 ? (
              <span className="text-xs font-bold text-black/80">{cooldown}s</span>
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>

        <p className="text-sm text-center text-white/30 flex items-center justify-center gap-1">
          <Info size={15} /> Recuerda que soy una IA. Verifica siempre tus decisiones financieras importantes.
        </p>
      </div>
    </div>
  );
};