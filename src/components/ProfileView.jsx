import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { User, ShieldCheck, Mail, Key, UserCheck, Factory, Award, LogOut, Download, FileSpreadsheet, Search, CheckCircle, Users } from 'lucide-react';

export const ProfileView = ({
  currentUser,
  onSwitchUser,
  usersList = [],
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportUsersExcel = () => {
    try {
      const exportData = usersList.map((usr) => ({
        'Worker ID': usr.workerId || usr.id || 'N/A',
        'Full Name': usr.displayName || 'Operator',
        'Email Address': usr.email || 'N/A',
        'Assigned Role': usr.role || 'Operator',
        'Account Status': 'Active',
        'Security Standard': 'SHA-256 / Bcrypt Protected',
        'Export Timestamp': new Date().toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Custom column widths
      worksheet['!cols'] = [
        { wch: 16 }, // Worker ID
        { wch: 24 }, // Full Name
        { wch: 32 }, // Email Address
        { wch: 25 }, // Assigned Role
        { wch: 16 }, // Account Status
        { wch: 28 }, // Security Standard
        { wch: 22 }, // Export Timestamp
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Directory');

      const fileName = `Manufactory_Users_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to export users to Excel:', err);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.workerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Master Menu</span>
            <span>/</span>
            <span className="text-blue-600">User Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Operator & User Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage system permissions, account status, and export operator records as Excel (.xlsx).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportUsersExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Users as Excel</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Successfully exported users directory as an Excel (.xlsx) file! Check your downloads.</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-200/60 px-2 py-0.5 rounded-full text-emerald-950">
            .xlsx Generated
          </span>
        </div>
      )}

      {/* Current Active User Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
          {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl font-black text-slate-900">{currentUser.displayName}</h2>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wider border border-blue-200">
              {currentUser.role}
            </span>
          </div>

          <div className="text-xs text-slate-500 space-y-1 mt-2 font-medium">
            <p className="flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.email}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Worker ID: {currentUser.workerId || currentUser.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* User Directory & Excel Export Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Registered Users Directory</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total {usersList.length} registered system operators and supervisors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users or roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-48 sm:w-64"
              />
            </div>

            <button
              onClick={handleExportUsersExcel}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Download Excel spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Worker ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-600">
                      {usr.workerId || usr.id}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center">
                        {usr.displayName ? usr.displayName.charAt(0) : 'U'}
                      </div>
                      <span>{usr.displayName}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{usr.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSwitchUser(usr)}
                        disabled={currentUser.id === usr.id}
                        className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                          currentUser.id === usr.id
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {currentUser.id === usr.id ? 'Current User' : 'Switch User'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    No matching users found for "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Switcher Cards Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>Quick Role Switcher</span>
        </h3>
        <p className="text-xs text-slate-500">
          Seamlessly toggle active sessions between Production Manager, Assembly Operator, and Inventory Specialist accounts:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {usersList.map((usr) => (
            <button
              key={usr.id}
              onClick={() => onSwitchUser(usr)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                currentUser.id === usr.id
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">{usr.displayName}</div>
              <div className="text-[11px] text-blue-600 font-bold mt-0.5">{usr.role}</div>
              <div className="text-[10px] text-slate-400 mt-2 font-medium">{usr.workerId}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
