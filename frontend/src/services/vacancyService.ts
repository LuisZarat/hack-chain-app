import { api } from '@/services/api';
import type {
  ApplicationPayload,
  ApplicationsResponse,
  Vacancy,
  VacancyApplicationDetailResponse,
  VacancyDetailResponse,
  VacancyFilters,
  VacancyListResponse,
  VacancyPayload,
} from '@/types/vacancy';

export const vacancyService = {
  list(filters: VacancyFilters = {}) {
    const params = new URLSearchParams();
    if (filters.area) params.set('area', filters.area);
    if (filters.modalidad) params.set('modalidad', filters.modalidad);
    if (filters.q?.trim()) params.set('q', filters.q.trim());
    const query = params.toString();
    return api.getPublic<VacancyListResponse>(`/api/vacancies${query ? `?${query}` : ''}`);
  },

  getBySlug(slug: string) {
    return api.getPublic<VacancyDetailResponse>(`/api/vacancies/${encodeURIComponent(slug)}`);
  },

  listMine() {
    return api.get<VacancyListResponse>(`/api/vacancies/mine`);
  },

  create(payload: VacancyPayload) {
    return api.post<Vacancy>('/api/vacancies', payload);
  },

  update(id: string, payload: Partial<VacancyPayload>) {
    return api.put<Vacancy>(`/api/vacancies/${id}`, payload);
  },

  close(id: string) {
    return api.post<{ vacancy: Vacancy }>(`/api/vacancies/${id}/close`);
  },

  apply(id: string, payload: ApplicationPayload) {
    return api.post<{ application: VacancyApplicationDetailResponse['application'] }>(`/api/vacancies/${id}/applications`, payload);
  },

  listMyApplications() {
    return api.get<ApplicationsResponse>('/api/vacancies/applications/mine');
  },

  listApplications(id: string) {
    return api.get<ApplicationsResponse>(`/api/vacancies/${id}/applications`);
  },

  getApplication(id: string) {
    return api.get<VacancyApplicationDetailResponse>(`/api/vacancies/applications/${id}`);
  },

  updateApplicationStatus(id: string, status: 'contactado' | 'descartada') {
    return api.put<VacancyApplicationDetailResponse>(`/api/vacancies/applications/${id}`, { status });
  },
};
