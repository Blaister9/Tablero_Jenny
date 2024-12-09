// frontend/src/hooks/useContratistaOptions.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useContratistaOptions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contratistas-options'],
    queryFn: async () => {
      const { data } = await api.get('/contracts/contratistas-options/')
      return data
    },
    staleTime: 1000 * 60
  })

  return { data: data || [], isLoading, error }
}
