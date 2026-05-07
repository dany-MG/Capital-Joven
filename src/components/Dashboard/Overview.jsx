import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';

const mockTransactions = [
  { id: 1, type: 'gasto', name: 'Spotify Premium', date: 'Oct 14, 2024', category: 'Suscripciones', amount: -129.00 },
  { id: 2, type: 'ingreso', name: 'Beca Manutención', date: 'Oct 12, 2024', category: 'Becas', amount: 3600.00 },
  { id: 3, type: 'gasto', name: 'Cafetería Facultad', date: 'Oct 12, 2024', category: 'Alimentos', amount: -65.50 },
  { id: 4, type: 'gasto', name: 'Impresiones Tesis', date: 'Oct 11, 2024', category: 'Papelería', amount: -210.00 },
];

export default function Overview(){
    return(
    <div className="flex-1 p-10 space-y-10">
      <header>
        <h1 className="text-xs text-gray-500 uppercase tracking-widest mb-1">Bienvenido de nuevo</h1>
        <p className="text-4xl font-[Satoshi-Bold]">Hola, <span className="text-transparent bg-clip-text bg-joven-gradient">Dany MG</span></p>
      </header>

      <section className="grid grid-cols-3 gap-6">
        <div className="bg-darkpanel/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 space-y-2">
          <p className="text-gray-400 text-sm">Balance Total</p>
          <p className="text-5xl font-[Satoshi-Bold]">$12,450.00</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1 pt-1"><TrendingUp size={14}/> +3.2% este mes</p>
        </div>
        
        <div className="bg-darkpanel/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 space-y-2">
          <p className="text-gray-400 text-sm">Ingresos netos (Beca + Trabajos)</p>
          <p className="text-5xl font-[Satoshi-Bold] text-emerald-300">$5,100.00</p>
        </div>

        <div className="bg-darkpanel/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 space-y-2">
          <p className="text-gray-400 text-sm">Gastos de Octubre (Var. vs Sept)</p>
          <p className="text-5xl font-[Satoshi-Bold] text-cyan-300">$2,340.50</p>
        </div>
      </section>

      <section className="bg-darkpanel p-8 rounded-3xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Transacciones recientes</h2>
          <button className="text-sm px-4 py-1.5 border border-white/10 rounded-full text-gray-400 hover:bg-white/5 hover:text-white transition-all">Ver todas</button>
        </div>

        <table className="w-full text-left">
          <thead className="border-b border-white/5">
            <tr className="text-sm text-gray-500">
              <th className="py-4 font-medium">Concepto</th>
              <th className="py-4 font-medium">Categoría</th>
              <th className="py-4 font-medium">Fecha</th>
              <th className="py-4 font-medium text-right">Monto</th>
              <th className="py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                <td className="py-5 font-semibold text-white flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'ingreso' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'}`}>
                    <DollarSign size={18} />
                  </div>
                  {tx.name}
                </td>
                <td className="py-5 text-gray-300 text-sm">{tx.category}</td>
                <td className="py-5 text-gray-400 text-sm">{tx.date}</td>
                <td className={`py-5 font-bold text-lg text-right ${tx.type === 'ingreso' ? 'text-emerald-300' : 'text-white'}`}>
                  {tx.type === 'ingreso' ? '+' : '-'} ${Math.abs(tx.amount).toFixed(2)}
                </td>
                <td className="py-5 text-right text-gray-600">
                  <MoreVertical size={18} className="cursor-pointer hover:text-white transition-all"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>        
    )
}