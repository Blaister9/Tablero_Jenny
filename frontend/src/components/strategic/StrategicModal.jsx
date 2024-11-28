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
}) => {
  if (!isOpen) return null;

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
          
          {/* Código Daruma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Daruma
            </label>
            <input 
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.daruma_code || ''}
              onChange={(e) => 
                onTaskChange({ ...task, daruma_code: e.target.value })
              }
            />
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

          {/* Fecha alerta */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha alerta 
            </label>
            <input
              type="date" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.alert_date || ''}
              onChange={(e) => {
                console.log('Fecha seleccionada:', e.target.value);
                onTaskChange({ ...task, alert_date: e.target.value });
              }}
            />
          </div>

          {/* Mes límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes límite
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.limit_month || ''}
              onChange={(e) =>
                onTaskChange({ ...task, limit_month: parseInt(e.target.value) })
              }
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
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.leaders?.map(l => typeof l === 'object' ? l.id : l) || []} 
              onChange={handleLeadersChange}
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
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={Array.isArray(task.support_team) ? task.support_team.map(m => (typeof m === 'object' ? m.id : m)) : []}
              onChange={handleSupportTeamChange}  
            >
              {console.log('Valor actual de support_team:', task.support_team)}
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>  
              ))}
            </select>
          </div>

          {/* Evidencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidencia
            </label>
            <input
              type="text"  
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={task.evidence || ''}
              onChange={(e) =>
                onTaskChange({ ...task, evidence: e.target.value }) 
              }
            />
          </div>

          {/* Entregable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entregable  
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"  
              value={task.deliverable || ''}
              onChange={(e) =>
                onTaskChange({ ...task, deliverable: e.target.value })
              }  
            />
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