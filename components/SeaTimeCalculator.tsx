
import React, { useState, useEffect } from 'react';
import { SeaTimeEntry } from '../types';
import { storageService, calculateDays } from '../services/storageService';
import { Plus, Trash2, Calculator, Ship, Calendar, X } from 'lucide-react';

const SeaTimeCalculator: React.FC = () => {
  const [entries, setEntries] = useState<SeaTimeEntry[]>([]);
  const [formData, setFormData] = useState({
    vessel_name: '',
    start_date: '',
    end_date: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(storageService.getSeaTimeHistory());
  }, []);

  // Auto-reset delete confirmation after 3 seconds
  useEffect(() => {
    if (deleteConfirmId) {
      const timer = setTimeout(() => setDeleteConfirmId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirmId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) return;

    const newEntry: SeaTimeEntry = {
      id: crypto.randomUUID(),
      vessel_name: formData.vessel_name || 'Embarque Histórico',
      start_date: formData.start_date,
      end_date: formData.end_date
    };

    storageService.saveSeaTimeEntry(newEntry);
    setEntries(storageService.getSeaTimeHistory());
    setFormData({ vessel_name: '', start_date: '', end_date: '' });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      storageService.deleteSeaTimeEntry(id);
      setEntries(storageService.getSeaTimeHistory());
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const totalDays = entries.reduce((acc, curr) => acc + calculateDays(curr.start_date, curr.end_date), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Calculadora de Dias de Mar</h2>
          <p className="text-slate-500 mt-1">Adicione embarques antigos para somar ao seu total de carreira.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium"
        >
          <Plus size={18} />
          <span>Adicionar Período</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Calculator size={120} />
        </div>
        <div className="relative z-10">
           <h3 className="text-indigo-100 font-medium uppercase tracking-widest text-sm mb-2">Total Histórico Calculado</h3>
           <div className="flex items-baseline gap-2">
             <span className="text-5xl font-extrabold">{totalDays}</span>
             <span className="text-xl font-medium text-indigo-200">dias</span>
           </div>
           <p className="mt-4 text-indigo-100/80 text-sm max-w-md">
             Este valor é somado aos embarques registrados na aba "Embarques" para compor o total exibido no Painel.
           </p>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => {
          const days = calculateDays(entry.start_date, entry.end_date);
          return (
            <div key={entry.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex items-center justify-between group">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Ship size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{entry.vessel_name}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(entry.start_date)} — {formatDate(entry.end_date)}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="font-medium text-indigo-600">{days} dias</span>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={() => handleDelete(entry.id)}
                 className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                   deleteConfirmId === entry.id 
                   ? "bg-red-600 text-white opacity-100 shadow-sm" 
                   : "text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                 }`}
                 title={deleteConfirmId === entry.id ? "Confirmar exclusão" : "Excluir"}
               >
                 <Trash2 size={18} />
                 {deleteConfirmId === entry.id && <span className="text-xs font-bold pr-1">Confirma?</span>}
               </button>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
             <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
             <p className="text-slate-400">Nenhum período histórico adicionado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Novo Período</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nome do Navio / Referência</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white" 
                  value={formData.vessel_name} 
                  onChange={e => setFormData({...formData, vessel_name: e.target.value})} 
                  placeholder="Ex: Histórico 2020-2024" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Início</label>
                   <input 
                     type="date" 
                     required 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600"
                     value={formData.start_date} 
                     onChange={e => setFormData({...formData, start_date: e.target.value})} 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Fim</label>
                   <input 
                     type="date" 
                     required 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600"
                     value={formData.end_date} 
                     onChange={e => setFormData({...formData, end_date: e.target.value})} 
                   />
                </div>
              </div>

              <div className="pt-2">
                 <button type="submit" className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all">
                   Adicionar
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeaTimeCalculator;
