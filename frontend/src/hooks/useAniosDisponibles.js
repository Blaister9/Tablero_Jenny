// frontend/src/hooks/useAniosDisponibles.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useAniosDisponibles = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['anios-disponibles'],
    queryFn: async () => {
      const { data } = await api.get('/contracts/anios-options/')
      return data
    },
    staleTime: 1000 * 60
  })

  return { data: data || [], isLoading, error }
}
