import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaEdit,
  FaHistory,
  FaIdBadge,
  FaUser,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import PositionNumberService from '../../services/positionNumberService';
import PositionNumberBadge from "../../components/common/PositionNumberBadge";
import UpdatePositionNumberModal from "../../components/admin/UpdatePositionNumberModal";
import PositionNumberHistoryModal from "../../components/admin/PositionNumberHistoryModal";

const PositionNumberManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users with position numbers
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await PositionNumberService.getUsersWithPositionNumbers({
        search: searchTerm
      });

      console.log('API Response:', response); // Debug
      console.log('Users data:', response.data); // Debug

      const allUsers = response.data || [];
      setUsers(allUsers);
      setPagination(prev => ({
        ...prev,
        totalItems: allUsers.length,
        totalPages: Math.ceil(allUsers.length / prev.limit)
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      // แสดง error message
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchUsers();
  };

  // Handle search on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Sort functionality
  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Page change handler
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Modal handlers
  const handleUpdatePositionNumber = (user) => {
    console.log('Selected user for update:', user); // Debug
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  const handleViewHistory = (user) => {
    console.log('Selected user for history:', user); // Debug
    setSelectedUser(user);
    setShowHistoryModal(true);
  };

  const handlePositionNumberUpdated = () => {
    setShowUpdateModal(false);
    fetchUsers(); // Refresh data
  };

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'positionNumber') {
      aValue = a.positionNumbers?.[0]?.positionNumber || '';
      bValue = b.positionNumbers?.[0]?.positionNumber || '';
    } else if (sortField === 'department') {
      aValue = a.department?.name || '';
      bValue = b.department?.name || '';
    } else if (sortField === 'effectiveFrom') {
      aValue = a.positionNumbers?.[0]?.effectiveFrom || '';
      bValue = b.positionNumbers?.[0]?.effectiveFrom || '';
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Client-side pagination
  const startIndex = (pagination.currentPage - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการเลขที่ตำแหน่ง
              </h1>
              <p className="text-sm text-slate-600">
                จัดการเลขที่ตำแหน่งของบุคลากรในระบบ
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อ, นามสกุล, อีเมล, หรือเลขที่ตำแหน่ง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full md:w-64 rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaSearch />
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="min-h-[600px]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-2">
                        ID
                        {getSortIcon('id')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center gap-2">
                        <FaUser />
                        ชื่อ-นามสกุล
                        {getSortIcon('firstName')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        อีเมล
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center gap-2">
                        แผนก
                        {getSortIcon('department')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('positionNumber')}
                    >
                      <div className="flex items-center gap-2">
                        <FaIdBadge />
                        เลขที่ตำแหน่ง
                        {getSortIcon('positionNumber')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('effectiveFrom')}
                    >
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt />
                        วันที่ได้รับ
                        {getSortIcon('effectiveFrom')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2">กำลังโหลด...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูลผู้ใช้'}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {paginatedUsers.map((user, idx) => {
                        const currentPosition = user.positionNumbers?.[0];
                        return (
                          <tr key={user.id} className={`border-t border-slate-100 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                          } hover:bg-sky-50`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                              #{user.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.fullName || '-'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.department?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {currentPosition ? (
                                <PositionNumberBadge
                                  positionNumber={currentPosition.positionNumber}
                                  effectiveFrom={currentPosition.effectiveFrom}
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {currentPosition?.effectiveFrom ? (
                                new Date(currentPosition.effectiveFrom).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleUpdatePositionNumber(user)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="แก้ไขเลขที่ตำแหน่ง"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleViewHistory(user)}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  title="ดูประวัติ"
                                >
                                  <FaHistory />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Fill empty rows to maintain consistent table height */}
                      {Array.from({ length: Math.max(0, pagination.limit - paginatedUsers.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className={paginatedUsers.length % 2 === 0 ? "bg-slate-50/70" : "bg-white"}>
                          <td colSpan="7" className="px-6 py-4 text-center text-slate-300">
                            <div className="h-6"></div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && sortedUsers.length > 0 && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
            {/* Mobile Pagination */}
            <div className="flex flex-col sm:hidden gap-3">
              <div className="text-center text-sm text-slate-700">
                แสดง <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> ถึง{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
                </span>{' '}
                จาก <span className="font-medium">{pagination.totalItems}</span> รายการ
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="text-sm text-slate-700">
                แสดง <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> ถึง{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
                </span>{' '}
                จาก <span className="font-medium">{pagination.totalItems}</span> รายการ
              </div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ก่อนหน้า
                </button>
                {(() => {
                  const pages = [];
                  if (pagination.totalPages <= 7) {
                    for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (pagination.currentPage <= 4) {
                      pages.push(2, 3, 4, 5, '...', pagination.totalPages);
                    } else if (pagination.currentPage >= pagination.totalPages - 3) {
                      pages.push('...', pagination.totalPages - 4, pagination.totalPages - 3, pagination.totalPages - 2, pagination.totalPages - 1, pagination.totalPages);
                    } else {
                      pages.push('...', pagination.currentPage - 1, pagination.currentPage, pagination.currentPage + 1, '...', pagination.totalPages);
                    }
                  }
                  return pages.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.currentPage === page ? 'z-10 bg-sky-50 border-sky-500 text-sky-600' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ถัดไป
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpdateModal && selectedUser && (
        <UpdatePositionNumberModal
          user={selectedUser}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handlePositionNumberUpdated}
        />
      )}

      {showHistoryModal && selectedUser && (
        <PositionNumberHistoryModal
          user={selectedUser}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

export default PositionNumberManagement;
