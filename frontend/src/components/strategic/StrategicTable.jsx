import React, { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStrategicData } from '../../hooks/useStrategicData';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Check, AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

const StrategicTable = () => {
  const [filters, setFilters] = useState({
    year: 2024,
    line: 'all',
    status: 'all',
    search: '',
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);  
  // Referencia para el scroll infinito
  const parentRef = useRef(null);  
  const {
    tasks,
    lines,
    isLoading,
    error,
    updateTask,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    totalCount,
  } = useStrategicData(filters);
  // Configuración del virtualizador
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });
  // Intersección observer para scroll infinito
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
    Retrasado: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  };
  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  const handleEditClick = (task) => {
    console.log("Datos de la tarea a editar:", task);
    setSelectedTask(task);
  };
  const handleSave = async () => {
    if (selectedTask) {
      try {
        const updateData = {
          id: selectedTask.id,
          title: selectedTask.title,
          status: selectedTask.status,
          strategic_line: selectedTask.strategic_line,
          due_date: selectedTask.due_date,
          area: selectedTask.area,
          leader: selectedTask.leader,
          description: selectedTask.description || 'Sin descripción detallada',
          assigned_to: selectedTask.assigned_to || 1,
        };
  
        console.log("Datos a enviar:", updateData); // Para debug
        
        await updateTask.mutateAsync(updateData);
        setSelectedTask(null);
      } catch (error) {
        console.error('Error al actualizar:', error);
        const errorMessage = error.message ? JSON.parse(error.message) : {};
        alert(errorMessage.description?.[0] || 'Error al actualizar la tarea');
      }
    }
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
      {/* Header con KPIs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Seguimiento Estratégico</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Tareas</h3>
            <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Pendientes</h3>
            <p className="text-2xl font-semibold text-yellow-600">
              {tasks.filter(t => t.status === 'Pendiente').length}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">En Proceso</h3>
            <p className="text-2xl font-semibold text-blue-600">
              {tasks.filter(t => t.status === 'En proceso').length}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Completadas</h3>
            <p className="text-2xl font-semibold text-green-600">
              {tasks.filter(t => t.status === 'Cumplido').length}
            </p>
          </div>
        </div>
      </div>
  
      {/* Contenedor principal */}
      <div className="flex flex-col space-y-4 bg-white rounded-xl shadow-lg p-6">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
  
          {/* Filtros expandibles */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-4 w-full bg-gray-50 p-4 rounded-lg"
              >
                <select
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  value={filters.line}
                  onChange={(e) => setFilters({ ...filters, line: e.target.value })}
                >
                  <option value="all">Todas las líneas</option>
                  {Array.from(new Set(lines)).map((line, index) => (
                    <option key={`line-${index}-${line.name}`} value={line.name}>
                      {line.name}
                    </option>
                  ))}
                </select>
  
                <select
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">Todos los estados</option>
                  {Object.keys(statusConfig).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
  
        {/* Tabla con virtualización */}
        <div
          ref={parentRef}
          className="overflow-auto border border-gray-200 rounded-lg"
          style={{ height: 'calc(100vh - 400px)' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Header de la tabla (fijo) */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 text-xs font-medium text-gray-500 uppercase">Línea/Tarea</div>
                <div className="col-span-2 text-xs font-medium text-gray-500 uppercase">Estado</div>
                <div className="col-span-2 text-xs font-medium text-gray-500 uppercase">Fecha</div>
                <div className="col-span-2 text-xs font-medium text-gray-500 uppercase">Área</div>
                <div className="col-span-2 text-xs font-medium text-gray-500 uppercase">Acciones</div>
              </div>
            </div>
  
            {/* Filas de la tabla */}
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const task = tasks[virtualRow.index];
              return (
                <div
                  key={task.id}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start + 45, // Ajustado para el header
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                  }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {task.strategic_line}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{task.title}</p>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[task.status].color}`}>
                        {statusConfig[task.status].icon}
                        <span className="ml-1">{task.status}</span>
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {task.area}
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
  
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
  
        {/* Modal de Edición */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Editar Tarea</h2>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
  
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.title}
                      onChange={(e) =>
                        setSelectedTask({ ...selectedTask, title: e.target.value })
                      }
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.description || ''}
                      onChange={(e) =>
                        setSelectedTask({ ...selectedTask, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Ingrese una descripción detallada"
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.status || ''}
                      onChange={(e) =>
                        setSelectedTask({ ...selectedTask, status: e.target.value })
                      }
                    >
                      {Object.keys(statusConfig).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Línea Estratégica
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      value={selectedTask.strategic_line || ''}
                      readOnly
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha límite
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.due_date ? selectedTask.due_date.split('T')[0] : ''}
                      onChange={(e) =>
                        setSelectedTask({ ...selectedTask, due_date: e.target.value })
                      }
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.area || ''}
                      onChange={(e) =>
                        setSelectedTask({ ...selectedTask, area: e.target.value })
                      }
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Líder
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      value={selectedTask.leader || ''}
                      onChange={(e) =>
                        setSelectedTask({ ...selectedTask, leader: e.target.value })
                      }
                    />
                  </div>
  
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Guardar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StrategicTable;