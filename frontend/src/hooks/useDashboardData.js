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

    const today = new Date();

    // Funciones auxiliares
    const calculateDaysUntilDue = (dueDate) => {
      const due = new Date(dueDate);
      return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    };

    const getTaskPriority = (daysUntilDue) => {
      if (daysUntilDue < 0) return 'critical';    // Vencida
      if (daysUntilDue <= 7) return 'critical';   // Próxima a vencer (crítica)
      if (daysUntilDue <= 30) return 'warning';   // Advertencia
      return 'normal';                            // A tiempo
    };

    // Función para calcular tiempo de resolución
    const calculateAverageResolutionTime = (tasks) => {
      const completedTasks = tasks.filter(task => task.status === 'Cumplido');
      
      if (completedTasks.length === 0) return 0;

      const timeDiffs = completedTasks.map(task => {
        const dueDate = new Date(task.due_date);
        const alertDate = new Date(task.alert_date);
        const limitMonth = new Date(task.year, task.limit_month - 1);
        
        const startDate = alertDate < limitMonth ? alertDate : limitMonth;
        const diffTime = Math.abs(dueDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      });

      if (timeDiffs.length >= 5) {
        timeDiffs.sort((a, b) => a - b);
        const cut = Math.floor(timeDiffs.length * 0.1);
        const trimmedDiffs = timeDiffs.slice(cut, -cut);
        return trimmedDiffs.reduce((acc, diff) => acc + diff, 0) / trimmedDiffs.length;
      }

      return timeDiffs.reduce((acc, diff) => acc + diff, 0) / timeDiffs.length;
    };

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

    // Procesar todas las tareas no cumplidas para TasksNearDue
    const tasksNearDue = tasksData
      .filter(task => task.status !== 'Cumplido')
      .map(task => {
        const daysUntilDue = calculateDaysUntilDue(task.due_date);
        const priority = getTaskPriority(daysUntilDue);

        return {
          ...task,
          daysUntilDue,
          priority,
          area: task.area_data?.name || 'Sin área',
          timeStatus: daysUntilDue < 0 ? 'vencida' : 
                     daysUntilDue <= 7 ? 'critica' :
                     daysUntilDue <= 30 ? 'proxima' : 'atiempo'
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    // Debug log para verificar la distribución
    const taskStats = {
      total: tasksNearDue.length,
      vencidas: tasksNearDue.filter(t => t.daysUntilDue < 0).length,
      criticas: tasksNearDue.filter(t => t.daysUntilDue >= 0 && t.daysUntilDue <= 7).length,
      advertencia: tasksNearDue.filter(t => t.daysUntilDue > 7 && t.daysUntilDue <= 30).length,
      aTiempo: tasksNearDue.filter(t => t.daysUntilDue > 30).length
    };
    console.log('Estadísticas de tareas:', taskStats);

    // Agrupar por área
    const byArea = tasksData.reduce((acc, task) => {
      const areaName = task.area_data?.name || 'Sin área';
      if (!acc[areaName]) {
        acc[areaName] = {
          name: areaName,
          total: 0,
          Pendiente: 0,
          'En proceso': 0,
          Cumplido: 0,
          overdue: 0,
          nearDue: 0
        };
      }
      acc[areaName][task.status]++;
      acc[areaName].total++;
      
      const daysUntilDue = calculateDaysUntilDue(task.due_date);
      if (daysUntilDue < 0) acc[areaName].overdue++;
      else if (daysUntilDue <= 30) acc[areaName].nearDue++;
      
      return acc;
    }, {});

    // Calcular carga de trabajo futura
    const nextSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() + i);
      return date.toISOString().slice(0, 7);
    });

    const futureWorkload = nextSixMonths.reduce((acc, month) => {
      acc[month] = {
        month,
        total: 0,
        critical: 0,
        warning: 0,
        normal: 0
      };
      return acc;
    }, {});

    tasksData
      .filter(task => task.status !== 'Cumplido')
      .forEach(task => {
        const dueMonth = task.due_date.slice(0, 7);
        if (futureWorkload[dueMonth]) {
          futureWorkload[dueMonth].total++;
          const daysUntilDue = calculateDaysUntilDue(task.due_date);
          const priority = getTaskPriority(daysUntilDue);
          if (priority === 'critical') futureWorkload[dueMonth].critical++;
          else if (priority === 'warning') futureWorkload[dueMonth].warning++;
          else futureWorkload[dueMonth].normal++;
        }
      });

    // Timeline de tareas
    const timeline = tasksData
      .map(task => ({
        id: task.id,
        title: task.title,
        deliverable: task.deliverable,
        due_date: new Date(task.due_date),
        alert_date: task.alert_date ? new Date(task.alert_date) : null,
        status: task.status,
        strategic_line: task.strategic_line,
        priority: getTaskPriority(calculateDaysUntilDue(task.due_date)),
        area: task.area_data?.name || 'Sin área',
        daysUntilDue: calculateDaysUntilDue(task.due_date)
      }))
      .sort((a, b) => a.due_date - b.due_date);

    // Tareas críticas
    const criticalTasks = tasksData
      .filter(task => 
        task.status !== 'Cumplido' && 
        (calculateDaysUntilDue(task.due_date) <= 7 || calculateDaysUntilDue(task.due_date) < 0)
      )
      .map(task => ({
        id: task.id,
        title: task.title,
        deliverable: task.deliverable,
        dueDate: task.due_date,
        status: task.status,
        daysUntilDue: calculateDaysUntilDue(task.due_date),
        priority: getTaskPriority(calculateDaysUntilDue(task.due_date)),
        area: task.area_data?.name || 'Sin área',
        leader: task.leaders?.[0]?.name || 'Sin líder',
        strategic_line: task.strategic_line
      }))
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    // Calcular KPIs
    const completedTasks = tasksData.filter(t => t.status === 'Cumplido');

    const kpis = {
      total: tasksData.length,
      completed: completedTasks.length,
      inProgress: tasksData.filter(t => t.status === 'En proceso').length,
      pending: tasksData.filter(t => t.status === 'Pendiente').length,
      nearDeadline: tasksData.filter(t => {
        if (t.status === 'Cumplido') return false;
        const daysUntilDue = calculateDaysUntilDue(t.due_date);
        return daysUntilDue <= 30 && daysUntilDue >= 0;
      }).length,
      overdue: tasksData.filter(t => {
        if (t.status === 'Cumplido') return false;
        return calculateDaysUntilDue(t.due_date) < 0;
      }).length,
      averageResolutionTime: calculateAverageResolutionTime(tasksData),
      complianceRate: tasksData.length > 0
        ? (completedTasks.length / tasksData.length) * 100
        : 0
    };

    return {
      byStrategicLine,
      byStatus,
      byLeader,
      byMonth,
      byArea,
      timeline,
      kpis,
      tasksNearDue,
      futureWorkload: Object.values(futureWorkload),
      criticalTasks
    };
  };

  return {
    isLoading: tasksLoading,
    data: tasksData ? processData() : null,
    rawData: tasksData,
  };
};

export default useDashboardData;