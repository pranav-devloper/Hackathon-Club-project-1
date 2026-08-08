import React from 'react';
import {
  X,
  ClipboardList,
  Wrench,
  FileText,
  Building2,
  Boxes,
  BarChart3,
  User,
  LayoutDashboard,
  Factory,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const MasterMenu = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  stats,
}) => {
  if (!isOpen) return null;

  const handleSelect = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 border-r border-slate-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">MASTER MENU</h2>
              <p className="text-[11px] text-slate-400 font-medium">Manufactory ERP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick App Metrics Pill */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">MO Orders</span>
              <span className="text-base font-extrabold text-slate-900">{stats.totalMO}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Active MO</span>
              <span className="text-base font-extrabold text-blue-600">{stats.inProgressMO}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Work Orders</span>
              <span className="text-base font-extrabold text-emerald-600">{stats.activeWorkOrders}</span>
            </div>
          </div>
        </div>

        {/* Main Menu Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 block">
              Core Operations
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleSelect('dashboard')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>App Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleSelect('mo')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'mo'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4 h-4" />
                  <span>Manufacturing Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleSelect('wo')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'wo'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4" />
                  <span>Work Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleSelect('bom')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'bom'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <span>Bills of Materials</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleSelect('workcenter')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'workcenter'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4" />
                  <span>Work Center</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleSelect('stock')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'stock'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Boxes className="w-4 h-4" />
                  <span>Stock Ledger</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 block">
              Profile & Setup
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleSelect('profile')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>Users Directory & Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleSelect('reports')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>My Reports & Analytics</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          &copy; 2026 Manufactory Inc.
        </div>
      </div>
    </div>
  );
};
