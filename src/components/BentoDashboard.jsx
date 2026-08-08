import React from 'react';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Boxes,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Factory,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const BentoDashboard = ({
  mos,
  workOrders,
  workCenters,
  products,
  onOpenNewMO,
  onSelectMO,
  setActiveTab,
}) => {
  const totalMO = mos.length;
  const activeMO = mos.filter((m) => m.status === 'In-Progress' || m.status === 'Confirmed').length;
  const completedMO = mos.filter((m) => m.status === 'Done').length;

  const activeWO = workOrders.filter((w) => w.status === 'In Progress' || w.status === 'To Do').length;
  const totalInventoryVal = products.reduce((sum, p) => sum + p.onHand * p.unitCost, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Bento Grid Top Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Hero Bento Card (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-xs hover:border-blue-300 transition-all">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Next-Gen Industrial Systems
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • Real-time Shopfloor Control
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-4 tracking-tight">
              Precision Machining <br />
              <span className="text-blue-600">for Global Impact.</span>
            </h1>

            <p className="text-slate-500 max-w-lg text-sm sm:text-base leading-relaxed mb-8">
              Architecting physical infrastructure with 0.001mm tolerance, automated BOM material tracking, and real-time shop floor work order timers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 relative z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenNewMO}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/25 flex items-center gap-2"
              >
                <span>+ Create MO Order</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('mo')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors"
              >
                View Orders ({totalMO})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold border-2 border-white text-[10px]">
                  PR
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold border-2 border-white text-[10px]">
                  AR
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold border-2 border-white text-[10px]">
                  SC
                </div>
              </div>
              <span className="text-slate-500 font-medium">40+ Aerospace Partners</span>
            </div>
          </div>

          {/* Decorative Vector Graphic */}
          <div className="absolute right-[-8%] bottom-[-8%] opacity-5 pointer-events-none">
            <Factory className="w-96 h-96 text-slate-900" />
          </div>
        </div>

        {/* Right Column Cards (col-span-5) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Accuracy Rate Bento Card */}
          <div className="sm:col-span-2 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Quality & Accuracy Rate
                </span>
                <span className="p-2 bg-slate-800 rounded-xl text-emerald-400 text-xs font-extrabold">
                  +0.4% MoM
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                99.8%
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1.5">
                <span>0.001mm Precision Tolerance</span>
                <span>Target: 99.5%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[99.8%] rounded-full transition-all duration-1000" />
              </div>
            </div>
          </div>

          {/* Market Capacity Card */}
          <div className="bg-blue-600 text-white rounded-3xl p-6 flex flex-col justify-between shadow-md">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 bg-white/10 px-2.5 py-1 rounded-full">
                Live Capacity
              </span>
            </div>
            <div className="mt-6">
              <div className="text-2xl font-black leading-tight mb-1">14 Regions</div>
              <p className="text-xs text-blue-100 font-medium">
                High-volume automated assembly hubs
              </p>
            </div>
          </div>

          {/* Lead Time Card */}
          <div className="bg-slate-100 rounded-3xl p-6 flex flex-col justify-between border border-slate-200">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-white rounded-xl text-slate-800 shadow-2xs">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                Lead Time
              </span>
            </div>
            <div className="mt-6">
              <div className="text-3xl font-black text-slate-900 tracking-tight">14 Days</div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Fast dispatch dispatch guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Bento Grid: Manufacturing Capabilities & Shopfloor Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-500 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">01</span>
          </div>
          <div className="mt-6">
            <h3 className="font-extrabold text-lg text-slate-900">CNC Milling</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              5-axis precision workstations with live duration tracking
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600">
              <span>95% Active Capacity</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-500 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">02</span>
          </div>
          <div className="mt-6">
            <h3 className="font-extrabold text-lg text-slate-900">Injection Molding</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Rapid prototyping & high volume automated molders
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <span>Operational</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-500 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Boxes className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">03</span>
          </div>
          <div className="mt-6">
            <h3 className="font-extrabold text-lg text-slate-900">Stock & Supply Chain</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Automated BOM raw material ledger & inventory evaluation
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>₹{totalInventoryVal.toLocaleString()} Ledger Value</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">
              Live Status
            </span>
          </div>
          <div className="mt-6">
            <div className="text-3xl font-black text-white tracking-tight">{activeWO}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Active Shop Floor Work Orders Queue
            </p>
            <button
              onClick={() => setActiveTab('wo')}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Launch Work Timers</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Active Manufacturing Orders & Work Center Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent MO Orders Table (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Manufacturing Orders Breakdown
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time tracking from Draft to Confirmed, In-Progress, and Done
              </p>
            </div>
            <button
              onClick={() => setActiveTab('mo')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All ({mos.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">MO Code</th>
                  <th className="py-3 px-3">Finished Product</th>
                  <th className="py-3 px-3">BOM Recipe</th>
                  <th className="py-3 px-3">Qty</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {mos.slice(0, 5).map((mo) => (
                  <tr key={mo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{mo.code}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {mo.finishedProductName || 'Product'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{mo.bomCode || 'Custom'}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {mo.quantity} {mo.unit}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{mo.assignee}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          mo.status === 'Draft'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : mo.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : mo.status === 'In-Progress'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : mo.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {mo.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onSelectMO(mo)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white transition-colors text-slate-600 font-bold"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Centers Load List (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Work Centers Load
              </h2>
              <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Hourly Rates
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {workCenters.map((wc) => (
                <div
                  key={wc.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{wc.name}</span>
                    <span className="text-xs font-black text-blue-600">${wc.costPerHour}/hr</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Code: {wc.code}</span>
                    <span className="text-emerald-600 font-bold">{wc.status}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${wc.capacity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('workcenter')}
            className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors"
          >
            Manage Work Centers
          </button>
        </div>
      </div>
    </div>
  );
};
