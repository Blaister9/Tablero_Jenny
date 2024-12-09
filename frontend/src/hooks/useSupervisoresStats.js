// frontend/src/hooks/useSupervisoresStats.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useSupervisoresStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['supervisores-stats'],
    queryFn: async () => {
      const { data } = await api.get('/contracts/supervisores-stats/')
      return data
    },
    staleTime: 1000 * 60
  })

  return { data: data || [], isLoading, error }
}
