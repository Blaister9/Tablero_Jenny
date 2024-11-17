import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
      try {
        const { data } = await api.get('/tasks/', {
          params: {
            ...adjustedFilters,
            page: pageParam,
            page_size: PAGE_SIZE,
          },
        });

        // Verificar si tenemos los datos esperados
        if (!data || !Array.isArray(data.results)) {
          console.warn('Formato de respuesta inesperado:', data);
          return {
            results: [],
            currentPage: pageParam,
            totalPages: 0,
            totalCount: 0,
          };
        }

        return {
          results: data.results,
          currentPage: pageParam,
          totalPages: Math.ceil(data.count / PAGE_SIZE),
          totalCount: data.count,
        };
      } catch (error) {
        // Si es un 404 y es la primera página, propagar el error
        if (error.response?.status === 404 && pageParam === 1) {
          throw error;
        }
        // Si es un 404 en páginas posteriores, retornar página vacía
        if (error.response?.status === 404) {
          return {
            results: [],
            currentPage: pageParam,
            totalPages: pageParam - 1,
            totalCount: (pageParam - 1) * PAGE_SIZE,
          };
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      // Solo continuar si hay más páginas
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    suspense: false,
    refetchOnWindowFocus: false,
    cacheTime: 5 * 60 * 1000, // 5 minutos
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: (failureCount, error) => {
      // No reintentar en caso de 404
      if (error.response?.status === 404) return false;
      // Reintentar máximo 3 veces para otros errores
      return failureCount < 3;
    },
  });

  // Extraer las líneas estratégicas únicas de las tareas
  const lines = data?.pages?.reduce((acc, page) => {
    const pageLines = page.results.map(task => ({
      id: task.strategic_line,
      name: task.strategic_line
    }));
    
    // Eliminar duplicados usando Map
    const uniqueLines = Array.from(
      new Map(
        [...acc, ...pageLines].map(item => [item.name, item])
      ).values()
    );
    
    return uniqueLines;
  }, []) || [];

  const updateTask = useMutation({
    mutationFn: async (updateData) => {
      try {
        const { id, ...data } = updateData;
        const response = await api.patch(`/tasks/${id}/`, data);
        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.detail || 
          JSON.stringify(error.response?.data) || 
          'Error al actualizar la tarea'
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-tasks']);
    },
  });

  // Procesar los datos recibidos
  const tasks = data?.pages.flatMap((page) =>
    page.results.map(task => ({
      ...task,
      area_name: task.area?.name || '',
      leaders_names: task.leaders?.map(leader => leader.name) || [],
    }))
  ) || [];

  const totalCount = data?.pages[0]?.totalCount || 0;

  const createTask = useMutation({
    mutationFn: async (taskData) => {
      try {
        const response = await api.post('/tasks/', taskData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.detail || 'Error al crear la tarea');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-tasks']);
    }
  });

  // Queries para áreas y líderes
  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await api.get('/tasks/areas/');
      return response.data;
    },
  });

  const { data: leadersData } = useQuery({
    queryKey: ['leaders'],
    queryFn: async () => {
      const response = await api.get('/tasks/leaders/');
      return response.data;
    },
  });

  return {
    tasks,
    lines,
    areas: areasData || [],
    leaders: leadersData || [],
    isLoading,
    error,
    updateTask,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount,
    createTask
  };
};