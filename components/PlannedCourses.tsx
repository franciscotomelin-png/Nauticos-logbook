
import React, { useState, useEffect } from 'react';
import { Leave, LeaveType } from '../types';
import { storageService, calculateDays } from '../services/storageService';
import { Plus, Trash2, Edit2, GraduationCap, Calendar, CheckCircle, Clock, X, Palmtree } from 'lucide-react';

const PlannedCourses: React.FC = () => {
  const [list, setList] = useState<Leave[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Leave>>({
    title: '', leave_type: LeaveType.COURSE, start_date: '', end_date: '', status: 'Planejado', notes: ''
  });

  useEffect(() => { setList(storageService.getLeaves()); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Leave = {
      id: editingId || crypto.randomUUID(),
      title: formData.title || 'Curso',
      leave_type: formData.leave_type || LeaveType.COURSE,
      start_date: formData.start_date || '',
      end_date: formData.end_date || '',
      status: formData.status as any || 'Planejado',
      notes: formData.notes || ''
    };
    storageService.saveLeave(newItem);
    setList(storageService.getLeaves());
    closeModal();
  };

  const deleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja remover este agendamento?')) {
      storageService.deleteLeave(id);
      setList(storageService.getLeaves());
    }
  };

  const openModal = (item?: Leave) => {
    if (item) { setEditingId(item.id); setFormData(item); } 
    else { setEditingId(null); setFormData({ title: '', leave_type: LeaveType.COURSE, start_date: '', end_date: '', status: 'Planejado', notes: '' }); }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Agenda de Cursos e Folgas</h2>
           <p className="text-slate-500 mt-1">Planeje sua evolução profissional e lazer.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
        >
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <div className="grid gap-5">
        {list.map((item) => {
          const days = calculateDays(item.start_date, item.end_date);
          const isCourse = item.leave_type === LeaveType.COURSE;
          
          return (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`p-3 rounded-2xl transition-colors duration-300 ${isCourse ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                        {isCourse ? <GraduationCap size={24} /> : <Palmtree size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                item.status === 'Concluído' ? 'bg-green-50 text-green-700 border-green-100' : 
                                item.status === 'Aprovado' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-slate-50 text-slate-600 border-slate-100'
                             }`}>
                              {item.status}
                             </span>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600 pl-16 mt-3">
                     <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="font-medium">{new Date(item.start_date).toLocaleDateString('pt-BR')} — {new Date(item.end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      <span>{days} dias</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                     <button onClick={() => openModal(item)} className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                       <Edit2 size={18} />
                     </button>
                     <button onClick={() => deleteItem(item.id)} className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                       <Trash2 size={18} />
                     </button>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <GraduationCap className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400">Nenhum curso ou folga agendada.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Título</label>
                 <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" 
                   value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Curso DP Avançado" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tipo</label>
                   <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white appearance-none"
                      value={formData.leave_type}
                      onChange={e => setFormData({...formData, leave_type: e.target.value as LeaveType})}
                   >
                     {Object.values(LeaveType).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Status</label>
                   <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white appearance-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                   >
                     <option value="Planejado">Planejado</option>
                     <option value="Aprovado">Aprovado</option>
                     <option value="Concluído">Concluído</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Início</label>
                   <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600" 
                     value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Fim</label>
                   <input 
                     type="date" 
                     required 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600"
                     value={formData.end_date} 
                     onChange={e => setFormData({...formData, end_date: e.target.value})} 
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Observações</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white h-24 resize-none" 
                   value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Detalhes adicionais..." />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
                 <button type="submit" className="px-8 py-3 rounded-xl font-medium bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannedCourses;
