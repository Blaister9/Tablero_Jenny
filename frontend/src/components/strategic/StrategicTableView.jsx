import React, { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle, MoreHorizontal, Eye, AlertCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useTableColumns } from '../../hooks/useTableColumns';
import ColumnsConfig from './ColumnsConfig';
import {
  Table,
  TableHeader,
  TableBody,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const StrategicTableView = ({
  tasks,
  onEditTask,
  parentRef,
  isLoading,
  intObserver,
  canEditTask,
  canEditObservations
}) => {
  const {
    getVisibleColumns,
    visibleColumns,
    toggleColumn,
    resetToDefault,
    allColumns
  } = useTableColumns();

  const tableContainerRef = useRef(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Actualizar el ancho del contenedor de la tabla cuando cambien las columnas visibles
  useEffect(() => {
    if (tableContainerRef.current) {
      const totalWidth = getVisibleColumns().reduce(
        (acc, col) => acc + parseInt(col.width, 10),
        0
      );
      // Añadir padding extra para asegurar que siempre haya scroll si es necesario
      const minRequiredWidth = Math.max(totalWidth, tableContainerRef.current.parentElement.clientWidth);
      tableContainerRef.current.style.minWidth = `${minRequiredWidth}px`;
    }
  }, [visibleColumns, tasks, getVisibleColumns]);

  // Añadir después del useEffect anterior
  useEffect(() => {
    const handleResize = () => {
      if (tableContainerRef.current && parentRef.current) {
        const totalWidth = getVisibleColumns().reduce(
          (acc, col) => acc + parseInt(col.width, 10),
          0
        );
        const containerWidth = parentRef.current.clientWidth;
        const finalWidth = Math.max(totalWidth, containerWidth);
        tableContainerRef.current.style.minWidth = `${finalWidth}px`;
      }
    };

    // Crear un ResizeObserver para detectar cambios en el tamaño del contenedor
    const resizeObserver = new ResizeObserver(handleResize);
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    // Llamar a handleResize inmediatamente
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [getVisibleColumns]);

  // Añadir esta función para manejar el doble clic
  const handleRowDoubleClick = (task) => {
    setSelectedTaskId(task.id);
    onEditTask(task);
    setIsModalOpen(true);
  };

  // Añadir estas funciones de manejo
  const handleRowClick = (task) => {
    setSelectedTaskId(task.id);
  }; 

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

  const StatusBadge = ({ status }) => {
    const config = {
      'Cumplido': {
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      'En proceso': {
        icon: Clock,
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      'Pendiente': {
        icon: AlertCircle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    }[status] || {
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {status}
      </div>
    );
  };

  const TooltipWrapper = ({ content, children }) => (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md max-w-md z-50"
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  const renderCell = (task, column) => {
    const cellContent = {
      year: () => (
        <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
          {task.year || '2024'}
        </div>
      ),
      strategic_line: () => (
        <TooltipWrapper content={task.strategic_line}>
          <div className="max-w-[120px] truncate text-sm text-gray-900">
            {task.strategic_line}
          </div>
        </TooltipWrapper>
      ),
      title: () => (
        <TooltipWrapper content={task.title}>
          <div className="max-w-[200px] truncate text-sm font-medium text-gray-900">
            {task.title}
          </div>
        </TooltipWrapper>
      ),
      daruma_code: () => (
        <div className="text-sm text-gray-900 whitespace-nowrap">
          {task.daruma_code || 'N/A'}
        </div>
      ),
      status: () => <StatusBadge status={task.status} />,
      alert_date: () => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {task.alert_date 
            ? format(parseISO(task.alert_date), 'd MMM yyyy', { locale: es })
            : 'N/A'
          }
        </div>
      ),
      limit_month: () => (
        <div className="text-sm text-gray-900 whitespace-nowrap text-center">
          {task.limit_month || 'N/A'}
        </div>
      ),
      due_date: () => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {format(new Date(task.due_date), 'd MMM yyyy', { locale: es })}
        </div>
      ),
      deliverable: () => (
        <TooltipWrapper content={task.deliverable || task.entregable || 'N/A'}>
          <div className="max-w-[150px] truncate text-sm text-gray-900">
            {task.deliverable || task.entregable || 'N/A'}
          </div>
        </TooltipWrapper>
      ),
      area: () => (
        <div className="text-sm text-gray-900 whitespace-nowrap">
          {task.area_data?.name || 'N/A'}
        </div>
      ),
      leaders: () => (
        <TooltipWrapper content={task.leaders?.map(l => l.name).join('\n') || 'Sin líder'}>
          <div className="space-y-0.5">
            <div className="text-sm text-gray-900 whitespace-nowrap">
              {task.leaders?.length > 0 ? `${task.leaders.length} líderes` : 'Sin líder'}
            </div>
            {task.leaders?.length > 0 && (
              <div className="text-xs text-gray-500 truncate max-w-[150px]">
                {task.leaders.map(l => l.name).join(', ')}
              </div>
            )}
          </div>
        </TooltipWrapper>
      ),
      support_team: () => (
        <TooltipWrapper
          content={task.support_team?.map(member => member.name).join('\n') || 'N/A'}
        >
          <div className="max-w-[150px] truncate text-sm text-gray-900">
            {task.support_team?.map(member => member.name).join(', ') || 'N/A'}
          </div>
        </TooltipWrapper>
      ),
      evidence: () => (
        <TooltipWrapper content={task.evidence || 'N/A'}>
          <div className="max-w-[150px] truncate text-sm text-gray-900">
            {task.evidence || 'N/A'}
          </div>
        </TooltipWrapper>
      ),
      description: () => (
        <TooltipWrapper content={task.description || 'Sin descripción'}>
          <div className="max-w-[200px] truncate text-sm text-gray-500">
            {task.description || 'Sin descripción'}
          </div>
        </TooltipWrapper>
      ),
      actions: () => (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {canEditTask(task) ? (
              <DropdownMenuItem 
                onClick={() => onEditTask(task)}
                className="flex items-center cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>Editar tarea</span>
              </DropdownMenuItem>
            ) : canEditObservations(task) ? (
              <DropdownMenuItem 
                onClick={() => onEditTask(task)}
                className="flex items-center cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>Agregar observaciones</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onEditTask(task)}
                className="flex items-center cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>Ver detalles</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    };

    return cellContent[column.id]?.() || (
      <div className="text-sm text-gray-900 whitespace-nowrap">
        {task[column.id]}
      </div>
    );
  };

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
      
      <div className="rounded-lg border border-gray-200">
        <div 
          ref={parentRef}
          className="w-full overflow-auto bg-white relative"
          style={{ height: '70vh', overflowX: 'auto', overflowY: 'auto' }}
        >
          <div ref={tableContainerRef}>
            <Table>
              <TableHeader>
                <tr className="border-b border-gray-200">
                  {getVisibleColumns().map((column) => (
                    <th
                      key={column.id}
                      style={{ 
                        width: column.width,
                        minWidth: column.width,
                      }}
                      className="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-900 shadow-sm"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </TableHeader>
              <TableBody>
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
                            className={`absolute w-full border-b border-gray-200 transition-all duration-200 cursor-pointer
                              ${selectedTaskId === task.id 
                                ? 'bg-blue-50 ring-1 ring-blue-200' 
                                : 'hover:bg-gray-50'
                              }
                            `}
                            style={{
                              top: 0,
                              transform: `translateY(${virtualRow.start}px)`,
                              height: `${virtualRow.size}px`,
                            }}
                            onClick={() => handleRowClick(task)}
                            onDoubleClick={() => {
                              // Siempre permitir abrir el modal, la restricción de edición se maneja dentro del modal
                              handleRowDoubleClick(task);
                            }}
                          >
                            <div className="flex items-center h-full">
                              {getVisibleColumns().map((column) => (
                                <div
                                  key={column.id}
                                  style={{ 
                                    width: column.width,
                                    minWidth: column.width,
                                  }}
                                  className="px-4 flex items-center overflow-hidden"
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
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicTableView;