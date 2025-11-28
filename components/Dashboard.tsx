
import React, { useEffect, useState } from 'react';
import { Embarkation, TrainingDoc, DocStatus, HitchStatus, SeaTimeEntry } from '../types';
import { storageService, calculateDays, getDocStatus, getHitchStatus } from '../services/storageService';
import { AlertTriangle, Clock, CheckCircle, Ship, ArrowRight, Activity, Calculator } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [embarkations, setEmbarkations] = useState<Embarkation[]>([]);
  const [docs, setDocs] = useState<TrainingDoc[]>([]);
  const [seaTimeHistory, setSeaTimeHistory] = useState<SeaTimeEntry[]>([]);
  const [nextHitch, setNextHitch] = useState<Embarkation | null>(null);
  const [currentStatus, setCurrentStatus] = useState<HitchStatus>(HitchStatus.COMPLETED);

  useEffect(() => {
    const loadedEmbs = storageService.getEmbarkations();
    const loadedDocs = storageService.getDocs();
    const loadedHistory = storageService.getSeaTimeHistory();
    setEmbarkations(loadedEmbs);
    setDocs(loadedDocs);
    setSeaTimeHistory(loadedHistory);

    const today = new Date().toISOString().split('T')[0];
    const upcoming = loadedEmbs.filter(e => e.embark_datetime >= today || (e.embark_datetime <= today && e.disembark_datetime >= today))
                               .sort((a,b) => new Date(a.embark_datetime).getTime() - new Date(b.embark_datetime).getTime());
    
    if (upcoming.length > 0) {
      setNextHitch(upcoming[0]);
      setCurrentStatus(getHitchStatus(upcoming[0].embark_datetime, upcoming[0].disembark_datetime));
    }
  }, []);

  // --- Calculation Logic for Past Days Only ---
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Normalize today to noon to compare accurately

  const calculatePastOverlap = (startStr: string, endStr: string, limitStart?: Date) => {
    if (!startStr || !endStr) return 0;
    
    const start = new Date(startStr + 'T12:00:00');
    const end = new Date(endStr + 'T12:00:00');
    
    // Define the window of time we are interested in: [limitStart or -Infinity, Today]
    // The "Today" limit ensures we NEVER count future days.
    const windowEnd = today;
    const windowStart = limitStart ? new Date(limitStart) : new Date(0);
    windowStart.setHours(12, 0, 0, 0);

    // Calculate Intersection
    const effectiveStart = start < windowStart ? windowStart : start;
    const effectiveEnd = end > windowEnd ? windowEnd : end;

    // If the effective start is after the effective end, there is no overlap in the past
    if (effectiveStart > effectiveEnd) return 0;

    const diffTime = effectiveEnd.getTime() - effectiveStart.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // 1. Days Onboard This Year (Past Only)
  const currentYear = today.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const daysOnboardThisYear = embarkations.reduce((acc, curr) => {
    return acc + calculatePastOverlap(curr.embark_datetime, curr.disembark_datetime, startOfYear);
  }, 0);

  // 2. Total Career Days (Past Only: Historical + App)
  // Historical entries are assumed past, but we clip them to today just in case.
  const historicalDaysPast = seaTimeHistory.reduce((acc, curr) => {
    return acc + calculatePastOverlap(curr.start_date, curr.end_date);
  }, 0);

  // App entries are clipped to today.
  const appDaysPast = embarkations.reduce((acc, curr) => {
    return acc + calculatePastOverlap(curr.embark_datetime, curr.disembark_datetime);
  }, 0);

  const totalCareerDays = historicalDaysPast + appDaysPast;
  // --------------------------------------------

  const expiringDocs = docs.filter(d => {
    const status = getDocStatus(d.expiry_date);
    return status === DocStatus.EXPIRING || status === DocStatus.EXPIRED;
  });

  // Helper to format date string YYYY-MM-DD to DD/MM/YYYY without timezone shift
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const StatCard = ({ title, value, sub, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
         <div className={`p-3 rounded-2xl ${bgClass} transition-colors group-hover:scale-105 duration-300`}>
           <Icon className={`w-6 h-6 ${colorClass}`} />
         </div>
         {title === 'Alertas' && Number(value) > 0 && (
           <span className="flex h-3 w-3 relative">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
           </span>
         )}
      </div>
      <div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Painel de Controle</h2>
        <p className="text-slate-500 mt-1">Visão geral da sua carreira marítima.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Next Hitch */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-900/20 text-white flex flex-col justify-between relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Ship size={100} />
          </div>
          <div>
             <div className="flex items-center gap-2 mb-4 opacity-80">
                <Ship size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Status Atual</span>
             </div>
             {nextHitch ? (
               <div className="relative z-10">
                 <p className="text-2xl font-bold leading-tight mb-1">{nextHitch.vessel_name}</p>
                 <p className="text-blue-100 text-sm mb-4">{nextHitch.company_name}</p>
                 <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                    {currentStatus}
                 </div>
                 <p className="mt-4 text-xs opacity-70">
                    {formatDate(nextHitch.embark_datetime)} — {formatDate(nextHitch.disembark_datetime)}
                 </p>
               </div>
            ) : (
              <div className="relative z-10">
                 <p className="text-xl font-medium opacity-90">Em terra</p>
                 <p className="text-sm opacity-60 mt-1">Nenhum embarque ativo.</p>
              </div>
            )}
          </div>
        </div>

        <StatCard 
          title={`Dias Embarcado (${currentYear})`} 
          value={daysOnboardThisYear} 
          sub="Este ano" 
          icon={Clock} 
          colorClass="text-emerald-600" 
          bgClass="bg-emerald-50"
        />

        <StatCard 
          title="Total Dias Embarcado" 
          value={totalCareerDays} 
          sub="Carreira (Calculadora + App)" 
          icon={Calculator} 
          colorClass="text-indigo-600" 
          bgClass="bg-indigo-50"
        />

        <StatCard 
          title="Alertas" 
          value={expiringDocs.length} 
          sub="Documentos precisando atenção" 
          icon={expiringDocs.length > 0 ? AlertTriangle : CheckCircle} 
          colorClass={expiringDocs.length > 0 ? "text-amber-600" : "text-blue-600"} 
          bgClass={expiringDocs.length > 0 ? "bg-amber-50" : "bg-blue-50"}
        />
      </div>

      {/* Actionable List */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
             <div className="bg-red-50 p-2 rounded-xl text-red-600">
               <Activity size={20} />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Ações Urgentes</h3>
           </div>
           {expiringDocs.length > 3 && <span className="text-xs font-medium text-slate-400">Ver todos</span>}
        </div>
        
        <div className="space-y-4">
            {expiringDocs.slice(0, 3).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-red-50 hover:border-red-100 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-12 rounded-full bg-red-400"></div>
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-red-700 transition-colors">{doc.name}</p>
                    <p className="text-xs text-slate-500 group-hover:text-red-600">Vence em: {formatDate(doc.expiry_date!)}</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-red-400 transform group-hover:translate-x-1 transition-all" />
              </div>
            ))}
            {expiringDocs.length === 0 && (
              <div className="text-center py-8 text-slate-400 flex flex-col items-center">
                 <CheckCircle className="w-10 h-10 text-slate-200 mb-2" />
                 <p className="text-sm">Nenhuma pendência urgente.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
