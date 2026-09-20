export const VACANCY_AREAS = [
  'frontend', 'backend', 'fullstack', 'mobile', 'data', 'devops', 'cloud',
  'ciberseguridad', 'blockchain', 'qa', 'diseno', 'producto', 'soporte',
] as const;

export const VACANCY_MODALITIES = ['remoto', 'presencial', 'hibrido'] as const;
export const VACANCY_SALARY_PERIODS = ['mes', 'hora', 'proyecto'] as const;

export type VacancyArea = (typeof VACANCY_AREAS)[number];
export type VacancyModality = (typeof VACANCY_MODALITIES)[number];
export type VacancySalaryPeriod = (typeof VACANCY_SALARY_PERIODS)[number];
export type VacancyStatus = 'abierta' | 'cerrada';
export type ApplicationStatus = 'enviada' | 'vista' | 'contactado' | 'descartada' | 'cerrada_sin_respuesta';

export interface Vacancy {
  id: string;
  slug: string;
  position: string;
  company: string;
  area: VacancyArea;
  modality: VacancyModality;
  country: string | null;
  city: string | null;
  salary_min: string | number;
  salary_max: string | number;
  salary_currency: string;
  salary_period: VacancySalaryPeriod;
  description?: string;
  requirements?: string[];
  closing_date: string;
  days_to_close?: number;
  status?: VacancyStatus;
  published_at: string;
  closed_at?: string | null;
  recruiter_wallet_address?: string;
  applications_count?: number;
  unreviewed_count?: number;
}

export interface VacancyDetailResponse {
  vacancy: Vacancy;
  unverified_company_notice: string;
}

export interface VacancyListResponse {
  vacancies: Vacancy[];
}

export interface VacancyFilters {
  area?: VacancyArea;
  modalidad?: VacancyModality;
  q?: string;
}

export interface VacancyPayload {
  position: string;
  company: string;
  area: VacancyArea;
  modality: VacancyModality;
  country?: string | null;
  city?: string | null;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  salary_period: VacancySalaryPeriod;
  description: string;
  requirements: string[];
  closing_date?: string;
}

export interface VacancyApplication {
  id: string;
  vacancy?: { id: string; slug: string; position: string; company: string; status: VacancyStatus } | null;
  vacancy_id?: string;
  student_wallet_address?: string;
  student_name?: string | null;
  shared_certificates: string[] | SharedCertificate[];
  message: string | null;
  status: ApplicationStatus;
  submitted_at: string;
  viewed_at?: string | null;
}

export interface SharedCertificate {
  token_id: string;
  title: string | null;
  issue_date: string | null;
  chain_verification_url: string | null;
}

export interface ApplicationsResponse {
  applications: VacancyApplication[];
}

export interface VacancyApplicationDetailResponse {
  application: VacancyApplication;
  transitioned_to_viewed?: boolean;
}

export interface ApplicationPayload {
  shared_certificates: string[];
  message?: string | null;
}
