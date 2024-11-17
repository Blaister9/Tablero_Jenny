import React, { useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle } from 'lucide-react';

const Tooltip = ({ content, children, placement = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  const tooltipStyles = {
    right: placement === 'left' ? 'full' : 'auto',
    left: placement === 'right' ? 'full' : 'auto',
    marginLeft: placement === 'right' ? '0.5rem' : 'auto',
    marginRight: placement === 'left' ? '0.5rem' : 'auto'
  };

  return (
    <div className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-50 w-64 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 ${
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
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-sm border border-gray-200">
      <div 
        ref={parentRef}
        className="w-full overflow-auto bg-white"
        style={{ height: '70vh' }}
      >
        <div className="min-w-full">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
            <div className="flex">
              <div className="w-32 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">LÍNEA</div>
              <div className="w-64 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">META</div>
              <div className="w-32 px-3 py-3.5 text-center text-sm font-semibold text-gray-900">ESTADO</div>
              <div className="flex-1 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">DESCRIPCIÓN</div>
              <div className="w-32 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">FECHA</div>
              <div className="w-24 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ÁREA</div>
              <div className="w-48 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">LÍDERES</div>
              <div className="w-24 px-3 py-3.5 text-center text-sm font-semibold text-gray-900">ACCIONES</div>
            </div>
          </div>

          {/* Rows Container */}
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
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex items-center border-b border-gray-200 hover:bg-gray-50"
                >
                  {/* LÍNEA */}
                  <div className="w-32 px-3 py-4">
                    <Tooltip content={task.strategic_line}>
                      <span className="text-sm text-gray-900 line-clamp-1">
                        {task.strategic_line}
                      </span>
                    </Tooltip>
                  </div>

                  {/* META */}
                  <div className="w-64 px-3 py-4">
                    <Tooltip content={task.title}>
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {task.title}
                      </div>
                    </Tooltip>
                  </div>

                  {/* ESTADO */}
                  <div className="w-32 px-3 py-4">
                    <div className="flex justify-center">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${task.status === 'Cumplido' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'}
                      `}>
                        {task.status === 'Cumplido' 
                          ? <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          : <Clock className="w-3.5 h-3.5 mr-1" />
                        }
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPCIÓN */}
                  <div className="flex-1 px-3 py-4">
                    <Tooltip content={task.description}>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {task.description || 'Sin descripción'}
                      </div>
                    </Tooltip>
                  </div>

                  {/* FECHA */}
                  <div className="w-32 px-3 py-4">
                    <span className="text-sm text-gray-500">
                      {format(new Date(task.due_date), 'd MMM yyyy', { locale: es })}
                    </span>
                  </div>

                  {/* ÁREA */}
                  <div className="w-24 px-3 py-4">
                    <span className="text-sm text-gray-900">
                      {task.area_data?.name || 'OASTI'}
                    </span>
                  </div>

                  {/* LÍDERES */}
                  <div className="w-48 px-3 py-4">
                    {task.leaders?.length > 0 ? (
                      <Tooltip content={task.leaders.map(l => l.name).join(', ')} placement="left">
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
                      <span className="text-sm text-gray-500">Sin líd...</span>
                    )}
                  </div>

                  {/* ACCIONES */}
                  <div className="w-24 px-3 py-4 text-center">
                    <button
                      onClick={() => onEditTask(task)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicTableView;