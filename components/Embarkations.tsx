
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Ship, Calendar, Anchor, X } from "lucide-react";
import { Embarkation } from "../types";
import { storageService, calculateDays } from "../services/storageService";

const Embarkations: React.FC = () => {
  const [list, setList] = useState<Embarkation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation state for Delete All button
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<Partial<Embarkation>>({
    vessel_name: "",
    company_name: "",
    position: "Oficial de Náutica",
    location: "",
    embark_datetime: "",
    disembark_datetime: "",
    hitch_regime: "14x14",
    notes: "",
  });

  const [repeatSchedule, setRepeatSchedule] = useState(false);

  // Helper to format date string YYYY-MM-DD to DD/MM/YYYY without timezone shift
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Centralized function to fetch, filter, and sort data
  const refreshList = () => {
    const all = storageService.getEmbarkations();
    const today = new Date().toISOString().split('T')[0];
    
    // Filter: Show only ongoing or future embarkations (disembark_date >= today)
    // "Depois que o embarque passar, ele tem que sair da fila"
    const activeQueue = all.filter(e => e.disembark_datetime >= today);
    
    // Sort: Ascending by start date (Nearest/Upcoming first)
    // "Quero que o embarque mais próximo fique em cima"
    activeQueue.sort((a, b) => new Date(a.embark_datetime).getTime() - new Date(b.embark_datetime).getTime());

    setList(activeQueue);
  };

  useEffect(() => {
    refreshList();
  }, []);

  // Auto-reset confirmation button after 3 seconds
  useEffect(() => {
    if (confirmDeleteAll) {
      const timer = setTimeout(() => setConfirmDeleteAll(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteAll]);

  // --- Auto Schedule Logic ---
  const handleDateChange = (field: 'embark_datetime', value: string) => {
    if (!value) {
      setFormData(prev => ({ ...prev, [field]: value }));
      return;
    }

    let daysToAdd = 14; // Default
    const regime = formData.hitch_regime || "14x14";
    if (regime.includes("28")) daysToAdd = 28;
    if (regime.includes("21")) daysToAdd = 21;
    if (regime.includes("45")) daysToAdd = 45;

    // Use T12:00:00 to avoid timezone midnight shift issues
    const startDate = new Date(value + 'T12:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + daysToAdd);
    
    setFormData(prev => ({
      ...prev,
      embark_datetime: value,
      disembark_datetime: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!repeatSchedule) {
      // Single Entry
      const newItem: Embarkation = {
        id: editingId || crypto.randomUUID(),
        vessel_name: formData.vessel_name || "",
        company_name: formData.company_name || "",
        position: formData.position || "",
        location: formData.location || "",
        embark_datetime: formData.embark_datetime || "",
        disembark_datetime: formData.disembark_datetime || "",
        hitch_regime: formData.hitch_regime || "",
        notes: formData.notes || "",
      };
      storageService.saveEmbarkation(newItem);
    } else {
      // 12 Months Generation
      // Use T12:00:00 to avoid timezone midnight shift issues during loop
      let currentStart = new Date(formData.embark_datetime! + 'T12:00:00');
      const regime = formData.hitch_regime || "14x14";
      let daysOn = 14, daysOff = 14;

      if (regime.includes("28")) { daysOn = 28; daysOff = 28; }
      else if (regime.includes("21")) { daysOn = 21; daysOff = 21; }
      else if (regime.includes("45")) { daysOn = 45; daysOff = 45; }

      // Generate for ~1 year
      for (let i = 0; i < 12; i++) { 
        const end = new Date(currentStart);
        end.setDate(currentStart.getDate() + daysOn);
        
        const newItem: Embarkation = {
          id: crypto.randomUUID(),
          vessel_name: formData.vessel_name || "",
          company_name: formData.company_name || "",
          position: formData.position || "",
          location: formData.location || "",
          embark_datetime: currentStart.toISOString().split('T')[0],
          disembark_datetime: end.toISOString().split('T')[0],
          hitch_regime: regime,
          notes: formData.notes || `Escala gerada automaticamente (${i+1}/12)`,
        };

        storageService.saveEmbarkation(newItem);

        // Setup next start
        const nextStart = new Date(end);
        nextStart.setDate(end.getDate() + daysOff);
        currentStart = nextStart;

        // Break if we exceed 1 year from initial date
        const initialDate = new Date(formData.embark_datetime! + 'T12:00:00');
        const oneYearLater = new Date(initialDate);
        oneYearLater.setFullYear(initialDate.getFullYear() + 1);
        if (currentStart > oneYearLater) break;
      }
    }

    refreshList();
    closeModal();
  };

  const deleteItem = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este embarque?")) {
      storageService.deleteEmbarkation(id);
      refreshList();
    }
  };

  const deleteAll = () => {
    if (confirmDeleteAll) {
      storageService.deleteAllEmbarkations();
      refreshList();
      setConfirmDeleteAll(false);
    } else {
      setConfirmDeleteAll(true);
    }
  };

  const openModal = (item?: Embarkation) => {
    setRepeatSchedule(false);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        vessel_name: "",
        company_name: "",
        position: "Oficial de Náutica",
        location: "",
        embark_datetime: "",
        disembark_datetime: "",
        hitch_regime: "14x14",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header aligned with Agenda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Registro de Embarques</h2>
          <p className="text-slate-500 mt-1">Gerencie suas escalas e dias de mar.</p>
        </div>
        <div className="flex items-center gap-3">
          {list.length > 0 && (
             <button
               type="button"
               onClick={deleteAll}
               className={`group flex items-center justify-center h-10 rounded-xl transition-all shadow-sm border ${
                 confirmDeleteAll 
                 ? "w-auto px-4 bg-red-600 text-white border-red-600 hover:bg-red-700 gap-2" 
                 : "w-10 bg-red-50 text-red-600 border-red-100 hover:bg-red-500 hover:text-white"
               }`}
               title="Apagar Tudo"
             >
               <Trash2 size={18} />
               {confirmDeleteAll && <span className="text-sm font-bold whitespace-nowrap">Confirmar?</span>}
             </button>
          )}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
          >
            <Plus size={18} />
            <span>Novo Embarque</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {list.map((item) => {
          const days = calculateDays(item.embark_datetime, item.disembark_datetime);
          
          return (
             <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group">
               <div className="flex flex-col md:flex-row justify-between gap-6">
                 
                 {/* Left Content */}
                 <div className="flex-1">
                   <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                         <Ship size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{item.vessel_name || "Vessel Name"}</h3>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                {item.hitch_regime}
                            </span>
                            <span className="text-sm text-slate-500">{item.company_name}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm text-slate-600 pl-16">
                      <div className="flex items-center gap-2">
                         <Calendar size={16} className="text-slate-400" />
                         <span className="font-medium">
                            {formatDate(item.embark_datetime)} — {formatDate(item.disembark_datetime)}
                         </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Anchor size={16} className="text-slate-400" />
                        <span>{days} dias a bordo</span>
                      </div>
                   </div>
                 </div>

                 {/* Right Actions */}
                 <div className="flex items-center gap-2 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                    <button 
                      type="button"
                      onClick={() => openModal(item)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
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
               <Anchor className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Sem embarques futuros</h3>
            <p className="text-slate-400 max-w-xs mx-auto mt-1">Sua fila de embarques está vazia. Embarques passados são arquivados.</p>
          </div>
        )}
      </div>

      {/* Modal - Same style as Agenda */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Embarque' : 'Novo Embarque'}</h3>
                <p className="text-sm text-slate-500">Insira os detalhes da escala.</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nome do Navio</label>
                <input 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" 
                  value={formData.vessel_name} 
                  onChange={e => setFormData({...formData, vessel_name: e.target.value})} 
                  placeholder="Ex: NS CONSTELLATION" 
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Empresa</label>
                   <input 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" 
                     value={formData.company_name} 
                     onChange={e => setFormData({...formData, company_name: e.target.value})} 
                     placeholder="Ex: Bram" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Escala</label>
                   <select 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white appearance-none"
                      value={formData.hitch_regime}
                      onChange={e => setFormData({...formData, hitch_regime: e.target.value})}
                   >
                     <option value="14x14">14 x 14</option>
                     <option value="28x28">28 x 28</option>
                     <option value="21x21">21 x 21</option>
                     <option value="45x45">45 x 45</option>
                     <option value="Outro">Outro</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Data Embarque</label>
                   <input 
                     type="date" 
                     required 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600" 
                     value={formData.embark_datetime} 
                     onChange={e => handleDateChange('embark_datetime', e.target.value)} 
                   />
                </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Data Desembarque</label>
                   <input 
                     type="date" 
                     required 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600"
                     value={formData.disembark_datetime} 
                     onChange={e => setFormData({...formData, disembark_datetime: e.target.value})} 
                   />
                </div>
              </div>

              {!editingId && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      id="repeat"
                      className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500"
                      checked={repeatSchedule}
                      onChange={e => setRepeatSchedule(e.target.checked)}
                    />
                  </div>
                  <label htmlFor="repeat" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                    Repetir escala por 12 meses
                  </label>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={closeModal} 
                   className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit" 
                   className="px-8 py-3 rounded-xl font-medium bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all"
                 >
                   Salvar
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Embarkations;
