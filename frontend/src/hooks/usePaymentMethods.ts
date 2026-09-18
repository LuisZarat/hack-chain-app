import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { PaymentMethods } from '@/types/dashboard';

interface PaymentMethodsResponse {
  payment_methods: PaymentMethods | null;
}

export function useMyPaymentMethods() {
  return useQuery({
    queryKey: ['my-payment-methods'],
    queryFn: async () => {
      const data = await api.get<PaymentMethodsResponse>('/api/issuers/me/payment-methods');
      return data.payment_methods;
    },
    staleTime: 60_000,
  });
}

export function useUpdatePaymentMethods() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<PaymentMethods>) => {
      const data = await api.patch<PaymentMethodsResponse>('/api/issuers/me/payment-methods', payload);
      return data.payment_methods;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-payment-methods'] });
    },
  });
}