import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaFileAlt, FaEye, FaDownload, FaTimes, FaSync } from 'react-icons/fa';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API, apiEndpoints } from '../../utils/api';
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
    endDate: null,
    entityType: '',
    entityId: '',
    ipAddress: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]); // เพิ่ม state สำหรับเก็บข้อมูลผู้ใช้
  const [entityData, setEntityData] = useState(null);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [entityLoading, setEntityLoading] = useState(false);

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

  // Entity type translations
  const entityTypeTranslations = {
    'LeaveRequest': 'คำขอลา',
    'User': 'ผู้ใช้',
    'UserAction': 'การกระทำผู้ใช้',
    'Department': 'แผนก',
    'Organization': 'องค์กร',
    'Holiday': 'วันหยุด',
    'LeaveType': 'ประเภทการลา',
    'Rank': 'ตำแหน่ง',
    'PersonnelType': 'ประเภทบุคคล',
    'ProxyApproval': 'การมอบอำนาจ',
    'AuditLog': 'บันทึกการทำงาน',
    'Setting': 'การตั้งค่า'
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
      endDate: null,
      entityType: '',
      entityId: '',
      ipAddress: ''
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

  const viewEntityData = async (log) => {
    if (!log.entityId || !log.entityType) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถดูข้อมูลได้',
        text: 'ไม่มีข้อมูล entity ที่สามารถดูได้',
        confirmButtonText: 'ตกลง'
      });
      return;
    }

    setEntityLoading(true);
    try {
      const response = await API.get(`${apiEndpoints.auditLogsEntity.replace(':entityType', log.entityType).replace(':entityId', log.entityId)}`);
      setEntityData(response.data);
      setShowEntityModal(true);
    } catch (error) {
      console.error('Failed to fetch entity data:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูล entity ได้',
        confirmButtonText: 'ตกลง'
      });
    } finally {
      setEntityLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const options = { ...filters };
      const response = await AuditLogService.getAllAuditLogsAll(options);

      // สร้าง CSV content
      const csvContent = [
        ['ID', 'User ID', 'User Name', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'User Agent', 'Details', 'Leave Request ID', 'Created At'],
        ...response.data.map(log => [
          log.id,
          log.userId,
          `${log.user?.prefixName || ''} ${log.user?.firstName || ''} ${log.user?.lastName || ''}`,
          log.action,
          log.entityType || '',
          log.entityId || '',
          log.ipAddress || '',
          log.userAgent || '',
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium">ทั้งหมด</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.totalLogs || 0}</p>
                <p className="text-slate-500 text-xs mt-1">บันทึกการทำงาน</p>
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-full">
                <FaFileAlt className="text-blue-600 text-lg sm:text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium">ผู้ใช้ที่ทำงาน</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.uniqueUsers || 0}</p>
                <p className="text-slate-500 text-xs mt-1">คนในระบบ</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-full">
                <FaUser className="text-green-600 text-lg sm:text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium">วันนี้</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.todayLogs || 0}</p>
                <p className="text-slate-500 text-xs mt-1">บันทึกวันนี้</p>
              </div>
              <div className="bg-purple-50 p-2 sm:p-3 rounded-full">
                <FaCalendarAlt className="text-purple-600 text-lg sm:text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium">การกระทำล่าสุด</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.recentActions || 0}</p>
                <p className="text-slate-500 text-xs mt-1">ชั่วโมงล่าสุด</p>
              </div>
              <div className="bg-orange-50 p-2 sm:p-3 rounded-full">
                <FaFileAlt className="text-orange-600 text-lg sm:text-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-5 mb-6">
        <div className="flex flex-col gap-3 mb-4">
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

        <div className="flex flex-col gap-4">
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
                className="bg-white text-slate-800 text-sm px-3 py-2 pl-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 w-full"
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

          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Entity Type Filter */}
            <div className="relative">
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="w-full bg-white text-slate-800 text-sm px-3 py-2 pr-8 rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-400/70"
              >
                <option value="">ประเภททั้งหมด</option>
                {Object.entries(entityTypeTranslations).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Entity ID Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Entity ID"
                value={filters.entityId}
                onChange={(e) => handleFilterChange('entityId', e.target.value)}
                className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 w-full"
              />
            </div>

            {/* IP Address Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="IP Address"
                value={filters.ipAddress}
                onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 w-full"
              />
            </div>
          </div>

          {/* Filter Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Action Filter */}
            <div className="relative">
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
                className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 appearance-none pr-10 w-full"
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
                className="bg-white text-slate-800 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/70 appearance-none pr-10 w-full"
                placeholderText="วันที่สิ้นสุด"
                locale={th}
                dateFormat="dd/MM/yyyy"
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-sm font-medium text-white shadow-sm hover:-translate-y-0.5 transition-all duration-150 w-full sm:w-auto"
          >
            ล้างตัวกรอง
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.userName || filters.action || filters.startDate || filters.endDate || filters.entityType || filters.entityId || filters.ipAddress) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">ตัวกรองที่ใช้งาน:</span>
              <div className="flex flex-wrap gap-2">
                {filters.userName && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
                    ผู้ใช้: {filters.userName}
                    <button
                      onClick={() => handleFilterChange('userName', '')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.entityType && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
                    ประเภท: {entityTypeTranslations[filters.entityType] || filters.entityType}
                    <button
                      onClick={() => handleFilterChange('entityType', '')}
                      className="ml-1 hover:text-purple-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.entityId && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
                    Entity ID: {filters.entityId}
                    <button
                      onClick={() => handleFilterChange('entityId', '')}
                      className="ml-1 hover:text-indigo-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.ipAddress && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
                    IP: {filters.ipAddress}
                    <button
                      onClick={() => handleFilterChange('ipAddress', '')}
                      className="ml-1 hover:text-orange-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.action && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
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
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
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
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
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
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block min-h-full">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full max-w-full divide-y divide-slate-200 rounded-t-xl table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[8%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ID</th>
                  <th className="w-[14%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ผู้ใช้</th>
                  <th className="w-[20%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">การกระทำ</th>
                  <th className="w-[14%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ประเภท</th>
                  <th className="w-[10%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">Entity ID</th>
                  <th className="w-[18%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">รายละเอียด</th>
                  <th className="w-[12%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">วันที่</th>
                  <th className="w-[14%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ข้อมูล</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-2 sm:px-3 lg:px-4 py-16 lg:py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-sky-600"></div>
                        <p className="mt-2 text-xs lg:text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
                      </div>
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-2 sm:px-3 lg:px-4 py-16 lg:py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <FaFileAlt className="text-3xl lg:text-4xl text-slate-300 mb-3" />
                        <p className="text-base lg:text-lg font-medium text-slate-600">ไม่พบข้อมูล Audit Log</p>
                        <p className="text-xs lg:text-sm text-slate-400 mt-1">ลองปรับเปลี่ยนตัวกรองเพื่อค้นหาข้อมูลที่ต้องการ</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 font-mono text-center">{log.id}</td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900">
                        <div className="min-w-0">
                          <div className="font-medium text-xs lg:text-sm truncate" title={`${log.user?.prefixName} ${log.user?.firstName} ${log.user?.lastName}`}>
                            {log.user?.prefixName} {log.user?.firstName} {log.user?.lastName}
                          </div>
                          <div className="text-slate-500 text-xs truncate">ID: {log.userId}</div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900">
                        <span className="inline-block px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs rounded-full bg-blue-100 text-blue-800 truncate max-w-full">
                          {actionTranslations[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900">
                        {log.entityType ? (
                          <span className="inline-block px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs rounded-full bg-purple-100 text-purple-800 truncate max-w-full">
                            {entityTypeTranslations[log.entityType] || log.entityType}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 text-center">
                        {log.entityId ? (
                          <span className="inline-block px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 font-mono">
                            #{log.entityId}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 text-center">
                        <div className="min-w-0">
                          <div className="truncate text-center" title={log.details}>
                            {log.details || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 font-mono text-center">
                        {format(new Date(log.createdAt), 'dd/MM HH:mm', { locale: th })}
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 text-center">
                        <div className="flex items-center justify-center gap-1 lg:gap-2">
                          <button
                            onClick={() => viewLogDetail(log)}
                            className="text-sky-600 hover:text-sky-900 p-1 hover:bg-sky-50 rounded transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {log.entityId && log.entityType && (
                            <button
                              onClick={() => viewEntityData(log)}
                              className="text-emerald-600 hover:text-emerald-900 p-1 hover:bg-emerald-50 rounded transition-colors"
                              title="ดูข้อมูล Entity"
                              disabled={entityLoading}
                            >
                              {entityLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-emerald-600"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {loading ? (
            <div className="px-4 py-20 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                <p className="mt-2 text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="px-4 py-20 text-center text-slate-500">
              <div className="flex flex-col items-center">
                <FaFileAlt className="text-4xl text-slate-300 mb-3" />
                <p className="text-lg font-medium text-slate-600">ไม่พบข้อมูล Audit Log</p>
                <p className="text-sm text-slate-400 mt-1">ลองปรับเปลี่ยนตัวกรองเพื่อค้นหาข้อมูลที่ต้องการ</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors active:bg-slate-100">
                  {/* Header with ID, Action, and Actions */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-900 truncate">#{log.id}</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
                          {actionTranslations[log.action] || log.action}
                        </span>
                      </div>
                      <div className="text-sm text-slate-900">
                        <div className="font-medium truncate">
                          {log.user?.prefixName} {log.user?.firstName} {log.user?.lastName}
                        </div>
                        <div className="text-slate-500 text-xs">ID: {log.userId}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => viewLogDetail(log)}
                        className="text-sky-600 hover:text-sky-900 p-2 active:bg-sky-50 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      {log.entityId && log.entityType && (
                        <button
                          onClick={() => viewEntityData(log)}
                          className="text-emerald-600 hover:text-emerald-900 p-2 active:bg-emerald-50 rounded-lg transition-colors"
                          title="ดูข้อมูล Entity"
                          disabled={entityLoading}
                        >
                          {entityLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                          ) : (
                            <FaFileAlt className="text-sm" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    {log.entityType && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 flex-shrink-0">ประเภท:</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 truncate min-w-0">
                          {entityTypeTranslations[log.entityType] || log.entityType}
                        </span>
                      </div>
                    )}
                    {log.entityId && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 flex-shrink-0">ID:</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 truncate min-w-0">
                          #{log.entityId}
                        </span>
                      </div>
                    )}
                    {log.ipAddress && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 flex-shrink-0">IP:</span>
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 truncate min-w-0">
                          {log.ipAddress}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 flex-shrink-0">วันที่:</span>
                      <span className="text-slate-900 truncate min-w-0">
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: th })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Details Section */}
                  {log.details && (
                    <div className="text-xs border-t border-slate-100 pt-2">
                      <div className="flex items-start gap-1">
                        <span className="text-slate-500 flex-shrink-0 mt-0.5">รายละเอียด:</span>
                        <p className="text-slate-900 line-clamp-2 flex-1 min-w-0">{log.details}</p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions Bar */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => viewLogDetail(log)}
                      className="text-xs px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors font-medium"
                    >
                      ดูรายละเอียด
                    </button>
                    {log.entityId && log.entityType && (
                      <button
                        onClick={() => viewEntityData(log)}
                        className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                        disabled={entityLoading}
                      >
                        {entityLoading ? 'กำลังโหลด...' : 'ดูข้อมูล'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && auditLogs.length > 0 && (
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
              <div className="flex justify-center">
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.currentPage;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-sky-50 border-sky-500 text-sky-600'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <span className="relative inline-flex items-center px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                      ...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Pagination */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-slate-200">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Entity Type</label>
                  <p className="mt-1 text-sm text-slate-900">
                    {selectedLog.entityType ? entityTypeTranslations[selectedLog.entityType] || selectedLog.entityType : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Entity ID</label>
                  <p className="mt-1 text-sm text-slate-900">
                    {selectedLog.entityId ? `#${selectedLog.entityId}` : '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">IP Address</label>
                  <div className="mt-1">
                    <p className="text-sm text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded">
                      {selectedLog.ipAddress || '-'}
                    </p>
                    {selectedLog.ipAddress && (
                      <p className="text-xs text-slate-500 mt-1">ที่อยู่ IP ที่ใช้ในการทำรายการ</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">User Agent</label>
                  <div className="mt-1">
                    <p className="text-sm text-slate-900 truncate bg-slate-50 px-2 py-1 rounded font-mono text-xs" title={selectedLog.userAgent}>
                      {selectedLog.userAgent || '-'}
                    </p>
                    {selectedLog.userAgent && (
                      <p className="text-xs text-slate-500 mt-1">ข้อมูลเบราว์เซอร์และอุปกรณ์</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional IP Information Section */}
              {selectedLog.ipAddress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ข้อมูล IP Address เพิ่มเติม
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-blue-700 font-medium">IP Address:</span>
                      <span className="text-blue-900 ml-1 font-mono">{selectedLog.ipAddress}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">วันที่/เวลา:</span>
                      <span className="text-blue-900 ml-1">
                        {format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: th })}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-blue-700 font-medium">สถานะ:</span>
                      <span className="text-blue-900 ml-1">
                        {selectedLog.ipAddress ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            มีข้อมูล IP Address ที่บันทึกไว้
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            ไม่มีข้อมูล IP Address
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors w-full sm:w-auto"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entity Data Modal */}
      {showEntityModal && entityData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-3xl w-full mx-4 max-h-screen overflow-y-auto border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">ข้อมูล Entity</h3>
                <p className="text-sm text-slate-500">
                  {entityData.isDeleted ? (
                    <span className="text-red-600 font-medium">● ถูกลบไปแล้ว (แสดงข้อมูลจาก Audit Log)</span>
                  ) : (
                    <span className="text-green-600 font-medium">● ยังอยู่ในระบบ</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowEntityModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors self-start"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Entity Type Header */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaFileAlt className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {entityTypeTranslations[entityData.data?.entityType] || entityData.data?.entityType}
                    </h4>
                    <p className="text-sm text-slate-500">ID: {entityData.data?.entityId || 'ไม่ระบุ'}</p>
                  </div>
                </div>
              </div>

              {/* Entity Details */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h5 className="font-medium text-slate-900 mb-3">รายละเอียดข้อมูล:</h5>
                <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                    {JSON.stringify(entityData.data || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-sm text-slate-500 text-center">
                <p>ข้อมูลจาก Audit Log เมื่อ: {format(new Date(entityData.timestamp || new Date()), 'dd/MM/yyyy HH:mm:ss', { locale: th })}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(entityData.data || {}, null, 2));
                  Swal.fire({
                    icon: 'success',
                    title: 'คัดลอกแล้ว',
                    text: 'ข้อมูลถูกคัดลอกไปยัง clipboard',
                    timer: 1500,
                    showConfirmButton: false
                  });
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors w-full sm:w-auto order-2 sm:order-1"
              >
                คัดลอก JSON
              </button>
              <button
                onClick={() => setShowEntityModal(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors w-full sm:w-auto order-1 sm:order-2"
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
