import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaFileAlt, FaEye, FaDownload, FaTimes, FaSync } from 'react-icons/fa';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API, apiEndpoints } from '../../utils/api';
import AuditLogService from '../../services/auditLogService';
import Swal from 'sweetalert2';

const AuditLogManagement = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
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
  const [users, setUsers] = useState([]);
  const [entityData, setEntityData] = useState(null);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [entityLoading, setEntityLoading] = useState(false);

  // Action translations
  const actionTranslations = {
    'CREATE': 'สร้าง',
    'UPDATE': 'อัพเดท',
    'DELETE': 'ลบ',
    'APPROVE': 'อนุมัติ',
    'REJECT': 'ปฏิเสธ',
    // Leave Request Actions
    'Create Request': 'สร้างคำขอ',
    'ADMIN_CANCEL_LEAVE_REQUEST': 'แอดมินยกเลิกคำขอลา',
    'AdminCreateLeave': 'แอดมินสร้างการลา',
    // Proxy Approval Actions
    'Create Proxy Approval': 'สร้างการมอบอำนาจ',
    'Create Daily Proxy Approval': 'สร้างการมอบอำนาจรายวัน',
    'Update Proxy Approval': 'อัปเดตการมอบอำนาจ',
    'Delete Proxy Approval': 'ลบการมอบอำนาจ',
    // Status Actions
    'ACTIVE': 'ใช้งาน',
    'CANCELLED': 'ยกเลิก',
    'EXPIRED': 'หมดอายุ',
    // Additional common actions
    'LOGIN': 'เข้าสู่ระบบ',
    'LOGOUT': 'ออกจากระบบ',
    'VIEW': 'ดูข้อมูล',
    'EDIT': 'แก้ไข',
    'CREATE_USER': 'สร้างผู้ใช้',
    'UPDATE_USER': 'อัปเดตผู้ใช้',
    'DELETE_USER': 'ลบผู้ใช้',
    'CREATE_DEPARTMENT': 'สร้างแผนก',
    'UPDATE_DEPARTMENT': 'อัปเดตแผนก',
    'DELETE_DEPARTMENT': 'ลบแผนก',
    'CREATE_ORGANIZATION': 'สร้างองค์กร',
    'UPDATE_ORGANIZATION': 'อัปเดตองค์กร',
    'DELETE_ORGANIZATION': 'ลบองค์กร',
    'CREATE_HOLIDAY': 'สร้างวันหยุด',
    'UPDATE_HOLIDAY': 'อัปเดตวันหยุด',
    'DELETE_HOLIDAY': 'ลบวันหยุด',
    'CREATE_LEAVE_TYPE': 'สร้างประเภทการลา',
    'UPDATE_LEAVE_TYPE': 'อัปเดตประเภทการลา',
    'DELETE_LEAVE_TYPE': 'ลบประเภทการลา',
    'CREATE_PERSONNEL_TYPE': 'สร้างประเภทบุคคล',
    'UPDATE_PERSONNEL_TYPE': 'อัปเดตประเภทบุคคล',
    'DELETE_PERSONNEL_TYPE': 'ลบประเภทบุคคล'
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
        totalPages: response.pagination?.pages || response.pagination?.totalPages || 1,
        totalItems: response.pagination?.total || response.pagination?.totalItems || 0
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
    if (log?.action === 'UPDATE' && log?.entityData) {
      try {
        const parsed = typeof log.entityData === 'string' ? JSON.parse(log.entityData) : log.entityData;
        const payload = {
          ...parsed,
          entityType: log.entityType,
          entityId: log.entityId,
          id: log.entityId,
        };

        setEntityData({
          data: payload,
          isDeleted: false,
          timestamp: log.createdAt,
        });
        setShowEntityModal(true);
        return;
      } catch (error) {
        console.error('Failed to parse audit log entityData:', error);
      }
    }

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

      // สร้าง CSV content พร้อมสนับสนุนภาษาไทย
      const csvContent = [
        ['ID', 'รหัสผู้ใช้', 'ชื่อผู้ใช้', 'การกระทำ', 'ประเภท', 'รหัสเอนทิตี', 'ที่อยู่ IP', 'รายละเอียด', 'รหัสคำขอลา', 'วันที่สร้าง'],
        ...response.data.map(log => {
          const translatedAction = actionTranslations[log.action] || log.action || '-';
          const translatedEntityType = entityTypeTranslations[log.entityType] || log.entityType || '-';
          
          return [
            log.id || '',
            log.userId || '',
            `${log.user?.prefixName || ''} ${log.user?.firstName || ''} ${log.user?.lastName || ''}`.trim() || '-',
            translatedAction,
            translatedEntityType,
            log.entityId || '',
            log.ipAddress || '',
            log.details || '',
            log.leaveRequestId || '',
            format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')
          ];
        })
      ].map(row => row.join(',')).join('\n');

      // เพิ่ม UTF-8 BOM เพื่อให้อ่านภาษาไทยใน Excel ได้ถูกต้อง
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // ดาวน์โหลดไฟล์
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `บันทึกการทำงาน_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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

      {/* Compact Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* User Search */}
          <div className="relative user-search-container flex-1 min-w-[180px] max-w-[250px]">
            <input
              type="text"
              placeholder="ชื่อผู้ใช้..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm.trim() && setShowUserSuggestions(true)}
              className="w-full text-sm px-3 py-1.5 pl-8 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <FaSearch className="absolute left-2.5 top-2 text-slate-400 text-xs" />
            {searchTerm && (
              <button onClick={() => handleSearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                <FaTimes className="text-xs" />
              </button>
            )}
            {showUserSuggestions && filteredUsers.length > 0 && searchTerm.trim() && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredUsers.slice(0, 10).map(user => (
                  <div key={user.id} onClick={() => selectUser(user)} className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-sm">
                    {user.prefixName} {user.firstName} {user.lastName}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Filter */}
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="text-sm px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400 min-w-[120px]"
          >
            <option value="">การกระทำ</option>
            <option value="CREATE">สร้าง</option>
            <option value="UPDATE">อัพเดท</option>
            <option value="DELETE">ลบ</option>
            <option value="APPROVE">อนุมัติ</option>
            <option value="REJECT">ปฏิเสธ</option>
            <option value="LOGIN">เข้าสู่ระบบ</option>
            <option value="LOGOUT">ออกจากระบบ</option>
          </select>

          {/* Entity Type Filter */}
          <select
            value={filters.entityType}
            onChange={(e) => handleFilterChange('entityType', e.target.value)}
            className="text-sm px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400 min-w-[120px]"
          >
            <option value="">ประเภท</option>
            {Object.entries(entityTypeTranslations).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 font-medium">จาก</span>
            <div className="relative">
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                className="text-sm pl-3 pr-8 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 w-[130px] bg-white"
                placeholderText="dd/mm/yyyy"
                locale={th}
                dateFormat="dd/MM/yyyy"
                wrapperClassName="w-auto"
                calendarClassName="!rounded-xl !border-2 !border-sky-300 p-2"
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              <FaCalendarAlt className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
            <span className="text-sm text-slate-600 font-medium">ถึง</span>
            <div className="relative">
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                className="text-sm pl-3 pr-8 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 w-[130px] bg-white"
                placeholderText="dd/mm/yyyy"
                locale={th}
                dateFormat="dd/MM/yyyy"
                wrapperClassName="w-auto"
                calendarClassName="!rounded-xl !border-2 !border-sky-300 p-2"
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={filters.startDate}
              />
              <FaCalendarAlt className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
          </div>

          {/* Clear Button */}
          {(filters.userName || filters.action || filters.startDate || filters.endDate || filters.entityType) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors flex items-center gap-1"
            >
              <FaTimes className="text-xs" /> ล้าง
            </button>
          )}
        </div>

        {/* Active Filters Tags */}
        {(filters.userName || filters.action || filters.startDate || filters.endDate || filters.entityType) && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
            {filters.userName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                {filters.userName}
                <button onClick={() => { handleFilterChange('userName', ''); setSearchTerm(''); }}><FaTimes className="text-[10px]" /></button>
              </span>
            )}
            {filters.action && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                {actionTranslations[filters.action] || filters.action}
                <button onClick={() => handleFilterChange('action', '')}><FaTimes className="text-[10px]" /></button>
              </span>
            )}
            {filters.entityType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                {entityTypeTranslations[filters.entityType] || filters.entityType}
                <button onClick={() => handleFilterChange('entityType', '')}><FaTimes className="text-[10px]" /></button>
              </span>
            )}
            {filters.startDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 rounded text-xs">
                เริ่ม: {format(filters.startDate, 'dd/MM/yy')}
                <button onClick={() => handleFilterChange('startDate', null)}><FaTimes className="text-[10px]" /></button>
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                สิ้นสุด: {format(filters.endDate, 'dd/MM/yy')}
                <button onClick={() => handleFilterChange('endDate', null)}><FaTimes className="text-[10px]" /></button>
              </span>
            )}
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
                  <th className="w-[6%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ID</th>
                  <th className="w-[18%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ผู้ใช้</th>
                  <th className="w-[14%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">การกระทำ</th>
                  <th className="w-[12%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">ประเภท</th>
                  <th className="w-[10%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">Entity ID</th>
                  <th className="w-[26%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">รายละเอียด</th>
                  <th className="w-[10%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-left text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">วันที่</th>
                  <th className="w-[12%] px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-[10px] lg:text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">รายละเอียด/ข้อมูล</th>
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
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 font-mono text-left">{log.id}</td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 text-left">
                        <div className="min-w-0">
                          <div className="font-medium text-xs lg:text-sm truncate" title={`${log.user?.prefixName} ${log.user?.firstName} ${log.user?.lastName}`}>
                            {log.user?.prefixName} {log.user?.firstName} {log.user?.lastName}
                          </div>
                          <div className="text-slate-500 text-xs truncate">ID: {log.userId}</div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 text-left">
                        <span className="inline-block px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs rounded-full bg-blue-100 text-blue-800 truncate max-w-full">
                          {actionTranslations[log.action] || log.action}
                          {!actionTranslations[log.action] && (
                            <span className="ml-1 text-xs text-red-500">[?]</span>
                          )}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 text-left">
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
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 text-left">
                        <div className="min-w-0">
                          <div className="truncate" title={log.details}>
                            {log.details || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-slate-900 font-mono text-left">
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
                          {!actionTranslations[log.action] && (
                            <span className="ml-1 text-xs text-red-500">[?]</span>
                          )}
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
                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  {(() => {
                    const totalPages = pagination.totalPages;
                    const currentPage = pagination.currentPage;
                    const pages = [];
                    
                    if (totalPages <= 7) {
                      // Show all pages if 7 or less
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPage <= 4) {
                        // Near start: 1, 2, 3, 4, 5, ..., last
                        pages.push(2, 3, 4, 5);
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Near end: 1, ..., last-4, last-3, last-2, last-1, last
                        pages.push('...');
                        for (let i = totalPages - 4; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Middle: 1, ..., current-1, current, current+1, ..., last
                        pages.push('...');
                        pages.push(currentPage - 1, currentPage, currentPage + 1);
                        pages.push('...');
                        pages.push(totalPages);
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
                      
                      const isCurrentPage = page === currentPage;
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
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Log ID</label>
                  <p className="text-sm font-semibold text-slate-900">#{selectedLog.id}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">User ID</label>
                  <p className="text-sm font-semibold text-slate-900">#{selectedLog.userId}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <label className="block text-xs font-medium text-slate-600 mb-1">User</label>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedLog.user?.prefixName} {selectedLog.user?.firstName} {selectedLog.user?.lastName}
                </p>
                <p className="text-xs text-slate-500 mt-1">{selectedLog.user?.email}</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <label className="block text-xs font-medium text-slate-600 mb-1">Action</label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {actionTranslations[selectedLog.action] || selectedLog.action}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">({selectedLog.action})</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <label className="block text-xs font-medium text-slate-600 mb-1">Details</label>
                <p className="text-sm text-slate-900 whitespace-pre-wrap bg-slate-50 p-2 rounded border border-slate-200">
                  {selectedLog.details || '-'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Entity Type</label>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedLog.entityType ? entityTypeTranslations[selectedLog.entityType] || selectedLog.entityType : '-'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Entity ID</label>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedLog.entityId ? `#${selectedLog.entityId}` : '-'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Leave Request ID</label>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedLog.leaveRequestId ? `#${selectedLog.leaveRequestId}` : '-'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Created At</label>
                  <p className="text-sm font-semibold text-slate-900">
                    {format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: th })}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">IP Address</label>
                  <p className="text-sm font-mono text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {selectedLog.ipAddress || '-'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">User Agent</label>
                  <p className="text-xs text-slate-900 truncate bg-slate-50 px-2 py-1 rounded border border-slate-200" title={selectedLog.userAgent}>
                    {selectedLog.userAgent || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto font-medium"
              >
                Close
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
                    <p className="text-sm text-slate-500">ID: {entityData.data?.id || entityData.data?.entityId || 'ไม่ระบุ'}</p>
                  </div>
                </div>
              </div>

              {/* Entity Details */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h5 className="font-medium text-slate-900 mb-3">รายละเอียดข้อมูล (JSON):</h5>

                {entityData.data?.oldData && entityData.data?.newData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-sm font-medium text-red-700 mb-2">ก่อนแก้ (Old)</h6>
                      <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto border border-slate-200">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                          {JSON.stringify(entityData.data.oldData || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-green-700 mb-2">หลังแก้ (New)</h6>
                      <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto border border-slate-200">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                          {JSON.stringify(entityData.data.newData || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                    {JSON.stringify(entityData.data || {}, null, 2)}
                  </pre>
                </div>
                )}
                
                {/* Show Diff if available */}
                {entityData.data?.diff && entityData.data.diff.length > 0 && (
                  <div className="mt-4">
                    <h6 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      การเปลี่ยนแปลง (Changes)
                    </h6>
                    <div className="space-y-2">
                      {entityData.data.diff.map((change, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">{change.field}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              change.type === 'added' ? 'bg-green-100 text-green-700' :
                              change.type === 'removed' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {change.type === 'added' ? 'เพิ่ม' :
                               change.type === 'removed' ? 'ลบ' : 'เปลี่ยน'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {change.oldValue !== undefined && (
                              <div>
                                <span className="text-red-600 font-medium">เก่า:</span>
                                <div className="bg-red-50 p-2 rounded border border-red-200 mt-1 break-words">
                                  {typeof change.oldValue === 'object' 
                                    ? JSON.stringify(change.oldValue, null, 2)
                                    : String(change.oldValue) || '-'
                                  }
                                </div>
                              </div>
                            )}
                            {change.newValue !== undefined && (
                              <div>
                                <span className="text-green-600 font-medium">ใหม่:</span>
                                <div className="bg-green-50 p-2 rounded border border-green-200 mt-1 break-words">
                                  {typeof change.newValue === 'object' 
                                    ? JSON.stringify(change.newValue, null, 2)
                                    : String(change.newValue) || '-'
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
