import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export const useContractsKPIs = (params = {}) => {
  // params es un objeto que puede contener { anio, rubro, contratista }

  // Convertimos params en querystring
  const queryString = new URLSearchParams(params).toString()

  // Llamamos al endpoint kpis-full-summary con los parámetros
  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts-kpis', params],
    queryFn: async () => {
      const { data } = await api.get(`/contracts/kpis-full-summary/?${queryString}`)
      return data
    },
    staleTime: 1000 * 60 // 1 minuto
  })

  return { data, isLoading, error }
}
