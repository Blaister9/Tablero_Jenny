import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const PAGE_SIZE = 15;

export const useStrategicData = (filters) => {
  const queryClient = useQueryClient();

  // Aseguramos que leaders[] y support_team[] no sean undefined
  const adjustedFilters = {
    ...filters,
    strategic_line: filters.line !== 'all' ? filters.line : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    year: filters.year !== 'all' ? filters.year : undefined,
    'leaders[]': Array.isArray(filters.leaders) && filters.leaders.length > 0 ? filters.leaders : [],  // Forzar a que sea un array vacío si no hay líderes seleccionados
    'support_team[]': Array.isArray(filters.supportTeam) && filters.supportTeam.length > 0 ? filters.supportTeam : [],  // Lo mismo para el equipo de soporte
  };
  
  // Eliminar propiedades que ya no necesitamos en los filtros
  delete adjustedFilters.line;
  delete adjustedFilters.leaders;
  delete adjustedFilters.supportTeam;

  const { data: leadersData } = useQuery({
    queryKey: ['leaders'],
    queryFn: async () => {
      const response = await api.get('/tasks/leaders/');
      console.log('Leaders Data Response:', response.data);
      return response.data || []; // Aseguramos que siempre retorne un array vacío si no hay datos
    },
  });

  const leaders = Array.isArray(leadersData) ? leadersData : [];
  console.log('Processed Leaders:', leaders);

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
        console.log('Adjusted Filters:', adjustedFilters);  // Verificamos los filtros que se están enviando
        const { data } = await api.get('/tasks/', {
          params: {
            ...adjustedFilters,
            page: pageParam,
            page_size: PAGE_SIZE,
          },
        });
        console.log('Datos recibidos del backend:', data.results);

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
        console.error('Error fetching data:', error);
        if (error.response?.status === 404 && pageParam === 1) {
          throw error;
        }
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
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    suspense: false,
    refetchOnWindowFocus: false,
    cacheTime: 5 * 60 * 1000,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });

  const lines = data?.pages?.reduce((acc, page) => {
    const pageLines = page.results.map((task) => ({
      id: task.strategic_line,
      name: task.strategic_line,
    }));

    const uniqueLines = Array.from(
      new Map([...acc, ...pageLines].map((item) => [item.name, item])).values()
    );

    return uniqueLines;
  }, []) || [];

  const updateTask = useMutation({
    mutationFn: async (updateData) => {
      try {
        const { id, ...data } = updateData;
        console.log('Datos enviados a la API:', data); // Para debug
        const response = await api.patch(`/tasks/${id}/`, data);
        return response.data;
      } catch (error) {
        console.error('Error completo:', error.response); // Para debug
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

  const tasks = data?.pages.flatMap((page) =>
    page.results.map((task) => ({
      ...task,
      area_name: task.area?.name || '',
      leaders_names: task.leaders?.map((leader) => leader.name) || [],
      support_team: task.support_team || [],
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

  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await api.get('/tasks/areas/');
      return response.data;
    },
  });

  return {
    tasks,
    lines,
    areas: areasData || [],
    leaders: leaders || [],
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
