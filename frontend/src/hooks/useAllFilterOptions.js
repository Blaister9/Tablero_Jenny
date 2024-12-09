// frontend/src/hooks/useAllFilterOptions.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useAllFilterOptions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['filters-options'],
    queryFn: async () => {
      const { data } = await api.get('/contracts/filters-options/')
      return data
    },
    staleTime: 1000 * 60
  })

  return { data, isLoading, error }
}
