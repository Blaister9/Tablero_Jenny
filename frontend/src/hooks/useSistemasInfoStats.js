// frontend/src/hooks/useSistemasInfoStats.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useSistemasInfoStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sistemas-info-stats'],
    queryFn: async () => {
      const { data } = await api.get('/contracts/sistemas-info-stats/')
      return data
    },
    staleTime: 1000 * 60
  })

  return { data: data || [], isLoading, error }
}
