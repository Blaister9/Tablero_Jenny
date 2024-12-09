// frontend/src/hooks/useAdicionesStats.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useAdicionesStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adiciones-stats'],
    queryFn: async () => {
      const { data } = await api.get('/contracts/adiciones-stats/')
      return data
    },
    staleTime: 1000 * 60
  })

  return { data, isLoading, error }
}
