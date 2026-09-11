import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vacancyService } from '@/services/vacancyService';

export function useVacancyApplications(vacancyId: string | undefined) {
  return useQuery({
    queryKey: ['vacancy-applications', vacancyId],
    queryFn: () => vacancyService.listApplications(vacancyId as string),
    enabled: Boolean(vacancyId),
    retry: 1,
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: vacancyService.listMyApplications,
    retry: 1,
  });
}

export function useUpdateApplicationStatus(vacancyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'contactado' | 'descartada' }) => vacancyService.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancy-applications', vacancyId] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
}
