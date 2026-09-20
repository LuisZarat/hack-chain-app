import { useQuery } from '@tanstack/react-query';
import { vacancyService } from '@/services/vacancyService';

export function useVacancyDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ['vacancy', slug],
    queryFn: () => vacancyService.getBySlug(slug as string),
    enabled: Boolean(slug),
    retry: 1,
  });
}
