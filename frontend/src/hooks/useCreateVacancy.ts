import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vacancyService } from '@/services/vacancyService';
import type { VacancyPayload } from '@/types/vacancy';

export function useCreateVacancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VacancyPayload) => vacancyService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-vacancies'] }),
  });
}

export function useUpdateVacancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VacancyPayload> }) => vacancyService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['vacancy'] });
      queryClient.invalidateQueries({ queryKey: ['vacancy-applications', variables.id] });
    },
  });
}

export function useCloseVacancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vacancyService.close(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['my-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['vacancy'] });
      queryClient.invalidateQueries({ queryKey: ['vacancy-applications', id] });
    },
  });
}
