import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, TrendingUp, Clock, DollarSign, Filter, Search } from 'lucide-react';

export const ReportsView = ({
  workOrders,
  mos,
  workCenters,
}) => {
  const [searchOp, setSearchOp] = useState('');

  // Transform data for Expected vs Real Duration Chart
  const durationChartData = workOrders.map((w) => ({
    name: w.operation,
    Expected: w.expectedDuration,
    Real: w.realDuration,
    WorkCenter: w.workCenterName,
  }));

  // Work Center Cost Breakdown Chart Data
  const workCenterCostData = workCenters.map((wc) => {
    const wcOrders = workOrders.filter((w) => w.workCenterId === wc.id);
    const totalMins = wcOrders.reduce((sum, w) => sum + (w.realDuration || w.expectedDuration), 0);
    const cost = Math.round((totalMins / 60) * wc.costPerHour);
    return {
      name: wc.name.length > 24 ? wc.name.substring(0, 22) + '...' : wc.name,
      TotalMinutes: totalMins,
      TotalCost: cost,
    };
  });

  const filteredOrders = workOrders.filter((w) =>
    w.operation.toLowerCase().includes(searchOp.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Master Menu</span>
            <span>/</span>
            <span className="text-blue-600">My Reports</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manufacturing & Work Order Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            In-depth variance analysis on operation durations, labor costs, and workstation efficiency.
          </p>
        </div>
        <span className="text-xs font-extrabold uppercase bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
          Executive Report
        </span>
      </div>

      {/* Bento Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Duration Variance (Expected vs Real Duration) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Duration Variance Analysis</h2>
              <p className="text-xs text-slate-500 font-medium">Expected vs Real Duration (Minutes)</p>
            </div>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Expected" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Real" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Work Center Cost & Processing Load */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Workstation Cost Allocation</h2>
              <p className="text-xs text-slate-500 font-medium">Accumulated Labor & Machine Costs ($)</p>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workCenterCostData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="TotalCost" stroke="#059669" fill="#d1fae5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Search & Filter Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Operation Performance Audit</h2>
            <p className="text-xs text-slate-500 font-medium">Filter based on operation name or work center</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchOp}
              onChange={(e) => setSearchOp(e.target.value)}
              placeholder="Search operation name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">WO Code</th>
                <th className="py-3.5 px-4">Operation</th>
                <th className="py-3.5 px-4">Work Center</th>
                <th className="py-3.5 px-4">Expected</th>
                <th className="py-3.5 px-4">Actual</th>
                <th className="py-3.5 px-4">Efficiency Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map((wo) => {
                const ratio = wo.expectedDuration ? (wo.expectedDuration / (wo.realDuration || wo.expectedDuration)) * 100 : 100;
                return (
                  <tr key={wo.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4 font-black text-slate-900">{wo.code}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{wo.operation}</td>
                    <td className="py-4 px-4 text-slate-600">{wo.workCenterName}</td>
                    <td className="py-4 px-4 text-slate-500">{wo.expectedDuration} mins</td>
                    <td className="py-4 px-4 font-extrabold text-blue-600">{wo.realDuration} mins</td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-black text-xs ${
                          ratio >= 100 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {Math.min(Math.round(ratio), 150)}% Efficient
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
