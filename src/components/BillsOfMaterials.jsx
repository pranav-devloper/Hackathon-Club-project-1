import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Layers,
  Wrench,
  Search,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export const BillsOfMaterials = ({
  boms,
  products,
  workCenters,
  onCreateBOM,
}) => {
  const [selectedBomId, setSelectedBomId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // BOM Creation Form
  const [productId, setProductId] = useState(
    products.find((p) => p.category === 'FINISHED_GOOD')?.id || products[0]?.id || 1
  );
  const [reference, setReference] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [components, setComponents] = useState([
    {
      componentProductId: products.find((p) => p.category === 'RAW_MATERIAL')?.id || 3,
      quantity: 1,
    },
  ]);

  const [operations, setOperations] = useState([
    {
      operationName: 'Assembly',
      workCenterId: workCenters[0]?.id || 1,
      expectedDuration: 30,
    },
  ]);

  const activeBom = boms.find((b) => b.id === selectedBomId) || null;

  const handleAddComponent = () => {
    const rawProd = products.find((p) => p.category === 'RAW_MATERIAL') || products[0];
    setComponents((prev) => [
      ...prev,
      { componentProductId: rawProd ? rawProd.id : 1, quantity: 1 },
    ]);
  };

  const handleRemoveComponent = (idx) => {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddOperation = () => {
    setOperations((prev) => [
      ...prev,
      {
        operationName: 'New Operation',
        workCenterId: workCenters[0]?.id || 1,
        expectedDuration: 30,
      },
    ]);
  };

  const handleRemoveOperation = (idx) => {
    setOperations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === Number(productId));
    onCreateBOM({
      productId: Number(productId),
      productName: prod ? prod.name : 'Finished Good',
      reference,
      quantity: Number(quantity),
      components,
      operations,
    });
    setIsCreating(false);
  };

  const filteredBoms = boms.filter((b) => {
    return (
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.productName && b.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.reference && b.reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Master Menu</span>
            <span>/</span>
            <span className="text-blue-600">Bills of Materials</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bills of Materials (BOM)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Define multi-level assembly recipes, component requirements, and manufacturing operations.
          </p>
        </div>

        {!isCreating && !activeBom && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New BOM Recipe</span>
          </button>
        )}
      </div>

      {/* CREATE NEW BOM FORM */}
      {isCreating && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">Create Bill of Materials Recipe</h2>
              <p className="text-xs text-slate-500 font-medium">
                Link finished products to raw materials and work center operations.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Finished Product *
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Reference Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard Assembly v2"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  Batch Output Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Components Section */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Component Materials</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddComponent}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  + Add Line
                </button>
              </div>

              {components.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={comp.componentProductId}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setComponents((prev) =>
                        prev.map((c, i) => (i === idx ? { ...c, componentProductId: val } : c))
                      );
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unitCost} Rs / {p.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={comp.quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setComponents((prev) =>
                        prev.map((c, i) => (i === idx ? { ...c, quantity: val } : c))
                      );
                    }}
                    placeholder="Qty"
                    className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(idx)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Operations Section */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  <span>Operations & Work Centers</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddOperation}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  + Add Operation
                </button>
              </div>

              {operations.map((op, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    value={op.operationName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOperations((prev) =>
                        prev.map((o, i) => (i === idx ? { ...o, operationName: val } : o))
                      );
                    }}
                    placeholder="Operation Name"
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />

                  <select
                    value={op.workCenterId}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setOperations((prev) =>
                        prev.map((o, i) => (i === idx ? { ...o, workCenterId: val } : o))
                      );
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    {workCenters.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (${w.costPerHour}/hr)
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={op.expectedDuration}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOperations((prev) =>
                          prev.map((o, i) => (i === idx ? { ...o, expectedDuration: val } : o))
                        );
                      }}
                      placeholder="Duration (mins)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveOperation(idx)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                Save BOM Template
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ACTIVE SELECTED BOM DETAIL VIEW */}
      {activeBom && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedBomId(null)}
                className="p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
                  {activeBom.code}
                </span>
                <h2 className="text-xl font-black text-slate-900">{activeBom.productName}</h2>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Reference: {activeBom.reference || 'Standard'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Components */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-3">
                Components Table
              </h3>
              <div className="space-y-2">
                {activeBom.components.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs py-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800">{c.componentProductName}</span>
                    <span className="font-extrabold text-blue-600">
                      {c.quantity} {c.unit || 'Unit'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-3">
                Operations Table
              </h3>
              <div className="space-y-2">
                {activeBom.operations.map((o, i) => (
                  <div key={i} className="flex justify-between text-xs py-2 border-b border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">{o.operationName}</span>
                      <span className="text-[10px] text-slate-500">{o.workCenterName}</span>
                    </div>
                    <span className="font-extrabold text-emerald-600">
                      {o.expectedDuration} mins
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOM LIST VIEW */}
      {!isCreating && !activeBom && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search BOM or product..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">BOM Code</th>
                  <th className="py-3.5 px-4">Finished Product</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Components Count</th>
                  <th className="py-3.5 px-4">Operations Count</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredBoms.map((bom) => (
                  <tr
                    key={bom.id}
                    onClick={() => setSelectedBomId(bom.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-black text-slate-900">{bom.code}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{bom.productName}</td>
                    <td className="py-4 px-4 text-slate-500">{bom.reference || 'Standard'}</td>
                    <td className="py-4 px-4 font-extrabold text-blue-600">
                      {bom.components.length} Items
                    </td>
                    <td className="py-4 px-4 font-extrabold text-emerald-600">
                      {bom.operations.length} Ops
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-blue-600 hover:text-white transition-colors">
                        View Mappings
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
