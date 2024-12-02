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
  users = [],
  statusConfig = {},
  isLoading = false,
  isJenny = false,          
  canEditObservations = false
}) => {
  if (!isOpen) return null;

  // Función helper para determinar si un campo es editable
  const isFieldEditable = (fieldName) => {
    if (isJenny) return true;
    if (fieldName === 'description') return true;
    return false;
  };

  const handleLeadersChange = (e) => {
    const options = e.target.options;
    const selectedLeaders = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedLeaders.push(parseInt(options[i].value));
      }
    }
    onTaskChange({ ...task, leaders: selectedLeaders });
  };

  const handleSupportTeamChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions).map(option => parseInt(option.value, 10));
    const updatedSupportTeam = selectedIds.map(id => users.find(user => user.id === id));
    onTaskChange({ ...task, support_team: updatedSupportTeam });
    console.log('Nuevo valor de support_team:', updatedSupportTeam);
};

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
            {modalMode === 'create' ? 'Nueva Tarea' : isJenny ? 'Editar Tarea' : 'Ver Tarea'}
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
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('title') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.title || ''}
              onChange={(e) => 
                isFieldEditable('title') && onTaskChange({ ...task, title: e.target.value })
              }
              readOnly={!isFieldEditable('title')}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción/Observaciones
            </label>
            <textarea
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('description') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.description || ''}
              onChange={(e) =>
                isFieldEditable('description') && onTaskChange({ ...task, description: e.target.value })
              }
              rows={3}
              placeholder={
                isFieldEditable('description') 
                  ? "Ingrese una descripción o agregue observaciones" 
                  : "No tienes permisos para editar este campo"
              }
              readOnly={!isFieldEditable('description')}
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('status') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.status || ''}
              onChange={(e) =>
                isFieldEditable('status') && onTaskChange({ ...task, status: e.target.value })
              }
              disabled={!isFieldEditable('status')}
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
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('strategic_line') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.strategic_line || ''}
              onChange={(e) =>
                isFieldEditable('strategic_line') && onTaskChange({ ...task, strategic_line: e.target.value })
              }
              disabled={!isFieldEditable('strategic_line') || modalMode === 'edit'}
            >
              <option value="">Seleccionar línea estratégica</option>
              {lines.map((line) => (
                <option key={line.id} value={line.name}>
                  {line.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Código Daruma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Daruma
            </label>
            <input 
              type="text"
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('daruma_code') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.daruma_code || ''}
              onChange={(e) => 
                isFieldEditable('daruma_code') && onTaskChange({ ...task, daruma_code: e.target.value })
              }
              readOnly={!isFieldEditable('daruma_code')}
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite
            </label>
            <input
              type="date"
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('due_date') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.due_date ? task.due_date.split('T')[0] : ''}
              onChange={(e) =>
                isFieldEditable('due_date') && onTaskChange({ ...task, due_date: e.target.value })
              }
              readOnly={!isFieldEditable('due_date')}
            />
          </div>

          {/* Fecha alerta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha alerta 
            </label>
            <input
              type="date" 
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('alert_date') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.alert_date || ''}
              onChange={(e) => {
                if (isFieldEditable('alert_date')) {
                  console.log('Fecha seleccionada:', e.target.value);
                  onTaskChange({ ...task, alert_date: e.target.value });
                }
              }}
              readOnly={!isFieldEditable('alert_date')}
            />
          </div>

          {/* Mes límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes límite
            </label>
            <select
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('limit_month') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.limit_month || ''}
              onChange={(e) =>
                isFieldEditable('limit_month') && onTaskChange({ ...task, limit_month: parseInt(e.target.value) })
              }
              disabled={!isFieldEditable('limit_month')}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {i+1}
                </option>
              ))}
            </select>
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área  
            </label>
            <input
              readOnly
              className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700"
              value={task.area_data?.name || ''}
            />
          </div>

          {/* Asignado a */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignado a
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.assigned_to || ''}  
              onChange={(e) =>
                onTaskChange({ ...task, assigned_to: parseInt(e.target.value) })
              }
            >
              <option value="">Seleccionar usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div> */}
          
          {/* Líderes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Líderes  
            </label>
            <select
              multiple
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('leaders') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.leaders?.map(l => typeof l === 'object' ? l.id : l) || []} 
              onChange={(e) => isFieldEditable('leaders') && handleLeadersChange(e)}
              disabled={!isFieldEditable('leaders')}
            >
              {leaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.name}  
                </option>
              ))}
            </select>
          </div>

          {/* Equipo de soporte */}
          <div>  
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipo de soporte
            </label>
            <select 
              multiple
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('support_team') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={Array.isArray(task.support_team) ? task.support_team.map(m => (typeof m === 'object' ? m.id : m)) : []}
              onChange={(e) => isFieldEditable('support_team') && handleSupportTeamChange(e)}
              disabled={!isFieldEditable('support_team')}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>  
              ))}
            </select>
          </div>

          {/* Evidencia y Entregable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidencia
            </label>
            <input
              type="text"  
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('evidence') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.evidence || ''}
              onChange={(e) =>
                isFieldEditable('evidence') && onTaskChange({ ...task, evidence: e.target.value }) 
              }
              readOnly={!isFieldEditable('evidence')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entregable  
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('deliverable') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.deliverable || ''}
              onChange={(e) =>
                isFieldEditable('deliverable') && onTaskChange({ ...task, deliverable: e.target.value })
              }
              readOnly={!isFieldEditable('deliverable')}
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad  
            </label>
            <select
              className={`w-full px-4 py-2 rounded-lg border border-gray-200 ${
                isFieldEditable('priority') ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
              }`}
              value={task.priority || 'medium'}
              onChange={(e) =>
                isFieldEditable('priority') && onTaskChange({ ...task, priority: e.target.value })  
              }
              disabled={!isFieldEditable('priority')}
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

            {(isJenny || isFieldEditable('description')) && (
            <button
              onClick={() => {
                const updateData = isJenny ? task : { description: task.description };
                console.log('Datos a guardar:', updateData);
                onSave(updateData);
              }}
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
          )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StrategicModal;