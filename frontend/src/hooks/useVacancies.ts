import { useQuery } from '@tanstack/react-query';
import { vacancyService } from '@/services/vacancyService';
import type { VacancyFilters } from '@/types/vacancy';

export function useVacancies(filters: VacancyFilters = {}) {
  return useQuery({
    queryKey: ['vacancies', filters],
    queryFn: () => vacancyService.list(filters),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMyVacancies() {
  return useQuery({
    queryKey: ['my-vacancies'],
    queryFn: vacancyService.listMine,
    retry: 1,
  });
}
