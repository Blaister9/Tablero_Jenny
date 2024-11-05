import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const PAGE_SIZE = 15;

export const useStrategicData = (filters) => {
  const queryClient = useQueryClient();

  const adjustedFilters = {
    ...filters,
    strategic_line: filters.line !== 'all' ? filters.line : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    year: filters.year !== 'all' ? filters.year : undefined,
  };
  delete adjustedFilters.line;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['strategic-tasks', adjustedFilters],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get('/tasks/', {
        params: {
          ...adjustedFilters,
          page: pageParam,
          page_size: PAGE_SIZE,
        },
      });
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      const totalPages = Math.ceil(lastPage.count / PAGE_SIZE);
      const nextPage = pages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
  });

  // Extraer las líneas estratégicas únicas de las tareas
  const lines = data?.pages?.reduce((acc, page) => {
    const pageLines = page.results.map(task => ({
      id: task.strategic_line,
      name: task.strategic_line
    }));
    return [...new Set([...acc, ...pageLines])];
  }, []) || [];

  // Actualizar tarea con mejor manejo de errores
  const updateTask = useMutation({
    mutationFn: async (updateData) => {
      console.log('Intentando actualizar con datos:', updateData);
      try {
        const { id, ...data } = updateData;
        const response = await api.patch(`/tasks/${id}/`, data);
        console.log('Respuesta del servidor:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error completo del servidor:', error.response?.data);
        throw new Error(
          error.response?.data?.detail || 
          JSON.stringify(error.response?.data) || 
          'Error al actualizar la tarea'
        );
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['strategic-tasks']);
      return data;
    },
    onError: (error) => {
      console.error('Error en la mutación:', error);
      throw error;
    },
  });

  const tasks = data?.pages.flatMap((page) => page.results) || [];
  const totalCount = data?.pages[0]?.count || 0;

  return {
    tasks,
    lines,
    isLoading,
    error,
    updateTask,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount,
  };
};