import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Building2,
  BarChart3,
  Sparkles,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const WorkOrders = ({
  workOrders,
  workCenters,
  onUpdateWorkOrder,
}) => {
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkCenter, setFilterWorkCenter] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Active live timer state
  const [activeTimerWoId, setActiveTimerWoId] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Live timer tick effect
  useEffect(() => {
    let interval = null;
    if (activeTimerWoId !== null) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimerWoId]);

  const handleStartTimer = (wo) => {
    if (activeTimerWoId === wo.id) {
      // Pause timer & update real duration
      const elapsedMins = Math.ceil(timerSeconds / 60);
      onUpdateWorkOrder(wo.id, {
        realDuration: wo.realDuration + (elapsedMins > 0 ? elapsedMins : 1),
        status: 'In Progress',
      });
      setActiveTimerWoId(null);
      setTimerSeconds(0);
    } else {
      // Start timer
      setActiveTimerWoId(wo.id);
      setTimerSeconds(0);
      onUpdateWorkOrder(wo.id, { status: 'In Progress' });
    }
  };

  const handleMarkDone = (wo) => {
    if (activeTimerWoId === wo.id) {
      const elapsedMins = Math.ceil(timerSeconds / 60);
      onUpdateWorkOrder(wo.id, {
        realDuration: wo.realDuration + elapsedMins,
        status: 'Done',
      });
      setActiveTimerWoId(null);
      setTimerSeconds(0);
    } else {
      onUpdateWorkOrder(wo.id, {
        realDuration: wo.realDuration === 0 ? wo.expectedDuration : wo.realDuration,
        status: 'Done',
      });
    }
  };

  const filteredWO = workOrders.filter((wo) => {
    const matchesCenter =
      filterWorkCenter === 'ALL' || wo.workCenterId === Number(filterWorkCenter);
    const matchesStatus = filterStatus === 'ALL' || wo.status === filterStatus;
    const matchesSearch =
      wo.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wo.workCenterName && wo.workCenterName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (wo.finishedProduct && wo.finishedProduct.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (wo.moCode && wo.moCode.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCenter && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Master Menu</span>
            <span>/</span>
            <span className="text-blue-600">Work Orders</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Work Orders & Shopfloor Timer
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Live shop floor operations, machine center assignments, and real duration tracking.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('analysis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'analysis'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work Orders Analysis
          </button>
        </div>
      </div>

      {/* VIEW 1: LIST VIEW & LIVE SHOPFLOOR TIMERS */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Filters & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search operation, product..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={filterWorkCenter}
                onChange={(e) => setFilterWorkCenter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Work Centers</option>
                {workCenters.map((wc) => (
                  <option key={wc.id} value={wc.id}>
                    {wc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">WO Code</th>
                  <th className="py-3.5 px-4">Operation</th>
                  <th className="py-3.5 px-4">Work Center</th>
                  <th className="py-3.5 px-4">Finished Product</th>
                  <th className="py-3.5 px-4">Expected</th>
                  <th className="py-3.5 px-4">Real Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Timer Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredWO.map((wo) => {
                  const isTiming = activeTimerWoId === wo.id;
                  return (
                    <tr
                      key={wo.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isTiming ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-4 px-4 font-black text-slate-900">{wo.code}</td>
                      <td className="py-4 px-4 font-bold text-slate-800">{wo.operation}</td>
                      <td className="py-4 px-4 text-slate-600 font-medium">{wo.workCenterName}</td>
                      <td className="py-4 px-4 text-slate-600">{wo.finishedProduct}</td>
                      <td className="py-4 px-4 text-slate-500">{wo.expectedDuration} mins</td>
                      <td className="py-4 px-4 font-extrabold text-blue-600">
                        {isTiming ? (
                          <span className="animate-pulse text-blue-700">
                            {wo.realDuration + Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
                          </span>
                        ) : (
                          `${wo.realDuration} mins`
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            wo.status === 'To Do'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : wo.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {wo.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {wo.status !== 'Done' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartTimer(wo)}
                              className={`p-2 rounded-xl font-bold transition-all shadow-xs ${
                                isTiming
                                  ? 'bg-amber-500 text-white hover:bg-amber-600 animate-bounce'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              title={isTiming ? 'Pause Operation Timer' : 'Start Live Timer'}
                            >
                              {isTiming ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current" />
                              )}
                            </button>

                            <button
                              onClick={() => handleMarkDone(wo)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: WORK ORDERS ANALYSIS (Matches Image Page Diagram) */}
      {viewMode === 'analysis' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">Work Orders Analysis</h2>
              <p className="text-xs text-slate-500 font-medium">
                Efficiency breakdown comparing expected duration vs actual duration across machine centers.
              </p>
            </div>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Duration Variance Report
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Operation</th>
                  <th className="py-3.5 px-4">Work Center</th>
                  <th className="py-3.5 px-4">Finished Product</th>
                  <th className="py-3.5 px-4">Expected Duration</th>
                  <th className="py-3.5 px-4">Real Duration</th>
                  <th className="py-3.5 px-4">Variance</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {workOrders.map((wo) => {
                  const diff = wo.realDuration - wo.expectedDuration;
                  return (
                    <tr key={wo.id} className="hover:bg-slate-50">
                      <td className="py-4 px-4 font-bold text-slate-900">{wo.operation}</td>
                      <td className="py-4 px-4 text-slate-700">{wo.workCenterName}</td>
                      <td className="py-4 px-4 text-slate-600">{wo.finishedProduct}</td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {wo.expectedDuration}.00 mins
                      </td>
                      <td className="py-4 px-4 font-extrabold text-blue-600">
                        {wo.realDuration}.00 mins
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold ${
                            diff <= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {diff <= 0 ? `${diff}.00m (Faster)` : `+${diff}.00m (Delay)`}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800">{wo.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
