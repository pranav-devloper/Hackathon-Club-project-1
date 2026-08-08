import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MasterMenu } from './components/MasterMenu';
import { BentoDashboard } from './components/BentoDashboard';
import { ManufacturingOrders } from './components/ManufacturingOrders';
import { WorkOrders } from './components/WorkOrders';
import { BillsOfMaterials } from './components/BillsOfMaterials';
import { WorkCenterView } from './components/WorkCenterView';
import { StockLedgerView } from './components/StockLedgerView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';

import {
  initialProducts,
  initialWorkCenters,
  initialBOMs,
  initialMOs,
  initialUsers,
} from './data/mockData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // App Data State
  const [mos, setMos] = useState(initialMOs);
  const [products, setProducts] = useState(initialProducts);
  const [workCenters, setWorkCenters] = useState(initialWorkCenters);
  const [boms, setBoms] = useState(initialBOMs);
  const [usersList, setUsersList] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedMoId, setSelectedMoId] = useState(null);

  // Derive flat array of all work orders
  const allWorkOrders = mos.flatMap((m) => m.workOrders || []);

  // Check stored JWT token on app mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Token expired or invalid');
          return res.json();
        })
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setIsVerifyingAuth(false);
        });
    } else {
      setIsAuthenticated(false);
      setIsVerifyingAuth(false);
    }

    // Fetch user list
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setUsersList(data);
      })
      .catch(() => {});
  }, []);

  // Fetch ERP app data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/mo')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMos(data);
      })
      .catch(() => {});

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data);
      })
      .catch(() => {});

    fetch('/api/work-centers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setWorkCenters(data);
      })
      .catch(() => {});

    fetch('/api/boms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBoms(data);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Handlers
  const handleCreateMO = (moData) => {
    fetch('/api/mo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moData),
    })
      .then((res) => res.json())
      .then((newMo) => {
        setMos((prev) => [newMo, ...prev]);
        setSelectedMoId(newMo.id);
        setActiveTab('mo');
      })
      .catch(() => {
        // Local fallback
        const finishedProd = products.find((p) => p.id === moData.finishedProductId);
        const bom = boms.find((b) => b.id === moData.bomId);
        const qty = moData.quantity || 1;

        const newMO = {
          id: Date.now(),
          code: `MO-${String(mos.length + 1).padStart(5, '0')}`,
          finishedProductId: moData.finishedProductId || 1,
          finishedProductName: finishedProd ? finishedProd.name : 'Finished Good',
          bomId: moData.bomId || null,
          bomCode: bom ? bom.code : undefined,
          quantity: qty,
          unit: finishedProd ? finishedProd.unit : 'Unit',
          scheduleDate: moData.scheduleDate || new Date().toISOString().split('T')[0],
          assignee: moData.assignee || currentUser.displayName,
          status: 'Draft',
          components: (bom ? bom.components : []).map((c, i) => {
            const compProd = products.find((p) => p.id === c.componentProductId);
            return {
              id: i + 1,
              productId: c.componentProductId,
              productName: compProd ? compProd.name : 'Component',
              toConsume: c.quantity * qty,
              consumed: 0,
              availability: 'Available',
              unit: c.unit || 'Unit',
            };
          }),
          workOrders: (bom ? bom.operations : []).map((op, i) => {
            const wc = workCenters.find((w) => w.id === op.workCenterId);
            return {
              id: Date.now() + i,
              code: `WO-${String(mos.length + 1).padStart(5, '0')}-${i + 1}`,
              moId: Date.now(),
              operation: op.operationName,
              workCenterId: op.workCenterId,
              workCenterName: wc ? wc.name : 'Work Center',
              finishedProduct: finishedProd ? finishedProd.name : 'Product',
              expectedDuration: op.expectedDuration * qty,
              realDuration: 0,
              status: 'To Do',
            };
          }),
        };

        setMos((prev) => [newMO, ...prev]);
        setSelectedMoId(newMO.id);
        setActiveTab('mo');
      });
  };

  const handleUpdateMOStatus = (moId, status) => {
    fetch(`/api/mo/${moId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((updatedMo) => {
        setMos((prev) => prev.map((m) => (m.id === moId ? updatedMo : m)));
      })
      .catch(() => {
        setMos((prev) =>
          prev.map((m) => {
            if (m.id === moId) {
              const newMo = { ...m, status };
              if (status === 'Done') {
                newMo.workOrders = newMo.workOrders.map((w) => ({
                  ...w,
                  status: 'Done',
                  realDuration: w.realDuration === 0 ? w.expectedDuration : w.realDuration,
                }));
                newMo.components = newMo.components.map((c) => ({
                  ...c,
                  consumed: c.toConsume,
                }));
              }
              return newMo;
            }
            return m;
          })
        );
      });
  };

  const handleUpdateWorkOrder = (woId, woData) => {
    fetch(`/api/work-orders/${woId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(woData),
    })
      .then((res) => res.json())
      .then(() => {
        // Refresh MO list
        fetch('/api/mo')
          .then((r) => r.json())
          .then((data) => setMos(data));
      })
      .catch(() => {
        setMos((prev) =>
          prev.map((mo) => {
            const woIdx = mo.workOrders.findIndex((w) => w.id === woId);
            if (woIdx !== -1) {
              const updatedWos = [...mo.workOrders];
              updatedWos[woIdx] = { ...updatedWos[woIdx], ...woData };
              const allDone = updatedWos.every((w) => w.status === 'Done');
              return {
                ...mo,
                workOrders: updatedWos,
                status: allDone ? 'Done' : mo.status === 'Draft' ? 'In-Progress' : mo.status,
              };
            }
            return mo;
          })
        );
      });
  };

  const handleCreateProduct = (prodData) => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodData),
    })
      .then((res) => res.json())
      .then((newP) => setProducts((prev) => [...prev, newP]))
      .catch(() => {
        const newP = {
          id: Date.now(),
          code: `PRD-${Math.floor(100 + Math.random() * 900)}`,
          name: prodData.name || 'New Item',
          category: prodData.category || 'RAW_MATERIAL',
          unitCost: prodData.unitCost || 0,
          unit: prodData.unit || 'Unit',
          onHand: prodData.onHand || 0,
          freeToUse: prodData.onHand || 0,
          incoming: 0,
          outgoing: 0,
        };
        setProducts((prev) => [...prev, newP]);
      });
  };

  const handleCreateWorkCenter = (wcData) => {
    fetch('/api/work-centers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wcData),
    })
      .then((res) => res.json())
      .then((newWc) => setWorkCenters((prev) => [...prev, newWc]))
      .catch(() => {
        const newWc = {
          id: Date.now(),
          code: `WC-00${workCenters.length + 1}`,
          name: wcData.name || 'Workstation',
          costPerHour: wcData.costPerHour || 50,
          capacity: wcData.capacity || 100,
          status: wcData.status || 'OPERATIONAL',
        };
        setWorkCenters((prev) => [...prev, newWc]);
      });
  };

  const handleCreateBOM = (bomData) => {
    fetch('/api/boms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bomData),
    })
      .then((res) => res.json())
      .then((newBom) => setBoms((prev) => [...prev, newBom]))
      .catch(() => {
        const prod = products.find((p) => p.id === bomData.productId);
        const newBom = {
          id: Date.now(),
          code: `BOM-${String(boms.length + 1).padStart(5, '0')}`,
          productId: bomData.productId || 1,
          productName: prod ? prod.name : 'Finished Good',
          quantity: bomData.quantity || 1,
          reference: bomData.reference || 'Custom Assembly',
          components: bomData.components || [],
          operations: bomData.operations || [],
        };
        setBoms((prev) => [...prev, newBom]);
      });
  };

  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-bold tracking-wider uppercase text-slate-300">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} usersList={usersList} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col antialiased">
      {/* Top Header */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNewMO={() => {
          setSelectedMoId(null);
          setActiveTab('mo');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Master Drawer Menu */}
      <MasterMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={{
          totalMO: mos.length,
          inProgressMO: mos.filter((m) => m.status === 'In-Progress' || m.status === 'Confirmed').length,
          activeWorkOrders: allWorkOrders.filter((w) => w.status !== 'Done').length,
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(usr) => setCurrentUser(usr)}
        usersList={usersList}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <BentoDashboard
            mos={mos}
            workOrders={allWorkOrders}
            workCenters={workCenters}
            products={products}
            onOpenNewMO={() => {
              setSelectedMoId(null);
              setActiveTab('mo');
            }}
            onSelectMO={(mo) => {
              setSelectedMoId(mo.id);
              setActiveTab('mo');
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'mo' && (
          <ManufacturingOrders
            mos={mos}
            products={products}
            boms={boms}
            workCenters={workCenters}
            onCreateMO={handleCreateMO}
            onUpdateStatus={handleUpdateMOStatus}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            selectedMoId={selectedMoId}
            onClearSelection={() => setSelectedMoId(null)}
          />
        )}

        {activeTab === 'wo' && (
          <WorkOrders
            workOrders={allWorkOrders}
            workCenters={workCenters}
            onUpdateWorkOrder={handleUpdateWorkOrder}
          />
        )}

        {activeTab === 'bom' && (
          <BillsOfMaterials
            boms={boms}
            products={products}
            workCenters={workCenters}
            onCreateBOM={handleCreateBOM}
          />
        )}

        {activeTab === 'workcenter' && (
          <WorkCenterView
            workCenters={workCenters}
            onCreateWorkCenter={handleCreateWorkCenter}
          />
        )}

        {activeTab === 'stock' && (
          <StockLedgerView
            products={products}
            onCreateProduct={handleCreateProduct}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            workOrders={allWorkOrders}
            mos={mos}
            workCenters={workCenters}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onSwitchUser={(u) => setCurrentUser(u)}
            usersList={usersList}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer (Matching Bento Theme Spec) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-extrabold text-slate-400">
          <div className="flex flex-wrap items-center gap-6">
            <span>&copy; 2026 MANUFACTORY INC.</span>
            <span className="hover:text-slate-600 cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-slate-600 cursor-pointer">ERP DOCUMENTATION</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Operational Status: Optimized (0.001mm)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
