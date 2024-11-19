import React, { useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle } from 'lucide-react';
import { useTableColumns } from '../../hooks/useTableColumns';
import ColumnsConfig from './ColumnsConfig';

const Tooltip = ({ content, children, placement = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  return (
    <div className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-[60] w-64 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 ${
            placement === 'right' ? 'left-full ml-2' : 'right-full mr-2'
          }`}
        >
          {content}
          <div 
            className={`absolute top-3 w-2 h-2 bg-gray-900 transform rotate-45 ${
              placement === 'right' ? '-left-1' : '-right-1'
            }`} 
          />
        </div>
      )}
    </div>
  );
};

const StrategicTableView = ({
  tasks,
  onEditTask,
  parentRef,
  isLoading,
  intObserver
}) => {
  const {
    getVisibleColumns,
    visibleColumns,
    toggleColumn,
    resetToDefault,
    allColumns
  } = useTableColumns();

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const renderCell = (task, column) => {
    const cellContent = {
      year: () => (
        <span className="text-sm text-gray-900">{task.year || '2024'}</span>
      ),
      strategic_line: () => (
        <Tooltip content={task.strategic_line}>
          <span className="text-sm text-gray-900">{task.strategic_line}</span>
        </Tooltip>
      ),
      title: () => (
        <Tooltip content={task.title}>
          <div className="text-sm text-gray-900 line-clamp-2">{task.title}</div>
        </Tooltip>
      ),
      daruma_code: () => (
        <span className="text-sm text-gray-900">{task.daruma_code || 'N/A'}</span>
      ),
      status: () => (
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${task.status === 'Cumplido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
        `}>
          {task.status === 'Cumplido' 
            ? <CheckCircle className="w-3.5 h-3.5 mr-1" />
            : <Clock className="w-3.5 h-3.5 mr-1" />
          }
          {task.status}
        </span>
      ),
      alert_date: () => (
        <span className="text-sm text-gray-500">
          {task.alert_date ? format(new Date(task.alert_date), 'd MMM yyyy', { locale: es }) : 'N/A'}
        </span>
      ),
      limit_month: () => (
        <span className="text-sm text-gray-900">{task.limit_month || 'N/A'}</span>
      ),
      due_date: () => (
        <span className="text-sm text-gray-500">
          {format(new Date(task.due_date), 'd MMM yyyy', { locale: es })}
        </span>
      ),
      deliverable: () => (
        <Tooltip content={task.deliverable}>
          <div className="text-sm text-gray-900 line-clamp-2">{task.deliverable || task.entregable || 'N/A'}</div>
        </Tooltip>
      ),
      area: () => (
        <span className="text-sm text-gray-900">{task.area_data?.name || 'N/A'}</span>
      ),
      leaders: () => (
        task.leaders?.length > 0 ? (
          <Tooltip content={task.leaders.map(l => l.name).join('\n')} placement="left">
            <div>
              <div className="text-sm text-gray-900">
                {`${task.leaders.length} líderes`}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                {task.leaders.map(l => l.name).join(', ')}
              </div>
            </div>
          </Tooltip>
        ) : (
          <span className="text-sm text-gray-500">Sin líder</span>
        )
      ),
      support_team: () => (
        task.support_team?.length > 0 ? (
          <Tooltip content={task.support_team.map(m => m.name).join('\n')} placement="left">
            <div className="text-sm text-gray-900 line-clamp-2">
              {task.support_team.map(m => m.name).join(', ')}
            </div>
          </Tooltip>
        ) : (
          <span className="text-sm text-gray-500">N/A</span>
        )
      ),
      evidence: () => (
        <Tooltip content={task.evidence}>
          <div className="text-sm text-gray-900 line-clamp-2">{task.evidence || 'N/A'}</div>
        </Tooltip>
      ),
      description: () => (
        <Tooltip content={task.description}>
          <div className="text-sm text-gray-500 line-clamp-2">
            {task.description || 'Sin descripción'}
          </div>
        </Tooltip>
      ),
      actions: () => (
        <button
          onClick={() => onEditTask(task)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Editar
        </button>
      )
    };

    return cellContent[column.id]?.() || null;
  };

  console.log('Tasks recibidas en tabla:', tasks);
  console.log('Primera tarea completa:', tasks[0]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ColumnsConfig 
          allColumns={allColumns}
          visibleColumns={visibleColumns}
          toggleColumn={toggleColumn}
          resetToDefault={resetToDefault}
        />
      </div>
      
      <div className="w-full overflow-hidden rounded-lg shadow-sm border border-gray-200">
        <div 
          ref={parentRef}
          className="w-full overflow-auto bg-white"
          style={{ height: '70vh' }}
        >
          <table className="min-w-full border-collapse table-fixed">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {getVisibleColumns().map((column) => (
                  <th 
                    key={column.id}
                    style={{ width: column.width }}
                    className="sticky top-0 z-10 bg-gray-50 px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={getVisibleColumns().length} className="p-0">
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const task = tasks[virtualRow.index];
                      return (
                        <div
                          key={task.id}
                          ref={virtualRow.index === tasks.length - 1 ? intObserver : null}
                          className="absolute w-full border-b border-gray-200 hover:bg-gray-50"
                          style={{
                            top: 0,
                            transform: `translateY(${virtualRow.start}px)`,
                            height: `${virtualRow.size}px`,
                          }}
                        >
                          <div className="flex items-center h-full">
                            {getVisibleColumns().map((column) => (
                              <div
                                key={column.id}
                                style={{ width: column.width }}
                                className="px-4 flex items-center"
                              >
                                {renderCell(task, column)}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StrategicTableView;