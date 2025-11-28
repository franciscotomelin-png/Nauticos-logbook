
import { Embarkation, Leave, TrainingDoc, Note, SeaTimeEntry, DocStatus, HitchStatus, DocType } from '../types';

const STORAGE_KEYS = {
  EMBARKATIONS: 'mariner_embarkations',
  LEAVES: 'mariner_leaves',
  DOCS: 'mariner_docs',
  NOTES: 'mariner_notes',
  SEA_TIME: 'mariner_sea_time'
};

// Helper to calculate days between dates
export const calculateDays = (start: string, end: string): number => {
  const s = new Date(start + 'T12:00:00'); // Use noon to avoid timezone offsets
  const e = new Date(end + 'T12:00:00');
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include start day
};

export const getDocStatus = (expiryDate?: string): DocStatus => {
  if (!expiryDate) return DocStatus.VALID;
  const today = new Date();
  const expiry = new Date(expiryDate + 'T12:00:00');
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return DocStatus.EXPIRED;
  if (diffDays <= 90) return DocStatus.EXPIRING; // Changed from 60 to 90 days (3 months)
  return DocStatus.VALID;
};

export const getHitchStatus = (start: string, end: string): HitchStatus => {
  const today = new Date().toISOString().split('T')[0];
  
  if (today < start) return HitchStatus.PLANNED;
  if (today >= start && today <= end) return HitchStatus.ONGOING;
  return HitchStatus.COMPLETED;
};

// Generic Load/Save
const load = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Service Methods
export const storageService = {
  // Embarkations
  getEmbarkations: (): Embarkation[] => load<Embarkation>(STORAGE_KEYS.EMBARKATIONS).sort((a, b) => new Date(b.embark_datetime).getTime() - new Date(a.embark_datetime).getTime()),
  saveEmbarkation: (item: Embarkation) => {
    const list = load<Embarkation>(STORAGE_KEYS.EMBARKATIONS);
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    save(STORAGE_KEYS.EMBARKATIONS, list);
  },
  deleteEmbarkation: (id: string) => {
    const list = load<Embarkation>(STORAGE_KEYS.EMBARKATIONS).filter(i => i.id !== id);
    save(STORAGE_KEYS.EMBARKATIONS, list);
  },
  deleteAllEmbarkations: () => {
    save(STORAGE_KEYS.EMBARKATIONS, []);
  },

  // Leaves
  getLeaves: (): Leave[] => load<Leave>(STORAGE_KEYS.LEAVES).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()),
  saveLeave: (item: Leave) => {
    const list = load<Leave>(STORAGE_KEYS.LEAVES);
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    save(STORAGE_KEYS.LEAVES, list);
  },
  deleteLeave: (id: string) => {
    const list = load<Leave>(STORAGE_KEYS.LEAVES).filter(i => i.id !== id);
    save(STORAGE_KEYS.LEAVES, list);
  },

  // Docs & Trainings
  getDocs: (): TrainingDoc[] => load<TrainingDoc>(STORAGE_KEYS.DOCS).sort((a, b) => {
     // Sort by expiry date (asc) so expiring soon comes first
     if (!a.expiry_date) return 1;
     if (!b.expiry_date) return -1;
     return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
  }),
  saveDoc: (item: TrainingDoc) => {
    const list = load<TrainingDoc>(STORAGE_KEYS.DOCS);
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    save(STORAGE_KEYS.DOCS, list);
  },
  deleteDoc: (id: string) => {
    const list = load<TrainingDoc>(STORAGE_KEYS.DOCS).filter(i => i.id !== id);
    save(STORAGE_KEYS.DOCS, list);
  },

  // Notes
  getNotes: (): Note[] => load<Note>(STORAGE_KEYS.NOTES).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  saveNote: (item: Note) => {
    const list = load<Note>(STORAGE_KEYS.NOTES);
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    save(STORAGE_KEYS.NOTES, list);
  },
  deleteNote: (id: string) => {
    const list = load<Note>(STORAGE_KEYS.NOTES).filter(i => i.id !== id);
    save(STORAGE_KEYS.NOTES, list);
  },

  // Sea Time History (Calculadora)
  getSeaTimeHistory: (): SeaTimeEntry[] => load<SeaTimeEntry>(STORAGE_KEYS.SEA_TIME).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()),
  saveSeaTimeEntry: (item: SeaTimeEntry) => {
    const list = load<SeaTimeEntry>(STORAGE_KEYS.SEA_TIME);
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    save(STORAGE_KEYS.SEA_TIME, list);
  },
  deleteSeaTimeEntry: (id: string) => {
    const list = load<SeaTimeEntry>(STORAGE_KEYS.SEA_TIME).filter(i => i.id !== id);
    save(STORAGE_KEYS.SEA_TIME, list);
  },
  
  // Seeding
  seedData: () => {
    // App inicia vazio conforme solicitado
  }
};
