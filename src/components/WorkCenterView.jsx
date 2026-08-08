import React, { useState } from 'react';
import { Building2, Plus, Wrench, ShieldAlert, CheckCircle2, DollarSign } from 'lucide-react';

export const WorkCenterView = ({
  workCenters,
  onCreateWorkCenter,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [costPerHour, setCostPerHour] = useState(50);
  const [capacity, setCapacity] = useState(100);
  const [status, setStatus] = useState('OPERATIONAL');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateWorkCenter({
      name,
      costPerHour: Number(costPerHour),
      capacity: Number(capacity),
      status,
    });
    setName('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Master Menu</span>
            <span>/</span>
            <span className="text-blue-600">Work Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Woodworking Machinery & Work Centers
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor woodworking station capacities, hourly machine operating rates, and wood fabrication status.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Machine / Work Center</span>
        </button>
      </div>

      {/* QUICK WOODWORKING MACHINE PRESETS CARD */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <span>🪵 Woodworking Machine Presets</span>
          </span>
          <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            Industrial Wood Manufacturing
          </span>
        </div>
        <p className="text-xs text-amber-800 font-medium">
          Quickly select a standard woodworking machine type to auto-populate new workstation parameters:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: '🪚 Sliding Table Panel Saw', name: 'Sliding Table Panel Saw & Rip Saw Station', cost: 55 },
            { label: '🪵 Surface Planer & Jointer', name: 'Surface Planer, Jointer & Thicknesser Bay', cost: 65 },
            { label: '⚡ 5-Axis CNC Wood Router', name: '5-Axis CNC Wood Router & Carving Center', cost: 95 },
            { label: '🛠️ Automatic Edgebander', name: 'Automatic Edgebander & Vacuum Veneer Press', cost: 75 },
            { label: '🪨 Wide-Belt Sander', name: 'Wide-Belt Calibrating Sander & Hand Polish Station', cost: 50 },
            { label: '🎨 Spray Lacquer Booth', name: 'Automated Spray Painting & Lacquer Curing Booth', cost: 85 },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setName(preset.name);
                setCostPerHour(preset.cost);
                setIsCreating(true);
              }}
              className="bg-white hover:bg-amber-100/60 text-slate-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE WORK CENTER MODAL */}
      {isCreating && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <h2 className="text-lg font-black text-slate-900">Add New Work Center</h2>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Work Center Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CNC Machine Center-B"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Operating Cost per Hour ($/hr) *
              </label>
              <input
                type="number"
                value={costPerHour}
                onChange={(e) => setCostPerHour(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Max Capacity (%)
              </label>
              <input
                type="number"
                max="100"
                min="10"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="OPERATIONAL">OPERATIONAL</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-500/20"
              >
                Save Work Center
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Work Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workCenters.map((wc) => (
          <div
            key={wc.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:border-blue-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">
                  {wc.code}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    wc.status === 'OPERATIONAL'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {wc.status}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 mb-2">{wc.name}</h3>

              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Cost / Hour:</span>
                  <span className="font-black text-blue-600">${wc.costPerHour}.00</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Efficiency Capacity:</span>
                  <span className="font-bold text-slate-900">{wc.capacity}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${wc.capacity}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
