
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LeaveType } from '../types';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const embarkations = storageService.getEmbarkations();
  const docs = storageService.getDocs();
  const leaves = storageService.getLeaves();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for offset
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-slate-50/50 border-b border-r border-slate-100" />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const dayEmbs = embarkations.filter(e => dateStr >= e.embark_datetime && dateStr <= e.disembark_datetime);
      const dayDocs = docs.filter(doc => doc.expiry_date === dateStr);
      const dayLeaves = leaves.filter(l => dateStr >= l.start_date && dateStr <= l.end_date);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div key={d} className={`h-28 border-b border-r border-slate-100 p-2 overflow-hidden transition-colors hover:bg-slate-50 group relative ${isToday ? 'bg-blue-50/20' : 'bg-white'}`}>
          <div className={`text-sm font-bold mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {d}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[calc(100%-32px)] no-scrollbar">
             {dayEmbs.map(e => (
               <div key={e.id} className="text-[10px] font-medium bg-blue-100 text-blue-800 px-1.5 py-1 rounded-md border border-blue-200 truncate shadow-sm">
                 ⚓ {e.vessel_name}
               </div>
             ))}
             {dayLeaves.map(l => {
               let icon = '📅';
               if (l.leave_type === LeaveType.VACATION) icon = '🌴';
               else if (l.leave_type === LeaveType.COURSE) icon = '🎓';
               
               return (
                 <div key={l.id} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-1.5 py-1 rounded-md border border-indigo-100 truncate">
                   {icon} {l.title}
                 </div>
               );
             })}
             {dayDocs.map(doc => (
               <div key={doc.id} className="text-[10px] font-medium bg-amber-50 text-amber-700 px-1.5 py-1 rounded-md border border-amber-100 truncate">
                 ⚠️ {doc.name}
               </div>
             ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
        <h2 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">
          {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"><ChevronLeft /></button>
          <button onClick={nextMonth} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"><ChevronRight /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-slate-100 gap-px border-l border-t border-slate-100">
        {renderDays()}
      </div>
    </div>
  );
};

export default CalendarView;
