export type Language = 'en' | 'bn';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
}

export interface VaccineRecord {
  vaccine: string;
  targetAgeEn: string;
  targetAgeBn: string;
  status: 'done' | 'due';
  dateOrDueEn: string;
  dateOrDueBn: string;
  batch?: string;
}

export interface TeamMember {
  name: string;
  nameBn: string;
  roleEn: string;
  roleBn: string;
  grade: string;
  initials: string;
  descEn: string;
  descBn: string;
}
