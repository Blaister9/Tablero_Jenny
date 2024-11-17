import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const StrategicModal = ({
  isOpen,
  onClose,
  task,
  onTaskChange,
  onSave,
  modalMode,
  lines = [],
  areas = [],
  leaders = [],
  statusConfig = {},
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
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
          <h2 className="text-xl font-semibold">
            {modalMode === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.title || ''}
              onChange={(e) =>
                onTaskChange({ ...task, title: e.target.value })
              }
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.description || ''}
              onChange={(e) =>
                onTaskChange({ ...task, description: e.target.value })
              }
              rows={3}
              placeholder="Ingrese una descripción detallada"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.status || ''}
              onChange={(e) =>
                onTaskChange({ ...task, status: e.target.value })
              }
            >
              {Object.keys(statusConfig).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Línea Estratégica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea Estratégica
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.strategic_line || ''}
              onChange={(e) =>
                onTaskChange({ ...task, strategic_line: e.target.value })
              }
              disabled={modalMode === 'edit'}
            >
              <option value="">Seleccionar línea estratégica</option>
              {lines.map((line) => (
                <option key={line.id} value={line.name}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.due_date ? task.due_date.split('T')[0] : ''}
              onChange={(e) =>
                onTaskChange({ ...task, due_date: e.target.value })
              }
            />
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.area || ''}
              onChange={(e) =>
                onTaskChange({ ...task, area: e.target.value })
              }
            >
              <option value="">Seleccionar área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Líderes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Líderes
            </label>
            <select
              multiple
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.leaders || []}
              onChange={(e) => {
                const options = e.target.options;
                const selectedLeaders = [];
                for (let i = 0, l = options.length; i < l; i++) {
                  if (options[i].selected) {
                    selectedLeaders.push(parseInt(options[i].value));
                  }
                }
                onTaskChange({ ...task, leaders: selectedLeaders });
              }}
            >
              {leaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.priority || 'medium'}
              onChange={(e) =>
                onTaskChange({ ...task, priority: e.target.value })
              }
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <Check className="w-4 h-4" />
              )}
              {modalMode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StrategicModal;