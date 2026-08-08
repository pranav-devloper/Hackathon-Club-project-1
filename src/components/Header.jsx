import React from 'react';
import { Menu, Search, User, CheckCircle2, Shield, Wrench, Boxes, Sparkles, LogOut, Key } from 'lucide-react';

export const Header = ({
  onOpenMenu,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuth,
  onOpenNewMO,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Menu Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button
            onClick={onOpenMenu}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-2 font-medium text-xs"
            title="Open Master Menu"
          >
            <Menu className="w-5 h-5 text-slate-900" />
            <span className="hidden sm:inline uppercase tracking-wider font-bold">Master Menu</span>
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">
                MANUFACTORY
              </span>
              <span className="text-[10px] font-bold uppercase text-blue-600 tracking-widest block mt-0.5">
                Next-Gen ERP Systems
              </span>
            </div>
          </div>

          <button
            onClick={onOpenMenu}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('mo')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'mo'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            MO Orders
          </button>
          <button
            onClick={() => setActiveTab('wo')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'wo'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work Orders
          </button>
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'bom'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BOM Recipes
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'stock'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Ledger
          </button>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search MO, WO, Product..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={onOpenNewMO}
            className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors shadow-sm shadow-blue-500/20 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ New Order</span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white text-left transition-colors"
              title="View Profile"
            >
              <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'U'}
              </div>
              <div className="hidden xl:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {currentUser?.displayName || 'User'}
                </span>
                <span className="text-[10px] text-slate-500 font-bold block truncate max-w-[120px]">
                  {currentUser?.role || 'User'}
                </span>
              </div>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors border border-slate-200"
                title="Sign Out / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
