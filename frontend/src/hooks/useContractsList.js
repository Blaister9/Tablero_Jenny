// frontend/src/hooks/useContractsList.js
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useContractsList = (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString()
  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts-list', filters],
    queryFn: async () => {
      const { data } = await api.get(`/contracts/contracts-list/?${queryString}`)
      return data
    }
  })
  return { data: data || [], isLoading, error }
}
