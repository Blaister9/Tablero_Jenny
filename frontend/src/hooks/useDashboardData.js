import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const useDashboardData = () => {
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      // Obtener el total de tareas primero
      const initialResponse = await api.get('/tasks/', {
        params: { page: 1, page_size: 1 }
      });
      const totalTasks = initialResponse.data.count;
      
      // Obtener todas las tareas en una sola petición
      const { data } = await api.get('/tasks/', {
        params: { page_size: totalTasks }
      });
      
      return data.results;
    },
  });

  const processData = () => {
    if (!tasksData) return null;

    // Agrupar por línea estratégica
    const byStrategicLine = tasksData.reduce((acc, task) => {
      const line = task.strategic_line;
      if (!acc[line]) {
        acc[line] = {
          name: line,
          Pendiente: 0,
          'En proceso': 0,
          Cumplido: 0,
          total: 0,
        };
      }
      acc[line][task.status]++;
      acc[line].total++;
      return acc;
    }, {});

    // Agrupar por estado
    const byStatus = tasksData.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = 0;
      }
      acc[task.status]++;
      return acc;
    }, {});

    // Agrupar por líder
    const byLeader = tasksData.reduce((acc, task) => {
      if (task.leaders && task.leaders.length > 0) {
        task.leaders.forEach(leader => {
          if (!acc[leader.name]) {
            acc[leader.name] = {
              name: leader.name,
              total: 0,
              Pendiente: 0,
              'En proceso': 0,
              Cumplido: 0,
            };
          }
          acc[leader.name][task.status]++;
          acc[leader.name].total++;
        });
      }
      return acc;
    }, {});

    // Agrupar por mes
    const byMonth = tasksData.reduce((acc, task) => {
      const date = new Date(task.due_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          Pendiente: 0,
          'En proceso': 0,
          Cumplido: 0,
          total: 0,
        };
      }
      acc[monthYear][task.status]++;
      acc[monthYear].total++;
      return acc;
    }, {});

    // Timeline de tareas
    const timeline = tasksData
      .map(task => ({
        id: task.id,
        title: task.title,
        due_date: new Date(task.due_date),
        alert_date: task.alert_date ? new Date(task.alert_date) : null,
        status: task.status,
        strategic_line: task.strategic_line,
      }))
      .sort((a, b) => a.due_date - b.due_date);

    // Calcular KPIs
    const today = new Date();
    const kpis = {
      total: tasksData.length,
      completed: tasksData.filter(t => t.status === 'Cumplido').length,
      inProgress: tasksData.filter(t => t.status === 'En proceso').length,
      pending: tasksData.filter(t => t.status === 'Pendiente').length,
      nearDeadline: tasksData.filter(t => {
        if (t.status === 'Cumplido') return false;
        const dueDate = new Date(t.due_date);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      }).length,
      overdue: tasksData.filter(t => {
        if (t.status === 'Cumplido') return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today;
      }).length,
    };

    return {
      byStrategicLine,
      byStatus,
      byLeader,
      byMonth,
      timeline,
      kpis,
    };
  };

  return {
    isLoading: tasksLoading,
    data: tasksData ? processData() : null,
    rawData: tasksData,
  };
};

export default useDashboardData;