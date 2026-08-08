import React, { useState } from 'react';
import { Boxes, Plus, Search, DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const StockLedgerView = ({
  products,
  onCreateProduct,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('RAW_MATERIAL');
  const [unitCost, setUnitCost] = useState(50);
  const [unit, setUnit] = useState('Unit');
  const [onHand, setOnHand] = useState(100);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateProduct({
      name,
      category,
      unitCost: Number(unitCost),
      unit,
      onHand: Number(onHand),
      freeToUse: Number(onHand),
    });
    setName('');
    setIsCreating(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalLedgerValue = products.reduce((acc, p) => acc + p.onHand * p.unitCost, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Master Menu</span>
            <span>/</span>
            <span className="text-blue-600">Stock Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Stock Ledger & Product Master
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time material stock availability, free-to-use allocation, and inventory valuation.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Stock Item</span>
        </button>
      </div>

      {/* CREATE ITEM MODAL */}
      {isCreating && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <h2 className="text-lg font-black text-slate-900">Add New Product / Raw Material</h2>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Copper Wire 5mm"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RAW_MATERIAL">RAW_MATERIAL</option>
                <option value="FINISHED_GOOD">FINISHED_GOOD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Unit Cost (₹ / $) *
              </label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Measurement Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit, Meter, SqM, Box"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Initial On-Hand Stock
              </label>
              <input
                type="number"
                value={onHand}
                onChange={(e) => setOnHand(Number(e.target.value))}
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
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Bento Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div>
          <span className="text-slate-400 text-xs font-extrabold uppercase tracking-widest block mb-1">
            Total Inventory Ledger Valuation
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            ₹{totalLedgerValue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Calculated dynamically: Sum of (On Hand × Unit Cost)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Items</span>
            <span className="text-lg font-black text-white">{products.length}</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Finished Goods</span>
            <span className="text-lg font-black text-blue-400">
              {products.filter((p) => p.category === 'FINISHED_GOOD').length}
            </span>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {['ALL', 'RAW_MATERIAL', 'FINISHED_GOOD'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product code or name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Unit Cost</th>
                <th className="py-3.5 px-4">On Hand</th>
                <th className="py-3.5 px-4">Free to Use</th>
                <th className="py-3.5 px-4">Incoming</th>
                <th className="py-3.5 px-4">Outgoing</th>
                <th className="py-3.5 px-4 text-right">Total Value (Read-only)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map((p) => {
                const totalVal = p.onHand * p.unitCost;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-900">{p.code}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {p.name}
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">₹{p.unitCost}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      {p.onHand} {p.unit}
                    </td>
                    <td className="py-4 px-4 text-emerald-600 font-bold">{p.freeToUse}</td>
                    <td className="py-4 px-4 text-blue-600 font-semibold">+{p.incoming}</td>
                    <td className="py-4 px-4 text-rose-500 font-semibold">-{p.outgoing}</td>
                    <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                      ₹{totalVal.toLocaleString()}
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
