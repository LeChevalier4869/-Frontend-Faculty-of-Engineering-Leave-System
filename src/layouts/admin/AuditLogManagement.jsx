import { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaFileAlt, FaEye, FaDownload, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API } from '../../utils/api';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [users, setUsers] = useState([]);

  // Action translations
  const actionTranslations = {
    'CREATE': 'สร้าง',
    'UPDATE': 'อัพเดท',
    'DELETE': 'ลบ',
    'APPROVE': 'อนุมัติ',
    'REJECT': 'ปฏิเสธ',
    'IMPORT': 'นำเข้าข้อมูล',
    'SELF_APPROVE': 'ดำเนินการคำขอตนเอง',
    // Role / approver authority
    'ROLE_GRANT': 'ให้บทบาท',
    'ROLE_REVOKE': 'ถอนบทบาท',
    'ASSIGN_HEAD': 'แต่งตั้งหัวหน้าสาขา',
    'APPROVER_ASSIGN': 'แต่งตั้งผู้อนุมัติ',
    'APPROVER_VACATE': 'ปลดผู้อนุมัติ',
    // Leave Request Actions
    'ADMIN_CANCEL_LEAVE_REQUEST': 'แอดมินยกเลิกคำขอลา',
    'LEAVE_REQUEST_REJECTED': 'ปฏิเสธคำขอลา',
    'LEAVE_BALANCE_MANUAL_RESET': 'รีเซ็ตวันลา',
    // Status Actions
    'ACTIVE': 'ใช้งาน',
    'CANCELLED': 'ยกเลิก',
    'EXPIRED': 'หมดอายุ',
    // Session (excluded from logging, kept for old rows)
    'LOGIN': 'เข้าสู่ระบบ',
    'LOGOUT': 'ออกจากระบบ',
    // Legacy free-text (คงไว้ให้ log เก่าอ่านออก)
    'Create Request': 'สร้างคำขอ',
    'Create Proxy Approval': 'สร้างการมอบอำนาจ',
    'Create Daily Proxy Approval': 'สร้างการมอบอำนาจรายวัน',
  };

  // สี + ไอคอน ต่อการกระทำ ใช้ทั้งตารางและ modal ให้สอดคล้องกัน
  const getActionStyle = (action) => {
    const base = { create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      update: 'bg-amber-50 text-amber-700 border-amber-200',
      delete: 'bg-rose-50 text-rose-700 border-rose-200',
      approve: 'bg-sky-50 text-sky-700 border-sky-200',
      reject: 'bg-rose-50 text-rose-700 border-rose-200',
      grant: 'bg-violet-50 text-violet-700 border-violet-200',
      neutral: 'bg-slate-100 text-slate-600 border-slate-200' };
    const a = String(action || '');
    if (a === 'CREATE' || a === 'IMPORT' || a.startsWith('Create')) return base.create;
    if (a === 'UPDATE') return base.update;
    if (a === 'DELETE' || a === 'ROLE_REVOKE' || a === 'APPROVER_VACATE' || a.includes('CANCEL') || a === 'LEAVE_REQUEST_REJECTED') return base.delete;
    if (a === 'APPROVE' || a === 'SELF_APPROVE') return base.approve;
    if (a === 'REJECT') return base.reject;
    if (a === 'ROLE_GRANT' || a === 'ASSIGN_HEAD' || a === 'APPROVER_ASSIGN') return base.grant;
    return base.neutral;
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
    'ApproverPosition': 'ตำแหน่งผู้อนุมัติ',
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

  const exportLogs = async () => {
    try {
      const options = { ...filters };
      const response = await AuditLogService.getAllAuditLogsAll(options);

      // escape ค่าแต่ละช่องให้ปลอดภัย (กัน comma / newline / เครื่องหมายคำพูด ทำคอลัมน์เพี้ยน)
      const esc = (v) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };

      // เก็บทั้งการกระทำภาษาไทย (คนอ่าน) และ code (เครื่องกรอง) + วันเวลาแบบ ISO
      const csvContent = [
        ['วันที่เวลา', 'ผู้ทำรายการ', 'อีเมล', 'การกระทำ', 'action_code', 'ประเภทข้อมูล', 'รหัสข้อมูล', 'รายละเอียด', 'ที่อยู่ IP'],
        ...response.data.map(log => [
          format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          `${log.user?.prefixName || ''}${log.user?.firstName || ''} ${log.user?.lastName || ''}`.trim() || '-',
          log.user?.email || '',
          actionTranslations[log.action] || log.action || '-',
          log.action || '',
          entityTypeTranslations[log.entityType] || log.entityType || '-',
          log.entityId || '',
          log.details || '',
          log.ipAddress || '',
        ]),
      ].map(row => row.map(esc).join(',')).join('\n');

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
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งออกข้อมูลได้',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // ย่อ user-agent ให้อ่านง่าย (เบราว์เซอร์ + ระบบปฏิบัติการ) แทนสตริงดิบยาว ๆ
  const summarizeUserAgent = (ua) => {
    const s = String(ua || '');
    const browser =
      /Edg\//.test(s) ? 'Edge' :
      /Chrome\//.test(s) ? 'Chrome' :
      /Firefox\//.test(s) ? 'Firefox' :
      /Safari\//.test(s) ? 'Safari' : 'เบราว์เซอร์อื่น';
    const os =
      /Windows/.test(s) ? 'Windows' :
      /Mac OS/.test(s) ? 'macOS' :
      /Android/.test(s) ? 'Android' :
      /iPhone|iPad/.test(s) ? 'iOS' :
      /Linux/.test(s) ? 'Linux' : '';
    return os ? `${browser} · ${os}` : browser;
  };

  // แสดงค่าที่อ่านง่าย (ไม่ dump object/JSON ดิบ)
  const formatValue = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'ใช่' : 'ไม่ใช่';
    if (typeof v === 'object') return Array.isArray(v) ? v.join(', ') : JSON.stringify(v);
    return String(v);
  };

  // แปลง entityData ที่บันทึกไว้เป็นตาราง "ก่อน → หลัง" หรือรายการค่า (แทน <pre> JSON)
  const renderEntitySnapshot = (log) => {
    if (!log?.entityData) return null;
    let data;
    try {
      data = typeof log.entityData === 'string' ? JSON.parse(log.entityData) : log.entityData;
    } catch {
      return null;
    }
    if (!data || typeof data !== 'object') return null;

    // กรณีมี before/after (การแก้ไข)
    if (data.oldData && data.newData) {
      const keys = [...new Set([...Object.keys(data.oldData), ...Object.keys(data.newData)])]
        .filter((k) => JSON.stringify(data.oldData[k]) !== JSON.stringify(data.newData[k]));
      if (keys.length === 0) return null;
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">การเปลี่ยนแปลง</label>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">ฟิลด์</th>
                  <th className="px-3 py-2 font-semibold">เดิม</th>
                  <th className="px-3 py-2 font-semibold">ใหม่</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-700">{k}</td>
                    <td className="px-3 py-2 text-rose-600 line-through decoration-rose-300">{formatValue(data.oldData[k])}</td>
                    <td className="px-3 py-2 text-emerald-700">{formatValue(data.newData[k])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // กรณี snapshot ธรรมดา (สร้าง/ลบ) — แสดงเป็นรายการ key -> value
    const entries = Object.entries(data).filter(
      ([k]) => !['diff', 'timestamp', 'approverLevel'].includes(k)
    );
    if (entries.length === 0) return null;
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          ข้อมูล{log.action === 'DELETE' ? 'ก่อนลบ' : 'ที่บันทึกไว้'}
        </label>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-white p-3 text-sm sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0 text-slate-500">{k}:</dt>
              <dd className="min-w-0 break-words text-slate-800">{formatValue(v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-brand-700">
              Admin View
            </span>
          </div>
          <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                บันทึกการทำงาน (Audit Log)
              </h1>
              <p className="text-sm text-slate-600">
                ตรวจสอบประวัติการทำงานทั้งหมดในระบบ
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
              <button
                onClick={exportLogs}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaDownload /> ส่งออกข้อมูล
              </button>
            </div>
          </div>
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
                className="w-full text-sm px-3 py-1.5 pl-8 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
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
            className="text-sm px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 min-w-[120px]"
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
            className="text-sm px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 min-w-[120px]"
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
                className="text-sm pl-3 pr-8 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 w-[130px] bg-white"
                placeholderText="dd/mm/yyyy"
                locale={th}
                dateFormat="dd/MM/yyyy"
                wrapperClassName="w-auto"
                calendarClassName="!rounded-xl !border-2 !border-brand-300 p-2"
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
                className="text-sm pl-3 pr-8 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 w-[130px] bg-white"
                placeholderText="dd/mm/yyyy"
                locale={th}
                dateFormat="dd/MM/yyyy"
                wrapperClassName="w-auto"
                calendarClassName="!rounded-xl !border-2 !border-brand-300 p-2"
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">
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
        <div className="hidden lg:block">
          <div className="overflow-x-auto max-w-full">
            <div className="min-h-[600px]">
              <table className="w-full max-w-full divide-y divide-slate-200 rounded-t-xl table-fixed">
                <thead className="bg-slate-50 sticky top-0 z-10">
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
                          <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-brand-600"></div>
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
                    <>
                      {auditLogs.map((log, idx) => (
                        <tr key={log.id} className={`border-t border-slate-100 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        } hover:bg-brand-50`}>
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
                            <span className={`inline-block px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs rounded-full border truncate max-w-full ${getActionStyle(log.action)}`}>
                              {actionTranslations[log.action] || log.action}
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
                            <button
                              onClick={() => viewLogDetail(log)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                              title="ดูรายละเอียด"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="hidden lg:inline">รายละเอียด</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Fill empty rows to maintain consistent table height */}
                      {Array.from({ length: Math.max(0, pagination.limit - auditLogs.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className={auditLogs.length % 2 === 0 ? "bg-slate-50/70" : "bg-white"}>
                          <td colSpan="8" className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 text-center text-slate-300">
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

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="min-h-[600px]">
            {loading ? (
              <div className="px-4 py-20 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
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
              <>
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
                        <div className="ml-2 flex-shrink-0">
                          <button
                            onClick={() => viewLogDetail(log)}
                            className="rounded-lg p-2 text-brand-600 transition-colors hover:text-brand-900 active:bg-brand-50"
                            title="ดูรายละเอียด"
                          >
                            <FaEye className="text-sm" />
                          </button>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="space-y-2 text-sm">
                        {log.entityType && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">ประเภท:</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800">
                              {entityTypeTranslations[log.entityType] || log.entityType}
                            </span>
                          </div>
                        )}
                        {log.entityId && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Entity ID:</span>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-mono">
                              #{log.entityId}
                            </span>
                          </div>
                        )}
                        {log.details && (
                          <div className="flex items-start gap-2">
                            <span className="text-slate-500">รายละเอียด:</span>
                            <span className="text-slate-900 text-xs flex-1 truncate">{log.details}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">วันที่:</span>
                          <span className="text-slate-900 text-xs font-mono">
                            {format(new Date(log.createdAt), 'dd/MM HH:mm', { locale: th })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Fill empty space to maintain consistent height */}
                {Array.from({ length: Math.max(0, pagination.limit - auditLogs.length) }).map((_, idx) => (
                  <div key={`empty-mobile-${idx}`} className="p-3 sm:p-4 border-t border-slate-100">
                    <div className="h-20"></div>
                  </div>
                ))}
              </>
            )}
          </div>
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
                            ? 'z-10 bg-brand-50 border-brand-500 text-brand-600'
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
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage <= 4) {
                        pages.push(2, 3, 4, 5, '...', totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
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
                            currentPage === page ? 'z-10 bg-brand-50 border-brand-500 text-brand-600' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setShowDetailModal(false)}
        >
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
              {/* ใคร ทำอะไร เมื่อไหร่ */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getActionStyle(selectedLog.action)}`}>
                    {actionTranslations[selectedLog.action] || selectedLog.action}
                  </span>
                  {selectedLog.entityType && (
                    <span className="text-sm text-slate-600">
                      {entityTypeTranslations[selectedLog.entityType] || selectedLog.entityType}
                      {selectedLog.entityId ? ` #${selectedLog.entityId}` : ''}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-800">
                  <span className="font-medium">
                    {`${selectedLog.user?.prefixName || ''}${selectedLog.user?.firstName || ''} ${selectedLog.user?.lastName || ''}`.trim() || 'ระบบ'}
                  </span>
                  {selectedLog.user?.email && (
                    <span className="text-slate-500"> · {selectedLog.user.email}</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {format(new Date(selectedLog.createdAt), 'dd MMM yyyy, HH:mm:ss น.', { locale: th })}
                </p>
              </div>

              {/* รายละเอียด */}
              {selectedLog.details && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">รายละเอียด</label>
                  <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800">
                    {selectedLog.details}
                  </p>
                </div>
              )}

              {/* ก่อน -> หลัง / ข้อมูลที่บันทึกไว้ */}
              {renderEntitySnapshot(selectedLog)}

              {/* ข้อมูลทางเทคนิค (ย่อ) */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                <span>รหัสบันทึก #{selectedLog.id}</span>
                {selectedLog.ipAddress && <span>IP: {selectedLog.ipAddress}</span>}
                {selectedLog.userAgent && <span title={selectedLog.userAgent}>{summarizeUserAgent(selectedLog.userAgent)}</span>}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full rounded-xl bg-slate-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-600 sm:w-auto"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AuditLogManagement;
