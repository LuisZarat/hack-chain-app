import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vacancyService } from '@/services/vacancyService';
import type { ApplicationPayload } from '@/types/vacancy';

export function useApplyToVacancy(vacancyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplicationPayload) => vacancyService.apply(vacancyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
}
