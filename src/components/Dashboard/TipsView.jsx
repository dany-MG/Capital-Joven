import React from 'react';
import { Shield, TrendingUp, PiggyBank, AlertTriangle, BookOpen, Target, Umbrella, Calculator } from 'lucide-react';

export const TipsView = () => {

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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Sección Hero: Estrategia del Fondo de Emergencia */}
      <div className="bg-darkpanel border border-white/5 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
        {/* Elementos decorativos de fondo adaptados al tema */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Shield size={14} />
              Estrategia Recomendada
            </div>
            <h2 className="text-3xl md:text-4xl font-[Satoshi-Bold] mb-4 leading-tight">
              Construye tu <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Fondo de Emergencia</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Un fondo de emergencia es dinero reservado exclusivamente para imprevistos (pérdida de empleo, gastos médicos, reparaciones). Es tu cinturón de seguridad financiero.
            </p>
            
            <button className="bg-white/5 border border-white/10 hover:bg-emerald-500 hover:border-emerald-400 text-white hover:text-darkbg font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transform hover:-translate-y-1">
              Calcular mi Fondo Ideal
            </button>
          </div>

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

              <div className="w-0.5 h-6 bg-white/10 ml-4"></div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-600 text-gray-500 font-bold flex items-center justify-center">3</div>
                <div>
                  <h4 className="font-bold text-gray-300">6 Meses (Libertad)</h4>
                  <p className="text-sm text-gray-500">El nivel experto. Te da tranquilidad total ante cualquier crisis mayor.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <PiggyBank size={48} className="mx-auto text-emerald-400 mb-4 relative z-10" />
        <h3 className="text-xl font-[Satoshi-Bold] text-white mb-2 relative z-10">¿Listo para mejorar tus finanzas?</h3>
        <p className="text-gray-400 max-w-lg mx-auto mb-0 relative z-10">
          La educación financiera no es sobre ser rico rápidamente, es sobre tomar el control de tu vida y reducir el estrés por dinero.
        </p>
      </div>

    </div>
  );
};