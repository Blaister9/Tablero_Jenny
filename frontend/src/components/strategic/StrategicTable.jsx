import React, { useState, useRef, useCallback } from 'react';
import { useStrategicData } from '../../hooks/useStrategicData';
import { AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Componentes
import StrategicHeader from './StrategicHeader';
import StrategicFilters from './StrategicFilters';
import StrategicTableView from './StrategicTableView';
import StrategicModal from './StrategicModal';

const StrategicTable = () => {
  // Estados
  const [filters, setFilters] = useState({
    year: 2024,
    line: 'all',
    status: 'all',
    search: '',
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  
  // Referencias
  const parentRef = useRef(null);

  // Auth context
  const { canCreateTask, canEditTask, canEditObservations, isJenny } = useAuth();

  // Datos y estado
  const {
    tasks,
    lines,
    areas,
    leaders,
    isLoading,
    error,
    updateTask,
    createTask,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount,
  } = useStrategicData(filters);

  // Configuración de estados
  const statusConfig = {
    Pendiente: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: <Clock className="w-4 h-4" />,
    },
    Cumplido: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    'En proceso': {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <AlertCircle className="w-4 h-4" />,
    },
  };

  // Intersection Observer para scroll infinito
  const intObserver = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Manejadores de eventos
  const handleNewTask = () => {
    if (!canCreateTask()) {
      alert('Solo Jenny puede crear nuevas tareas.');
      return;
    }
    
    setModalMode('create');
    setSelectedTask({
      title: '',
      description: '',
      status: 'Pendiente',
      strategic_line: '',
      due_date: new Date().toISOString().split('T')[0],
      area: '',
      leader: '',
      priority: 'medium',
      assigned_to: 1,
    });
  };

  const handleEditTask = (task) => {
    setModalMode('edit');
    setSelectedTask({
      ...task,
      support_team: Array.isArray(task.support_team)
        ? task.support_team.map(member => (typeof member === 'object' ? member : leaders.find(user => user.id === member)))
        : [],
    });
  };

  const handleSave = async (updateData) => {
    if (!selectedTask) return;
  
    // Solo verificar permisos para crear tareas
    if (modalMode === 'create' && !canCreateTask()) {
      alert('No tienes permisos para crear tareas.');
      return;
    }
  
    const errors = validateTask(selectedTask);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
  
    try {
      let taskData;
      if (updateData) {
        // Si updateData está presente, significa que solo estamos actualizando campos específicos (ej. descripción)
        taskData = updateData;
      } else {
        // Si no, estamos actualizando toda la tarea (solo para Jenny)
        taskData = {
          title: selectedTask.title,
          status: selectedTask.status,
          strategic_line: selectedTask.strategic_line,
          due_date: selectedTask.due_date ? new Date(selectedTask.due_date).toISOString().split('T')[0] : null,
          area: selectedTask.area,
          description: selectedTask.description || '',
          assigned_to: selectedTask.assigned_to || selectedTask.created_by?.id,
          leaders: Array.isArray(selectedTask.leaders) 
            ? selectedTask.leaders.map(leader => typeof leader === 'object' ? leader.id : leader)
            : [],
          priority: selectedTask.priority || 'medium',
          daruma_code: selectedTask.daruma_code || '',
          alert_date: selectedTask.alert_date || null,
          limit_month: selectedTask.limit_month || null,
          deliverable: selectedTask.deliverable || '',
          evidence: selectedTask.evidence || '',
          observations: selectedTask.observations || '',
          support_team: Array.isArray(selectedTask.support_team)
            ? selectedTask.support_team.map(member => (typeof member === 'object' ? member.id : member))
            : []    
        };
      }
           
      if (modalMode === 'create') {
        await createTask.mutateAsync(taskData);
      } else {
        await updateTask.mutateAsync({ id: selectedTask.id, ...taskData });
      }
      
      setSelectedTask(null);
      setModalMode(null);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al procesar la tarea');
    }
  };

  const validateTask = (task) => {
    const errors = [];
    if (!task.title?.trim()) errors.push('El título es requerido');
    if (!task.strategic_line?.trim()) errors.push('La línea estratégica es requerida');
    if (!task.due_date) errors.push('La fecha límite es requerida');
    return errors;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
        <p className="text-red-700">Error al cargar los datos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <StrategicHeader 
        tasks={tasks} 
        onNewTask={handleNewTask}
        showNewButton={canCreateTask()} 
      />

      <div className="flex flex-col space-y-4 bg-white rounded-xl shadow-lg p-6">
        <StrategicFilters
          filters={filters}
          onFilterChange={setFilters}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          lines={lines}
          statusConfig={statusConfig}
        />

        <StrategicTableView
          tasks={tasks}
          onEditTask={handleEditTask}
          statusConfig={statusConfig}
          parentRef={parentRef}
          isLoading={isLoading}
          intObserver={intObserver}
          canEditTask={canEditTask}
          canEditObservations={canEditObservations}
        />

        <AnimatePresence>
          {selectedTask && (
            <StrategicModal
              isOpen={!!selectedTask}
              onClose={() => {
                setSelectedTask(null);
                setModalMode(null);
              }}
              task={selectedTask || {}}
              onTaskChange={setSelectedTask}
              onSave={(updateData) => handleSave(updateData)}
              modalMode={modalMode}
              lines={lines}
              areas={areas}
              leaders={leaders}
              users={leaders}
              statusConfig={statusConfig}
              isLoading={createTask.isLoading || updateTask.isLoading}
              isJenny={isJenny()}
              canEditObservations={canEditObservations(selectedTask)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StrategicTable;