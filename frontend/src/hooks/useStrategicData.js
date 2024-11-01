import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useStrategicData = (filters) => {
  const queryClient = useQueryClient();

  // Ajuste de filtros, eliminando valores "all" para que no se envíen al backend
  const adjustedFilters = {
    ...filters,
    strategic_line: filters.line !== 'all' ? filters.line : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    year: filters.year !== 'all' ? filters.year : undefined,
  };
  delete adjustedFilters.line; // elimina 'line' para evitar duplicación

  // Obtener tareas con límite de paginación ampliado
  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['strategic-tasks', adjustedFilters],
    queryFn: async () => {
      const { data } = await api.get('/tasks/', { params: { ...adjustedFilters, page_size: 100 } });
      console.log("Datos recibidos:", data); // Los datos completos con count, results, etc.
      return data;
    },
    onError: (error) => {
      console.error("Error fetching tasks:", error);
    },
  });
  
  // Extraer tasks de los resultados
  const tasks = tasksData?.results || [];

  // Obtener líneas estratégicas
  const { data: lines = [] } = useQuery({
    queryKey: ['strategic-lines'],
    queryFn: async () => {
      const { data } = await api.get('/strategic-lines/');
      return data;
    },
    onError: (error) => {
      console.error("Error fetching strategic lines:", error);
    },
  });

  // Actualizar tarea
  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await api.patch(`/tasks/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-tasks']);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
    },
  });

  return {
    tasks,
    lines, // Agregar las líneas estratégicas al retorno
    isLoading,
    error,
    updateTask,
  };
};
