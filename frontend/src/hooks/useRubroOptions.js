// frontend/src/hooks/useRubroOptions.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useRubroOptions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rubros-options'],
    queryFn: async () => {
      const { data } = await api.get('/contracts/rubros-options/')
      return data
    },
    staleTime: 1000 * 60
  })

  return { data: data || [], isLoading, error }
}
