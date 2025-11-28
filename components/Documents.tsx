
import React, { useState, useEffect } from 'react';
import { TrainingDoc, DocType, DocStatus } from '../types';
import { storageService, getDocStatus } from '../services/storageService';
import { Plus, Trash2, Edit2, FileText, Award, Eye, Paperclip, X, ShieldCheck } from 'lucide-react';

const Documents: React.FC = () => {
  const [list, setList] = useState<TrainingDoc[]>([]);
  const [filter, setFilter] = useState<'ALL' | DocType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TrainingDoc>>({
    name: '', type: DocType.CERTIFICATE, institution: '', issue_date: '', expiry_date: '', doc_number: '', notes: '', attachment_data: '', attachment_name: ''
  });

  useEffect(() => { setList(storageService.getDocs()); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: TrainingDoc = {
      id: editingId || crypto.randomUUID(),
      name: formData.name || '',
      type: formData.type || DocType.CERTIFICATE,
      institution: formData.institution || '',
      issue_date: formData.issue_date || '',
      expiry_date: formData.expiry_date || undefined,
      doc_number: formData.doc_number || '',
      notes: formData.notes || '',
      attachment_data: formData.attachment_data,
      attachment_name: formData.attachment_name
    };
    storageService.saveDoc(newDoc);
    setList(storageService.getDocs());
    closeModal();
  };

  const deleteItem = (id: string) => {
    if(confirm('Excluir este documento?')) {
      storageService.deleteDoc(id);
      setList(storageService.getDocs());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Arquivo muito grande (Máx 1.5MB).");
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, attachment_data: reader.result as string, attachment_name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => { setFormData({ ...formData, attachment_data: undefined, attachment_name: undefined }); };
  const openAttachment = (dataUrl: string) => {
    const newWindow = window.open();
    if (newWindow) newWindow.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  };

  const openModal = (item?: TrainingDoc) => {
    if (item) { setEditingId(item.id); setFormData(item); } 
    else { setEditingId(null); setFormData({ name: '', type: DocType.CERTIFICATE, institution: '', issue_date: '', expiry_date: '', doc_number: '', notes: '', attachment_data: '', attachment_name: '' }); }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };
  const filteredList = filter === 'ALL' ? list : list.filter(d => d.type === filter);

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Documentos</h2>
           <p className="text-slate-500 mt-1">Gerencie certificados e licenças.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium">
          <Plus size={18} /> <span>Novo Documento</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {[{ key: 'ALL', label: 'Todos' }, { key: DocType.CERTIFICATE, label: 'Certificados' }, { key: DocType.COURSE, label: 'Cursos' }, { key: DocType.DOCUMENT, label: 'Documentos' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === t.key ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' : 'bg-white text-slate-500 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredList.map((doc) => {
          const status = getDocStatus(doc.expiry_date);
          let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
          if (status === DocStatus.EXPIRING) statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
          if (status === DocStatus.EXPIRED) statusColor = 'bg-red-50 text-red-700 border-red-100';

          return (
            <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-5">
                   <div className={`p-3 rounded-2xl transition-all ${doc.type === DocType.COURSE ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white'}`}>
                      {doc.type === DocType.COURSE ? <Award size={22} /> : <FileText size={22} />}
                   </div>
                   <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                      {status}
                   </div>
                </div>

                <h3 className="font-bold text-lg text-slate-800 mb-1 truncate leading-tight" title={doc.name}>{doc.name}</h3>
                <p className="text-xs font-mono text-slate-400 mb-6">{doc.doc_number || 'S/ Número'}</p>

                <div className="space-y-3">
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase">Validade</span>
                      <span className={`text-sm font-bold ${status !== DocStatus.VALID ? 'text-red-500' : 'text-slate-700'}`}>
                         {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('pt-BR') : 'Indefinida'}
                      </span>
                   </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    {doc.attachment_data ? (
                      <button onClick={() => openAttachment(doc.attachment_data!)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                        <Eye size={14} /> Visualizar
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic pl-2">Sem anexo</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(doc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => deleteItem(doc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
      {filteredList.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
             <p className="text-slate-400">Nenhum documento encontrado.</p>
          </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Documento' : 'Novo Documento'}</h3>
                <button onClick={closeModal}><X className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nome</label>
                 <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Certificado DP Avançado" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tipo</label>
                   <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as DocType})}>
                      {Object.values(DocType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Número</label>
                   <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" value={formData.doc_number} onChange={e => setFormData({...formData, doc_number: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Emissão</label>
                   <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600" value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} />
                </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Validade</label>
                   <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-600" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Instituição</label>
                 <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Anexo</label>
                {!formData.attachment_data ? (
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer group">
                    <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2">
                       <div className="bg-blue-50 p-3 rounded-full text-blue-500 group-hover:scale-110 transition-transform"><Paperclip size={20} /></div>
                       <span className="text-sm text-slate-600 font-medium">Clique para enviar arquivo</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-white p-2 rounded-lg shadow-sm"><Paperclip size={16} className="text-blue-500" /></div>
                      <span className="text-sm font-medium text-blue-900 truncate">{formData.attachment_name || 'Anexo'}</span>
                    </div>
                    <button type="button" onClick={removeAttachment} className="p-2 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"><X size={16} /></button>
                  </div>
                )}
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

export default Documents;
