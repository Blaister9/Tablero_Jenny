// src/hooks/useMaintenanceData.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';

// Funciones para obtener datos desde la API
const fetchSubGroups = async () => {
  const { data } = await axios.get('/maintenance-groups/');
  return data;
};

const fetchItems = async () => {
  const { data } = await axios.get('/maintenance-items/');
  return data;
};

const fetchSchedules = async () => {
  const { data } = await axios.get('/maintenance-schedules/');
  return data;
};

// Función para actualizar el estado de un mantenimiento
const updateSchedule = async ({ scheduleId, updates }) => {
  const { data } = await axios.patch(`/maintenance-schedules/${scheduleId}/`, updates);
  return data;
};

export const useMaintenanceData = () => {
  const queryClient = useQueryClient();

  // Obtener subgrupos
  const {
    data: subGroups,
    isLoading: isLoadingSubGroups,
    isError: isErrorSubGroups,
    error: errorSubGroups,
  } = useQuery({
    queryKey: ['maintenanceSubGroups'],
    queryFn: fetchSubGroups,
  });

  // Obtener items
  const {
    data: items,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    error: errorItems,
  } = useQuery({
    queryKey: ['maintenanceItems'],
    queryFn: fetchItems,
  });

  // Obtener horarios de mantenimiento
  const {
    data: schedules,
    isLoading: isLoadingSchedules,
    isError: isErrorSchedules,
    error: errorSchedules,
  } = useQuery({
    queryKey: ['maintenanceSchedules'],
    queryFn: fetchSchedules,
  });

  // Mutación para actualizar el estado de mantenimiento con actualizaciones optimistas
  const mutation = useMutation({
    mutationFn: updateSchedule,
    onMutate: async (updatedData) => {
      await queryClient.cancelQueries(['maintenanceSchedules']);

      const previousSchedules = queryClient.getQueryData(['maintenanceSchedules']);

      queryClient.setQueryData(['maintenanceSchedules'], (old) =>
        old.map((schedule) =>
          schedule.id === updatedData.scheduleId
            ? { ...schedule, ...updatedData.updates }
            : schedule
        )
      );

      return { previousSchedules };
    },
    onError: (err, updatedData, context) => {
      queryClient.setQueryData(['maintenanceSchedules'], context.previousSchedules);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['maintenanceSchedules']);
    },
  });

  const isLoading = isLoadingSubGroups || isLoadingItems || isLoadingSchedules;
  const isError = isErrorSubGroups || isErrorItems || isErrorSchedules;
  const error = errorSubGroups || errorItems || errorSchedules;

  return {
    subGroups,
    items,
    schedules,
    isLoading,
    isError,
    error,
    updateScheduleStatus: mutation.mutate,
  };
};
