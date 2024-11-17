import React from 'react';
import KPISection from './components/KPISection';
import StrategicLineChart from './components/StrategicLineChart';
import MonthlyProgressChart from './components/MonthlyProgressChart';
import WorkloadChart from './components/WorkloadChart';
import TimelineChart from './components/TimelineChart';

const ChartsContainer = ({ data }) => {
  if (!data) return null;

  const strategicLineData = Object.values(data.byStrategicLine);
  const monthlyData = Object.values(data.byMonth);
  const leaderWorkloadData = Object.values(data.byLeader);

  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <KPISection kpis={data.kpis} />

      {/* Timeline Chart - Full Width */}
      <TimelineChart data={data.timeline} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StrategicLineChart data={strategicLineData} />
        <MonthlyProgressChart data={monthlyData} />
        <WorkloadChart data={leaderWorkloadData} />
      </div>
    </div>
  );
};

export default ChartsContainer;