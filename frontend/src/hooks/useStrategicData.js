import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useStrategicData = (filters) => {
  const queryClient = useQueryClient();

  // Obtener tareas
  const { data: tasks, isLoading, error } = useQuery(
    ['strategic-tasks', filters],
    async () => {
      const { data } = await api.get('/api/tasks/', { params: filters });
      return data;
    }
  );

  // Actualizar tarea
  const updateTask = useMutation(
    async ({ id, ...data }) => {
      const response = await api.patch(`/api/tasks/${id}/`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['strategic-tasks']);
      },
    }
  );

  return {
    tasks,
    isLoading,
    error,
    updateTask
  };
};