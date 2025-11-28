
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { storageService } from '../services/storageService';
import { Trash, Calendar, StickyNote, Plus, Search } from 'lucide-react';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [category, setCategory] = useState<Note['category']>('Profissional');

  useEffect(() => { setNotes(storageService.getNotes()); }, []);

  const handleAdd = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      title: 'Log Entry', // Simplified
      date: new Date().toISOString(),
      category: category,
      content: newNote,
      tags: []
    };
    storageService.saveNote(note);
    setNotes(storageService.getNotes());
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    storageService.deleteNote(id);
    setNotes(storageService.getNotes());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
         <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Diário de Bordo</h2>
         <p className="text-slate-500 mt-1">Registre eventos, reflexões e dados técnicos.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100 relative focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <textarea
          className="w-full p-2 text-slate-700 placeholder:text-slate-400 border-none focus:ring-0 outline-none resize-none h-32 bg-transparent text-lg leading-relaxed"
          placeholder="O que aconteceu hoje?"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4">
           <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-slate-400 uppercase mr-2">Categoria:</span>
             <div className="relative">
                <select 
                  className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option>Profissional</option>
                  <option>Pessoal</option>
                  <option>Estudos</option>
                  <option>Outro</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
             </div>
           </div>
           <button 
             onClick={handleAdd}
             disabled={!newNote.trim()}
             className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
           >
             <Plus size={18} />
             <span>Registrar</span>
           </button>
        </div>
      </div>

      <div className="grid gap-6">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-blue-500 transition-colors"></div>
             <div className="pl-4">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg ${
                       note.category === 'Profissional' ? 'bg-blue-50 text-blue-700' : 
                       note.category === 'Pessoal' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                     }`}>
                       {note.category}
                     </span>
                     <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                       <Calendar size={12} />
                       {new Date(note.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                     </span>
                  </div>
                  <button onClick={() => deleteNote(note.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                    <Trash size={16} />
                  </button>
               </div>
               <p className="text-slate-600 whitespace-pre-line leading-relaxed text-base">{note.content}</p>
             </div>
          </div>
        ))}
         {notes.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <StickyNote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">Seu diário está vazio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
