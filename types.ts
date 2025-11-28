
export enum HitchStatus {
  PLANNED = 'Planejado',
  ONGOING = 'Embarcado',
  COMPLETED = 'Concluído'
}

export interface Embarkation {
  id: string;
  vessel_name: string;
  company_name: string;
  position: string;
  location: string;
  embark_datetime: string; // ISO Date
  disembark_datetime: string; // ISO Date
  hitch_regime: string;
  notes: string;
}

export enum LeaveType {
  COURSE = 'Curso',
  VACATION = 'Férias',
  DAY_OFF = 'Folga',
  TIME_BANK = 'Banco de Horas',
  OTHER = 'Outro'
}

export interface Leave {
  id: string;
  title: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  status: 'Planejado' | 'Aprovado' | 'Concluído';
  notes: string;
}

export enum DocType {
  COURSE = 'Curso',
  CERTIFICATE = 'Certificado',
  DOCUMENT = 'Documento' // Passport, Seaman Book
}

export enum DocStatus {
  VALID = 'Válido',
  EXPIRING = 'A Vencer', // Within 60 days
  EXPIRED = 'Vencido'
}

export interface TrainingDoc {
  id: string;
  name: string;
  type: DocType;
  institution?: string;
  issue_date: string;
  expiry_date?: string; // Some courses don't expire
  doc_number?: string;
  notes: string;
  attachment_data?: string; // Base64 Data URL
  attachment_name?: string; // File name
}

export interface Note {
  id: string;
  title: string;
  date: string;
  category: 'Profissional' | 'Pessoal' | 'Estudos' | 'Saúde' | 'Financeiro' | 'Outro';
  content: string;
  tags: string[];
}

export interface SeaTimeEntry {
  id: string;
  vessel_name: string;
  start_date: string;
  end_date: string;
}
