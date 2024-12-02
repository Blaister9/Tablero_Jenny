import React from 'react';
import { Plus, Layers, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import RequireAuth from '../RequireAuth';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow ${color}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className={`p-2 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
        <Icon className={`w-5 h-5 ${color.replace('border-l-', 'text-')}`} />
      </div>
    </div>
  </motion.div>
);

const StrategicHeader = ({ tasks = [], onNewTask }) => {
  const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
  const inProgressTasks = tasks.filter(t => t.status === 'En proceso').length;
  const completedTasks = tasks.filter(t => t.status === 'Cumplido').length;
  const { canCreateTask } = useAuth();

  const stats = [
    {
      title: 'Total Tareas',
      value: tasks.length,
      icon: Layers,
      color: 'border-l-gray-500'
    },
    {
      title: 'Pendientes',
      value: pendingTasks,
      icon: AlertCircle,
      color: 'border-l-yellow-500'
    },
    {
      title: 'En Proceso',
      value: inProgressTasks,
      icon: Clock,
      color: 'border-l-blue-500'
    },
    {
      title: 'Completadas',
      value: completedTasks,
      icon: CheckCircle,
      color: 'border-l-green-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Seguimiento Estratégico
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona y monitorea todas las tareas estratégicas
          </p>
        </div>

        <RequireAuth
          fallback={
            <button
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Iniciar sesión para crear tarea
            </button>
          }
        >
          {canCreateTask() && (
            <button
              onClick={onNewTask}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </button>
          )}
        </RequireAuth>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </motion.div>

      {tasks.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategicHeader;