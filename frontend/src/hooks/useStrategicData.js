import { useInfiniteQuery, useMutation, useQueryClient,useQuery } from '@tanstack/react-query';
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
    
    // Eliminar duplicados usando Map
    const uniqueLines = Array.from(
      new Map(
        [...acc, ...pageLines].map(item => [item.name, item])
      ).values()
    );
    
    return uniqueLines;
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

  // Dentro de la función que procesa los datos recibidos
  const tasks = data?.pages.flatMap((page) =>
    page.results.map(task => ({
      ...task,
      area_name: task.area?.name || '',
      leaders_names: task.leaders?.map(leader => leader.name) || [],
    }))
  ) || [];
  const totalCount = data?.pages[0]?.count || 0;

  const createTask = useMutation({
    mutationFn: async (taskData) => {
      console.log('Datos enviados:', taskData);
      try {
        const response = await api.post('/tasks/', taskData);
        return response.data;
      } catch (error) {
        console.log('Error detallado:', error.response?.data);
        throw new Error(error.response?.data?.detail || 'Error al crear la tarea');
      }
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['strategic-tasks']);
    }
});

  const { data: areasData } = useQuery({
    queryKey: ['areas'], // Always use an array for the query key
    queryFn: async () => {
      const response = await api.get('/tasks/areas/');
      console.log("esta es la response de áreas: ",response)
      return response.data;
    },
  });

  const { data: leadersData } = useQuery({
    queryKey: ['leaders'], // Always use an array for the query key
    queryFn: async () => {
      const response = await api.get('/tasks/leaders/');
      console.log("esta es la response de líderes: ",response)
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