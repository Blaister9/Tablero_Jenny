import React from 'react';
import KPISection from './components/KPISection';
import StrategicLineChart from './components/StrategicLineChart';
import MonthlyProgressChart from './components/MonthlyProgressChart';
import WorkloadChart from './components/WorkloadChart';
import TimelineChart from './components/TimelineChart';
import TasksNearDueChart from './components/TasksNearDueChart';
import ComplianceRateKPI from './components/ComplianceRateKPI';
import FutureWorkloadChart from './components/FutureWorkloadChart';
import CriticalTasksTable from './components/CriticalTasksTable';
import AverageResolutionTimeKPI from './components/AverageResolutionTimeKPI';

const ChartsContainer = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPISection kpis={data.kpis} />
        <ComplianceRateKPI 
          rate={data.kpis.complianceRate} 
          completedTasks={data.kpis.completed} 
          totalTasks={data.kpis.total} 
        />
        <AverageResolutionTimeKPI 
          averageTime={data.kpis.averageResolutionTime} 
        />
      </div>

      {/* Critical and Near Due Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksNearDueChart data={data.tasksNearDue} />
        <CriticalTasksTable data={data.criticalTasks} />
      </div>

      {/* Workload and Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FutureWorkloadChart data={data.futureWorkload} />
        <MonthlyProgressChart data={Object.values(data.byMonth)} />
      </div>

      {/* Strategic Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrategicLineChart data={Object.values(data.byStrategicLine)} />
        <WorkloadChart data={Object.values(data.byLeader)} />
      </div>

      {/* Timeline Section - Full Width */}
      <TimelineChart data={data.timeline} />
    </div>
  );
};

export default ChartsContainer;