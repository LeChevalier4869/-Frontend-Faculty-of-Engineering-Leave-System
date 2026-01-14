import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaFileAlt, FaEye, FaDownload, FaTimes, FaSync } from 'react-icons/fa';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API } from '../../utils/api';
import AuditLogService from '../../services/auditLogService';
import Swal from 'sweetalert2';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const AuditLogManagement = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 50
  });
  const [filters, setFilters] = useState({
    userName: '',
    action: '',
    startDate: null,
    endDate: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]); // เพิ่ม state สำหรับเก็บข้อมูลผู้ใช้

  // Action translations
  const actionTranslations = {
    'CREATE': 'สร้าง',
    'UPDATE': 'อัพเดท',
    'DELETE': 'ลบ',
    'LOGIN': 'เข้าสู่ระบบ',
    'LOGOUT': 'ออกจากระบบ',
    'APPROVE': 'อนุมัติ',
    'REJECT': 'ปฏิเสธ',
    'VIEW': 'ดูข้อมูล',
    'EXPORT': 'ส่งออกข้อมูล',
    'UPLOAD': 'อัพโหลดไฟล์',
    'DOWNLOAD': 'ดาวน์โหลดไฟล์'
  };

  // ดึงข้อมูลสถิติ
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await AuditLogService.getActionStats();
        setStats(statsData?.data || {});
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  // ดึงข้อมูลผู้ใช้สำหรับ filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/admin/users');
        setUsers(response.data.data || []);
        setFilteredUsers(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Close user suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserSuggestions && !event.target.closest('.user-search-container')) {
        setShowUserSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserSuggestions]);

  // ดึงข้อมูล Audit Logs
  useEffect(() => {
    fetchAuditLogs();
  }, [pagination.currentPage, filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const options = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await AuditLogService.getAllAuditLogs(options);
      setAuditLogs(response.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.totalItems || 0
      }));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchAuditLogs();
  };

  const clearFilters = () => {
    setFilters({
      userName: '',
      action: '',
      startDate: null,
      endDate: null
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    // Filter users based on search term
    if (value.trim()) {
      const filtered = users.filter(user => 
        `${user.prefixName} ${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserSuggestions(true);
    } else {
      setFilteredUsers([]);
      setShowUserSuggestions(false);
    }
    
    // Update filter
    handleFilterChange('userName', value);
  };

  const selectUser = (user) => {
    const fullName = `${user.prefixName} ${user.firstName} ${user.lastName}`;
    setSearchTerm(fullName);
    handleFilterChange('userName', fullName);
    setShowUserSuggestions(false);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const viewLogDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const exportLogs = async () => {
    try {
      const options = { ...filters };
      const response = await AuditLogService.getAllAuditLogsAll(options);
      
      // สร้าง CSV content
      const csvContent = [
        ['ID', 'User ID', 'User Name', 'Action', 'Details', 'Leave Request ID', 'Created At'],
        ...response.data.map(log => [
          log.id,
          log.userId,
          `${log.user?.prefixName || ''} ${log.user?.firstName || ''} ${log.user?.lastName || ''}`,
          log.action,
          log.details || '',
          log.leaveRequestId || '',
          format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')
        ])
      ].map(row => row.join(',')).join('\n');

      // ดาวน์โหลดไฟล์
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งออกข้อมูลได้',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Admin Action
          </span>
          <h1 className="text-2xl font-bold text-white">บันทึกการทำงาน (Audit Log)</h1>
          <p className="text-sm text-slate-200">ตรวจสอบประวัติการทำงานทั้งหมดในระบบ</p>
        </div>
        <button
          onClick={exportLogs}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors"
        >
          <FaDownload /> ส่งออกข้อมูล
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">ทั้งหมด</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalLogs || 0}</p>
                <p className="text-slate-500 text-xs mt-1">บันทึกการทำงาน</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <FaFileAlt className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">ผู้ใช้ที่ทำงาน</p>
                <p className="text-3xl font-bold text-slate-900">{stats.uniqueUsers || 0}</p>
                <p className="text-slate-500 text-xs mt-1">คนในระบบ</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <FaUser className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">วันนี้</p>
                <p className="text-3xl font-bold text-slate-900">{stats.todayLogs || 0}</p>
                <p className="text-slate-500 text-xs mt-1">บันทึกวันนี้</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <FaCalendarAlt className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">การกระทำล่าสุด</p>
                <p className="text-3xl font-bold text-slate-900">{stats.recentActions || 0}</p>
                <p className="text-slate-500 text-xs mt-1">ชั่วโมงล่าสุด</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <FaFileAlt className="text-orange-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-600 uppercase tracking-[0.2em]">
                Filters
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              ค้นหาและกรองบันทึกการทำงาน
            </h3>
            <p className="mt-1 text-sm text-slate-500">เลือกช่วงวันที่ ผู้ใช้ และการกระทำเพื่อค้นหาบันทึกที่ต้องการ</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* ค้นหาผู้ใช้ */}
          <div className="relative user-search-container">
            <div className="relative">
              <input
                type="text"
                placeholder="พิมพ์ชื่อผู้ใช้..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  if (searchTerm.trim()) {
                    setShowUserSuggestions(true);
                  }
                }}
                className="bg-white text-slate-800 text-sm px-3 py-2 pl-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            {/* User Suggestions Dropdown */}
            {showUserSuggestions && filteredUsers.length > 0 && searchTerm.trim() && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm text-slate-900">
                      {user.prefixName} {user.firstName} {user.lastName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Filter */}
          <div className="relative w-48">
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full bg-white text-slate-800 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
            >
              <option value="">การกระทำทั้งหมด</option>
              {Object.entries(actionTranslations).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Start Date */}
          <div className="relative">
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 appearance-none pr-10 w-40"
              placeholderText="วันที่เริ่มต้น"
              locale={th}
              dateFormat="dd/MM/yyyy"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* End Date */}
          <div className="relative">
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 appearance-none pr-10 w-40"
              placeholderText="วันที่สิ้นสุด"
              locale={th}
              dateFormat="dd/MM/yyyy"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-sm font-medium text-white shadow-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            ล้างตัวกรอง
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.userName || filters.action || filters.startDate || filters.endDate) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-700">ตัวกรองที่ใช้งาน:</span>
              {filters.userName && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  ผู้ใช้: {filters.userName}
                  <button
                    onClick={() => handleFilterChange('userName', '')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {filters.action && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                  การกระทำ: {actionTranslations[filters.action] || filters.action}
                  <button
                    onClick={() => handleFilterChange('action', '')}
                    className="ml-1 hover:text-green-600"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {filters.startDate && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                  เริ่ม: {format(filters.startDate, 'dd/MM/yyyy')}
                  <button
                    onClick={() => handleFilterChange('startDate', null)}
                    className="ml-1 hover:text-purple-600"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {filters.endDate && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                  สิ้นสุด: {format(filters.endDate, 'dd/MM/yyyy')}
                  <button
                    onClick={() => handleFilterChange('endDate', null)}
                    className="ml-1 hover:text-orange-600"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="min-h-full">
          <table className="w-full divide-y divide-slate-200 rounded-t-xl">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ID</th>
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ผู้ใช้</th>
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">การกระทำ</th>
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">รายละเอียด</th>
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">Leave Request</th>
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">วันที่</th>
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                      <p className="mt-2 text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <FaFileAlt className="text-4xl text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-600">ไม่พบข้อมูล Audit Log</p>
                      <p className="text-sm text-slate-400 mt-1">ลองปรับเปลี่ยนตัวกรองเพื่อค้นหาข้อมูลที่ต้องการ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{log.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div>
                        <div className="font-medium">
                          {log.user?.prefixName} {log.user?.firstName} {log.user?.lastName}
                        </div>
                        <div className="text-slate-500">ID: {log.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {actionTranslations[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="max-w-xs truncate" title={log.details}>
                        {log.details || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {log.leaveRequestId ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          #{log.leaveRequestId}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <button
                        onClick={() => viewLogDetail(log)}
                        className="text-sky-600 hover:text-sky-900"
                        title="ดูรายละเอียด"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && auditLogs.length > 0 && (
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-200">
            <div className="flex-1 flex justify-between sm:hidden">
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
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  แสดง <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> ถึง{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
                  </span>{' '}
                  จาก <span className="font-medium">{pagination.totalItems}</span> รายการ
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.currentPage;
                    const isNearCurrentPage = Math.abs(page - pagination.currentPage) <= 2 || page === 1 || page === pagination.totalPages;
                    
                    if (!isNearCurrentPage && page !== 1 && page !== pagination.totalPages) {
                      return null;
                    }
                    
                    if (page === 1 && pagination.currentPage > 4) {
                      return (
                        <span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                          ...
                        </span>
                      );
                    }
                    
                    if (page === pagination.totalPages && pagination.currentPage < pagination.totalPages - 3) {
                      return (
                        <span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-sky-50 border-sky-500 text-sky-600'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">รายละเอียด Audit Log</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Log ID</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">User ID</label>
                  <p className="mt-1 text-sm text-slate-900">{selectedLog.userId}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">ผู้ใช้</label>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedLog.user?.prefixName} {selectedLog.user?.firstName} {selectedLog.user?.lastName}
                </p>
                <p className="text-xs text-slate-500">{selectedLog.user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">การกระทำ</label>
                <p className="mt-1 text-sm text-slate-900">
                  {actionTranslations[selectedLog.action] || selectedLog.action}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">รายละเอียด</label>
                <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                  {selectedLog.details || '-'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Leave Request ID</label>
                  <p className="mt-1 text-sm text-slate-900">
                    {selectedLog.leaveRequestId ? `#${selectedLog.leaveRequestId}` : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">วันที่สร้าง</label>
                  <p className="mt-1 text-sm text-slate-900">
                    {format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: th })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogManagement;
