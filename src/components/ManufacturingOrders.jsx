import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Clock,
  Boxes,
  Wrench,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';

export const ManufacturingOrders = ({
  mos,
  products,
  boms,
  workCenters,
  onCreateMO,
  onUpdateStatus,
  onUpdateWorkOrder,
  selectedMoId,
  onClearSelection,
}) => {
  const [activeTab, setActiveTab] = useState('components');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // New MO Form state
  const [newProductId, setNewProductId] = useState(
    products.find((p) => p.category === 'FINISHED_GOOD')?.id || products[0]?.id || 1
  );
  const [newBomId, setNewBomId] = useState(boms[0]?.id || null);
  const [newQty, setNewQty] = useState(1);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAssignee, setNewAssignee] = useState('Alex Rivera');

  // Active selected MO detail
  const currentMo = mos.find((m) => m.id === selectedMoId) || null;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateMO({
      finishedProductId: Number(newProductId),
      bomId: newBomId ? Number(newBomId) : null,
      quantity: Number(newQty),
      scheduleDate: newDate,
      assignee: newAssignee,
    });
    setIsCreating(false);
  };

  const filteredMOs = mos.filter((m) => {
    const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
    const matchesSearch =
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.finishedProductName && m.finishedProductName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Master Menu</span>
            <span>/</span>
            <span className="text-blue-600">Manufacturing Orders</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manufacturing Orders (MO)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage product assemblies, raw material allocation, and work order scheduling.
          </p>
        </div>

        {!currentMo && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Manufacturing Order</span>
          </button>
        )}
      </div>

      {/* CREATE NEW MO MODAL / FORM */}
      {isCreating && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">Create Manufacturing Order</h2>
              <p className="text-xs text-slate-500">
                Select a finished product and Bill of Materials to automatically generate work orders.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Finished Product *
              </label>
              <select
                value={newProductId}
                onChange={(e) => {
                  const prodId = Number(e.target.value);
                  setNewProductId(prodId);
                  const matchingBom = boms.find((b) => b.productId === prodId);
                  if (matchingBom) setNewBomId(matchingBom.id);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {products
                  .filter((p) => p.category === 'FINISHED_GOOD')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) - ₹{p.unitCost}/unit
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Bill of Material (BOM) Recipe
              </label>
              <select
                value={newBomId || ''}
                onChange={(e) => setNewBomId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No BOM (Custom Assembly)</option>
                {boms.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.productName} ({b.reference || 'Standard'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={newQty}
                onChange={(e) => setNewQty(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Schedule Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Assignee / Supervisor
              </label>
              <input
                type="text"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                Confirm & Create MO
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SELECTED MO DETAILED VIEW (Matches Image Breakdown Page) */}
      {currentMo ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Top Control Bar & State Indicators */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            {/* Back Button & Code */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClearSelection}
                className="p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                title="Back to List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest block">
                  Manufacturing Order
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentMo.code}
                </h2>
              </div>
            </div>

            {/* State Diagram Progression Bar */}
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider">
              <span
                className={`px-3 py-1.5 rounded-xl ${
                  currentMo.status === 'Draft'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Draft
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-3 py-1.5 rounded-xl ${
                  currentMo.status === 'Confirmed' || currentMo.status === 'In-Progress'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                In-Progress
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-3 py-1.5 rounded-xl ${
                  currentMo.status === 'Done'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Done
              </span>
              {currentMo.status === 'Cancelled' && (
                <span className="ml-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white shadow-xs">
                  Cancelled
                </span>
              )}
            </div>

            {/* Operational Action Buttons (From Diagram: Confirm, Produce / Start, Done, Cancel) */}
            <div className="flex flex-wrap items-center gap-2">
              {currentMo.status === 'Draft' && (
                <button
                  onClick={() => onUpdateStatus(currentMo.id, 'Confirmed')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  Confirm Order
                </button>
              )}

              {(currentMo.status === 'Confirmed' || currentMo.status === 'In-Progress') && (
                <button
                  onClick={() => onUpdateStatus(currentMo.id, 'In-Progress')}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  Start Operations
                </button>
              )}

              {currentMo.status !== 'Done' && currentMo.status !== 'Cancelled' && (
                <button
                  onClick={() => onUpdateStatus(currentMo.id, 'Done')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
                >
                  Produce / Mark Done
                </button>
              )}

              {currentMo.status !== 'Cancelled' && (
                <button
                  onClick={() => onUpdateStatus(currentMo.id, 'Cancelled')}
                  className="bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* MO Main Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-extrabold uppercase tracking-wider block text-[10px]">
                Finished Product
              </span>
              <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                {currentMo.finishedProductName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-extrabold uppercase tracking-wider block text-[10px]">
                Quantity & Units
              </span>
              <span className="font-extrabold text-slate-900 text-sm block mt-0.5">
                {currentMo.quantity} {currentMo.unit}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-extrabold uppercase tracking-wider block text-[10px]">
                Schedule Date
              </span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">
                {currentMo.scheduleDate || 'Unscheduled'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-extrabold uppercase tracking-wider block text-[10px]">
                Supervisor / Assignee
              </span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">
                {currentMo.assignee || 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Tabs: Components vs Work Orders */}
          <div className="space-y-4">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('components')}
                className={`pb-3 px-6 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'components'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Components ({currentMo.components.length})
              </button>
              <button
                onClick={() => setActiveTab('workOrders')}
                className={`pb-3 px-6 font-extrabold text-xs uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'workOrders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Work Orders ({currentMo.workOrders.length})
              </button>
            </div>

            {/* TAB 1: COMPONENTS TABLE */}
            {activeTab === 'components' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Component Product</th>
                      <th className="py-3 px-3">Availability</th>
                      <th className="py-3 px-3">To Consume</th>
                      <th className="py-3 px-3">Consumed</th>
                      <th className="py-3 px-3">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {currentMo.components.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{c.productName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.availability === 'Available'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {c.availability}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">{c.toConsume}</td>
                        <td className="py-3 px-3 text-slate-600">{c.consumed}</td>
                        <td className="py-3 px-3 text-slate-500">{c.unit || 'Unit'}</td>
                      </tr>
                    ))}
                    {currentMo.components.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No component dependencies mapped.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: WORK ORDERS TABLE WITH TIMER (Diagram Feature) */}
            {activeTab === 'workOrders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Operation</th>
                      <th className="py-3 px-3">Work Center</th>
                      <th className="py-3 px-3">Expected Duration</th>
                      <th className="py-3 px-3">Real Duration</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Shopfloor Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {currentMo.workOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{wo.operation}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{wo.workCenterName}</td>
                        <td className="py-3 px-3 text-slate-500">{wo.expectedDuration} mins</td>
                        <td className="py-3 px-3 font-bold text-blue-600">{wo.realDuration} mins</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              wo.status === 'To Do'
                                ? 'bg-slate-100 text-slate-700'
                                : wo.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : wo.status === 'Done'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {wo.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {wo.status !== 'Done' ? (
                            <button
                              onClick={() => {
                                const newStatus =
                                  wo.status === 'To Do' ? 'In Progress' : 'Done';
                                const addedDuration =
                                  wo.status === 'In Progress' ? wo.expectedDuration : 15;
                                onUpdateWorkOrder(wo.id, {
                                  status: newStatus,
                                  realDuration: wo.realDuration + addedDuration,
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 ml-auto ${
                                wo.status === 'To Do'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>
                                {wo.status === 'To Do' ? 'Start Timer' : 'Mark Complete'}
                              </span>
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MO LIST VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'Draft', 'Confirmed', 'In-Progress', 'Done', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search MO or product..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* MO Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">MO Code</th>
                  <th className="py-3.5 px-4">Finished Product</th>
                  <th className="py-3.5 px-4">BOM Recipe</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Schedule Date</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">State</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredMOs.map((mo) => (
                  <tr
                    key={mo.id}
                    onClick={() => onUpdateStatus(mo.id, mo.status)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 font-black text-slate-900">{mo.code}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {mo.finishedProductName}
                    </td>
                    <td className="py-4 px-4 text-slate-500">{mo.bomCode || 'Custom'}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      {mo.quantity} {mo.unit}
                    </td>
                    <td className="py-4 px-4 text-slate-600">{mo.scheduleDate}</td>
                    <td className="py-4 px-4 text-slate-600">{mo.assignee}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
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
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // view details
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-colors text-xs"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMOs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No manufacturing orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
