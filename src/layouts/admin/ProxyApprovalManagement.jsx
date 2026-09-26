import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';
import { API, apiEndpoints } from '../../utils/api';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaUser, FaCheckCircle } from 'react-icons/fa';
import { X, ChevronDown, AlertTriangle } from 'lucide-react';
import Swal, { notifySuccess, notifyError } from '../../utils/alert';
import { useNavigate } from 'react-router-dom';
import PeoplePickerModal from '../../components/PeoplePickerModal';

const inputStyle = "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400";

// ระดับผู้อนุมัติ -> ชื่อ role (contiguous: level N = APPROVER_N)
// อ้างอิงด้วย "ชื่อ role" ไม่ใช่ Role.id (ปลอดภัยทั้ง prod และ fresh install)
const ROLE_NAME_BY_LEVEL = { 1: "APPROVER_1", 2: "APPROVER_2", 3: "APPROVER_3", 4: "APPROVER_4", 5: "APPROVER_5" };
const APPROVER_ROLE_NAMES = ["APPROVER_1", "APPROVER_2", "APPROVER_3", "APPROVER_4", "APPROVER_5"];

const ProxyApprovalManagement = () => {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'history'

  const [proxyApprovals, setProxyApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true); // เพิ่ม loading state สำหรับ user
  const [isSubmitting, setIsSubmitting] = useState(false); // สถานะกำลังบันทึกฟอร์ม
  const [showModal, setShowModal] = useState(false);
  const [editingProxy, setEditingProxy] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // สำหรับทุกคนในระบบ
  const [selectedOriginalUser, setSelectedOriginalUser] = useState(null);
  const [selectedProxyUser, setSeletedProxyUser] = useState(null);
  // ตัวเลือกคนแบบ modal ค้นหา-แล้วเลือก: 'original' | 'proxy' | null
  const [peoplePicker, setPeoplePicker] = useState(null);
  const [originalPrefixName, setOriginalPrefixName] = useState('');
  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [proxyPrefixName, setProxyPrefixName] = useState('');
  const [proxyFirstName, setProxyFirstName] = useState('');
  const [proxyLastName, setProxyLastName] = useState('');
  // ผู้ถือบทบาทของระดับที่เลือก (ใช้เป็นรายชื่อ "ผู้มอบอำนาจ" ให้เลือก — ทุกสาขา)
  const [originalApproverPool, setOriginalApproverPool] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [roleConflict, setRoleConflict] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [departments, setDepartments] = useState([]); // ใช้กรอง APPROVER_1 = หัวหน้าสาขา + สาขาของหัวหน้า

  // Pagination states - แยกตาม tab
  const [currentPageToday, setCurrentPageToday] = useState(1);
  const [totalPagesToday, setTotalPagesToday] = useState(1);
  const [totalCountToday, setTotalCountToday] = useState(0);

  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const [totalPagesHistory, setTotalPagesHistory] = useState(1);
  const [totalCountHistory, setTotalCountHistory] = useState(0);

  const itemsPerPage = 10;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    proxyApproverId: '',
    approverLevel: '',
    startDate: '',
    endDate: '',
    reason: '',
    isDaily: true,
    dailyDate: '',
  });

  const approverLevels = {
    1: 'APPROVER_1 (หัวหน้าสาขา)',
    2: 'APPROVER_2 (สารบรรณคณะ)',
    3: 'APPROVER_3 (หัวหน้าสำนักงานคณบดี)',
    4: 'APPROVER_4 (รองคณบดีฝ่ายบริหาร)',
    5: 'APPROVER_5 (คณบดี)',
  };

  useEffect(() => {
    // Reset pages to 1 when component mounts
    setCurrentPageToday(1);
    setCurrentPageHistory(1);
    fetchCurrentUser().then(() => {
      // โหลดข้อมูลอื่นๆ หลังจากได้ข้อมูลผู้ใช้แล้ว
      loadProxyApprovals(1);
      fetchUserLand();
      fetchDepartments();
    });
  }, []);

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  const fetchCurrentUser = async () => {
    try {
      setUserLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // Redirect ไปหน้า login ถ้าไม่มี token
        window.location.href = '/login';
        return;
      }

      const response = await API.get(apiEndpoints.getMe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // API ส่งข้อมูลมาใน response.data ไม่ใช่ response.data.data
      if (response.data) {
        setCurrentUser(response.data);
      } else {
        console.error('❌ No user data in response');
      }
    } catch (error) {
      console.error('❌ Error fetching current user:', error);
      console.error('❌ Error response:', error.response);

      // ถ้าเป็น 401/403 ให้ redirect ไป login
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('❌ Unauthorized - redirecting to login');
        localStorage.removeItem('accessToken'); // ลบ token เก่า
        window.location.href = '/login';
        return;
      }
    } finally {
      setUserLoading(false);
    }
  };

  // ผู้ที่ "มีสิทธิ์เป็นผู้มอบอำนาจ" ของระดับ = ผู้ถือบทบาทของระดับนั้น (ทุกสาขา)
  // คำนวณจากรายชื่อทั้งระบบ (allUsers) ตรง ๆ เพื่อไม่ให้ endpoint approvers-for-level
  // ตัดคนที่บังเอิญถือ proxy อยู่ (isProxy) ออกไป และเห็นหัวหน้าสาขาครบทุกสาขา
  const originalApproversForLevel = (level) => {
    const roleName = ROLE_NAME_BY_LEVEL[Number(level)];
    if (!roleName) return [];
    return allUsers.filter((u) => (u.roleNames || []).includes(roleName));
  };

  // เซ็ต id ของผู้ที่เป็นหัวหน้าสาขา (อย่างน้อย 1 สาขา) — ใช้กรอง APPROVER_1
  const deptHeadIds = useMemo(
    () => new Set(departments.map((d) => d.headId).filter(Boolean)),
    [departments],
  );

  // เมื่อเปลี่ยนระดับ: เตรียม pool ผู้มอบอำนาจ (ผู้ถือบทบาทของระดับนั้น) และตั้งค่าเริ่มต้น
  // ผู้ใช้เปลี่ยนคนเองได้ผ่าน modal ค้นหา (โดยเฉพาะ APPROVER_1 ที่มีหัวหน้าหลายสาขา)
  const autoMapOriginalApprover = (level) => {
    // APPROVER_1 (หัวหน้าสาขา): admin เลือกหัวหน้าสาขาเอง — ไม่ auto-select
    // และ pool จำกัดเฉพาะ "ผู้ที่เป็นหัวหน้าสาขาจริง" (ไม่ใช่ทุกคนที่ถือบทบาท APPROVER_1)
    if (Number(level) === 1) {
      const heads = allUsers.filter((u) => deptHeadIds.has(u.id));
      // fallback: ถ้า departments ยังโหลดไม่เสร็จ/ว่าง ให้ใช้ผู้ถือบทบาท APPROVER_1 ไปก่อน
      // (หัวหน้าสาขา ⟺ APPROVER_1 ถูก sync อยู่แล้ว) เพื่อให้ยังเลือกผู้มอบอำนาจได้เสมอ
      setOriginalApproverPool(heads.length ? heads : originalApproversForLevel(1));
      clearOriginalUser();
      return;
    }

    const pool = originalApproversForLevel(level);
    setOriginalApproverPool(pool);

    if (pool.length === 0) {
      clearOriginalUser();
      return;
    }
    const self = pool.find((u) => u.id === currentUser?.id);
    pickOriginalUser(self || pool[0]);
  };

  // เมื่อเปลี่ยน tab ให้โหลดข้อมูลใหม่
  useEffect(() => {
    // Reset page เป็น 1 เมื่อเปลี่ยน tab
    if (activeTab === 'today') {
      setCurrentPageToday(1);
    } else if (activeTab === 'history') {
      setCurrentPageHistory(1);
    }
    loadProxyApprovals();
  }, [activeTab]);

  // ฟังก์ชันสำหรับโหลดข้อมูลตาม tab
  const loadProxyApprovals = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      let url;

      // กำหนด endpoint ตาม tab
      if (activeTab === 'today') {
        // Tab วันนี้: ใช้ endpoint /today
        url = `${apiEndpoints.proxyApproval}/today`;
      } else if (activeTab === 'history') {
        // Tab ประวัติ: ใช้ endpoint /history
        url = `${apiEndpoints.proxyApproval}/history`;
      } else {
        // Fallback: ใช้ endpoint เดิม
        url = apiEndpoints.proxyApproval;
      }

      // กำหนด parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', itemsPerPage);

      const response = await API.get(`${url}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProxyApprovals(response.data.data || []);

      // อัปเดต state ตาม tab ที่ active
      if (activeTab === 'today') {
        setTotalPagesToday(response.data.pagination?.totalPages || 1);
        setTotalCountToday(response.data.pagination?.totalCount || response.data.pagination?.total || 0);
        setCurrentPageToday(page);
      } else if (activeTab === 'history') {
        setTotalPagesHistory(response.data.pagination?.totalPages || 1);
        setTotalCountHistory(response.data.pagination?.totalCount || response.data.pagination?.total || 0);
        setCurrentPageHistory(page);
      }
    } catch (error) {
      console.error('Error loading proxy approvals:', error);
      notifyError('ข้อผิดพลาด', 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLand = async () => {
    try {
      const res = await API.get(apiEndpoints.userLanding);

      let list = normalizeUsers(res?.data);

      // แยกผู้ใช้ที่ถือบทบาทผู้อนุมัติ (APPROVER_1..5)
      const originalApprovers = list.filter(user =>
        (user.roleNames || []).some(r => APPROVER_ROLE_NAMES.includes(r))
      );

      // สำหรับ proxy approvers ให้เลือกได้ทุกคน (รวม user ทั่วไปด้วย)
      const allUsers = normalizeUsers(res?.data);

      setAllUsers(allUsers); // เก็บผู้ใช้ทั้งหมดสำหรับ proxy selection

      // สร้าง role mapping สำหรับ original approvers (userId -> ชื่อ role อนุมัติ)
      const roles = {};
      originalApprovers.forEach(user => {
        const approverRole = (user.roleNames || []).find(r =>
          APPROVER_ROLE_NAMES.includes(r)
        );
        if (approverRole) roles[user.id] = approverRole;
      });
      setUserRoles(roles);

    } catch (err) {
      console.error("Error fetching user land:", err);
      setAllUsers([]);
    }
  };

  // โหลดรายชื่อแผนก (เพื่อรู้ว่าใครเป็นหัวหน้าสาขา + สาขาที่เขาดูแล) สำหรับกรอง APPROVER_1
  const fetchDepartments = async () => {
    try {
      const res = await API.get("/admin/departmentsList");
      setDepartments(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartments([]);
    }
  };

  const getProxyUserRole = (userId) => {
    // หา user จาก allUsers และ return role ถ้ามี
    const user = allUsers.find(u => u.id === userId);
    if (!user) return 'user';

    const names = user.roleNames || [];
    const approverRole = names.find(r => APPROVER_ROLE_NAMES.includes(r));
    if (approverRole) return approverRole;

    // ถ้าไม่มี approver role ให้แสดง ADMIN/USER ถ้ามี
    if (names.includes('ADMIN')) return 'ADMIN';
    if (names.includes('USER')) return 'USER';

    return 'user';
  };

  const getUserRole = (userId) => {
    // ใช้ userRoles ที่สร้างไว้ใน fetchUserLand (สำหรับ original approvers)
    return userRoles[userId] || 'user';
  };

  const getRoleForLevel = (level) => {
    const roleMap = {
      1: 'หัวหน้าสาขา',
      2: 'สารบรรณคณะ',
      3: 'หัวหน้าสำนักงานคณบดี',
      4: 'รองคณบดีฝ่ายบริหาร',
      5: 'คณบดี',
    };
    return roleMap[level] || '';
  };

  const checkRoleConflict = () => {
    if (!selectedProxyUser || !formData.approverLevel) {
      setRoleConflict(false);
      return;
    }

    const proxyRole = getProxyUserRole(selectedProxyUser.id);
    const expectedRole = getRoleForLevel(formData.approverLevel);

    // ตรวจสอบว่า proxy user มี role เดียวกับระดับที่เลือกหรือไม่
    const proxyHasSameRole = proxyRole === expectedRole;
    setRoleConflict(proxyHasSameRole);
  };

  useEffect(() => {
    checkRoleConflict();
  }, [selectedProxyUser, formData.approverLevel]);

  const normalizeUsers = (payload) => {
    const arr = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.user)
      ? payload.user
      : Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload)
      ? payload
      : [];


    return arr
      .map((u) => {
        const userRoles = u.userRoles ? u.userRoles.map(ur => ur.roleId) : [];
        const roleNames = u.userRoles
          ? u.userRoles.map(ur => ur.role?.name).filter(Boolean)
          : [];

        return {
          id: u.id ?? u.userId ?? null,
          prefixName: u.prefixName ?? u.prefix ?? "",
          ...(u.firstName || u.lastName
            ? { firstName: u.firstName ?? "", lastName: u.lastName ?? "" }
            : {}),
          email: u.email ?? "",
          // ดึง roles จาก UserRole relationship
          roles: userRoles,
          roleNames,
          position: u.position ?? "",
          department: u.department ?? null,
          personnelTypeId: u.personnelTypeId ?? u.personnelType?.id ?? null,
          personnelType: u.personnelType ?? null,
        };
      })
      .filter((u) => u.id != null);
  };

  const formatUserName = (u) => {
    if (!u) return "";
    return [u.prefixName, u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  };

  const dayHighlight = (date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return "!text-red-500";
    }
    return "";
  };

  const pickOriginalUser = (u) => {
    setOriginalPrefixName(u.prefixName || "");
    setOriginalFirstName(u.firstName || "");
    setOriginalLastName(u.lastName || "");
    setSelectedOriginalUser(u);

    // ล้างผู้อนุมัติแทนเมื่อ:
    // - ระดับหัวหน้าสาขา (ต้องเลือกใหม่ในแผนกเดียวกัน) หรือ
    // - ผู้มอบอำนาจที่เลือกใหม่ ตรงกับผู้อนุมัติแทนเดิม (ห้ามเป็นคนเดียวกัน)
    const clearProxy =
      Number(formData.approverLevel) === 1 || selectedProxyUser?.id === u.id;
    if (clearProxy) {
      setSeletedProxyUser(null);
      setProxyPrefixName("");
      setProxyFirstName("");
      setProxyLastName("");
    }

    // ใช้ functional update เพื่อป้องกัน stale state
    setFormData((prev) => ({
      ...prev,
      originalApproverId: u.id,
      ...(clearProxy ? { proxyApproverId: "" } : {}),
    }));
  };

  // รายชื่อผู้อนุมัติแทนใน popup: ระดับหัวหน้าสาขาให้เลือกเฉพาะคนในสาขาของผู้มอบอำนาจ
  const proxyPickerUsers = useMemo(() => {
    let base = allUsers;
    if (Number(formData.approverLevel) === 1 && selectedOriginalUser) {
      const dept =
        departments.find((d) => d.headId === selectedOriginalUser.id) ||
        departments.find((d) => d.id === selectedOriginalUser.department?.id) ||
        null;
      const deptId = dept?.id ?? selectedOriginalUser.department?.id ?? null;
      const deptName = dept?.name ?? selectedOriginalUser.department?.name ?? null;
      if (deptId || deptName) {
        base = allUsers.filter(
          (u) =>
            (deptId && u.department?.id === deptId) ||
            (deptName && u.department?.name === deptName),
        );
      }
    }
    // ผู้อนุมัติแทนต้องไม่ใช่คนเดียวกับผู้มอบอำนาจ
    const excludeId = selectedOriginalUser?.id;
    return excludeId ? base.filter((u) => u.id !== excludeId) : base;
  }, [formData.approverLevel, selectedOriginalUser, allUsers, departments]);

  const pickProxyUser = (u) => {
    setProxyPrefixName(u.prefixName || "");
    setProxyFirstName(u.firstName || "");
    setProxyLastName(u.lastName || "");
    setSeletedProxyUser(u);
    setFormData((prev) => ({ ...prev, proxyApproverId: u.id }));
  };

  const clearOriginalUser = () => {
    setOriginalPrefixName("");
    setOriginalFirstName("");
    setOriginalLastName("");
    setSelectedOriginalUser(null);
    // functional update: กันทับค่า approverLevel ที่เพิ่งตั้งใน onChange เดียวกัน (stale closure)
    setFormData((prev) => ({ ...prev, originalApproverId: "" }));
  };

  const handleEdit = (proxy) => {
    setEditingProxy(proxy);
    setFormData({
      originalApproverId: proxy.originalApproverId,
      proxyApproverId: proxy.proxyApproverId,
      approverLevel: proxy.approverLevel,
      startDate: proxy.startDate?.split('T')[0] || '',
      endDate: proxy.endDate?.split('T')[0] || '',
      reason: proxy.reason || '',
      isDaily: proxy.isDaily || false,
      dailyDate: proxy.dailyDate?.split('T')[0] || '',
    });

    // Set user data for editing
    if (proxy.originalApprover) {
      setOriginalPrefixName(proxy.originalApprover.prefixName || '');
      setOriginalFirstName(proxy.originalApprover.firstName || '');
      setOriginalLastName(proxy.originalApprover.lastName || '');
      setSelectedOriginalUser(proxy.originalApprover);
    }

    if (proxy.proxyApprover) {
      setProxyPrefixName(proxy.proxyApprover.prefixName || '');
      setProxyFirstName(proxy.proxyApprover.firstName || '');
      setProxyLastName(proxy.proxyApprover.lastName || '');
      setSeletedProxyUser(proxy.proxyApprover);
    }

    setShowModal(true);
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการยกเลิก',
      text: 'คุณต้องการยกเลิกการมอบอำนาจนี้ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const response = await API.patch(apiEndpoints.proxyApprovalCancel(id));

        // ตรวจสอบว่า backend สำเร็จจริงหรือไม่
        if (response.status === 200 || response.status === 201) {
          notifySuccess('สำเร็จ', 'ยกเลิกการมอบอำนาจสำเร็จ');
          loadProxyApprovals();
          // แจ้ง Sidebar ให้ดึงสิทธิ์ proxy ใหม่ทันที
          window.dispatchEvent(new Event("proxy-updated"));
        } else {
          throw new Error('การยกเลิกไม่สำเร็จ');
        }
      } catch (error) {
        console.error('Error canceling proxy approval:', error);

        // ตรวจสอบว่าเป็น error จาก validation หรือไม่
        let errorMessage = 'ไม่สามารถยกเลิกการมอบอำนาจได้';

        if (error.response) {
          // Backend response error
          if (error.response.status === 400) {
            // Validation error - นี่คือเคสที่ backend ทำงานถูกต้องแต่ frontend แสดง error
            errorMessage = error.response.data?.message || error.response.data?.error || 'ไม่สามารถยกเลิกการมอบอำนาจที่ไม่ได้ใช้งานอยู่';
          } else if (error.response.status === 404) {
            errorMessage = 'ไม่พบข้อมูลการมอบอำนาจ';
          } else if (error.response.status === 500) {
            errorMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';
          } else {
            errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบอินเทอร์เน็ต';
        }

        notifyError('ข้อผิดพลาด', errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      originalApproverId: '',
      proxyApproverId: '',
      approverLevel: '',
      startDate: '',
      endDate: '',
      reason: '',
      isDaily: true,
      dailyDate: '',
    });

    // Clear user data
    setOriginalPrefixName('');
    setOriginalFirstName('');
    setOriginalLastName('');
    setSelectedOriginalUser(null);
    setProxyPrefixName('');
    setProxyFirstName('');
    setProxyLastName('');
    setSeletedProxyUser(null);
    setPeoplePicker(null);
    setRoleConflict(false);
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่าเลือก original approver และ proxy approver ครบถ้วนหรือไม่
    if (!selectedOriginalUser) {
      console.log('🔍 Debug - No selected original user');
      notifyError("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกผู้มอบอำนาจ (Original Approver)");
      return;
    }

    if (!selectedProxyUser) {
      console.log('🔍 Debug - No selected proxy user');
      notifyError("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกผู้อนุมัติแทน");
      return;
    }

    // ตรวจสอบว่า original approver และ proxy approver เป็นคนเดียวกันหรือไม่
    if (selectedOriginalUser.id === selectedProxyUser.id) {
      console.log('🔍 Debug - Same user selected:', selectedOriginalUser.id, selectedProxyUser.id);
      notifyError(
        "ข้อมูลไม่ถูกต้อง",
        "ไม่สามารถมอบอำนาจให้ตนเองได้ กรุณาเลือกผู้อนุมัติแทนที่ต่างจากผู้มอบอำนาจ"
      );
      return;
    }


    // ตรวจสอบวันที่
    if (formData.isDaily) {
      if (!formData.dailyDate) {
        notifyError("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกวันที่สำหรับการมอบอำนาจรายวัน");
        return;
      }
    } else {
      if (!formData.startDate || !formData.endDate) {
        notifyError("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกวันเริ่มต้นและวันสิ้นสุด");
        return;
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        notifyError("ข้อมูลไม่ถูกต้อง", "วันเริ่มต้นต้องไม่เกินวันสิ้นสุด");
        return;
      }
    }

    // แสดง SweetAlert confirmation ก่อน submit
    const confirmResult = await Swal.fire({
      title: 'ยืนยันการสร้างการมอบอำนาจ',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>ผู้มอบอำนาจ:</strong> ${formatUserName(selectedOriginalUser)} (${getUserRole(selectedOriginalUser.id)})</p>
          <p><strong>ผู้อนุมัติแทน:</strong> ${formatUserName(selectedProxyUser)} (${getProxyUserRole(selectedProxyUser.id)})</p>
          <p><strong>ระดับผู้อนุมัติ:</strong> ${approverLevels[formData.approverLevel]}</p>
          <p><strong>ประเภทการมอบอำนาจ:</strong> ${formData.isDaily ? 'รายวัน' : 'ช่วงเวลา'}</p>
          ${formData.isDaily
            ? `<p><strong>วันที่:</strong> ${new Date(formData.dailyDate).toLocaleDateString('th-TH')}</p>`
            : `<p><strong>ช่วงวันที่:</strong> ${new Date(formData.startDate).toLocaleDateString('th-TH')} ถึง ${new Date(formData.endDate).toLocaleDateString('th-TH')}</p>`
          }
          ${formData.reason ? `<p><strong>เหตุผล:</strong> ${formData.reason}</p>` : ''}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยันการสร้าง",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#7A1B22",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    // ไม่ตรวจสอบ role conflict แต่แสดงข้อควรพิจารณาถ้ามี
    if (roleConflict) {
      const roleConfirmResult = await Swal.fire({
        icon: "warning",
        title: "ข้อควรพิจารณา",
        text: `ผู้อนุมัติแทน (${getProxyUserRole(selectedProxyUser.id)}) มี role เดียวกับระดับที่เลือก (${getRoleForLevel(formData.approverLevel)}) - จะได้รับอำนาจเพิ่มเติม ต้องการดำเนินการต่อหรือไม่?`,
        showCancelButton: true,
        confirmButtonText: "ดำเนินการต่อ",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#7A1B22",
        cancelButtonColor: "#64748b",
      });

      if (!roleConfirmResult.isConfirmed) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // ดึงข้อมูล original approvers สำหรับระดับที่เลือก
      const token = localStorage.getItem("accessToken");
      const approversResponse = await API.get(`/auth/approvers-for-level/${formData.approverLevel}?date=${new Date().toISOString().split('T')[0]}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // หา original approvers ที่ไม่ใช่ proxy (เฉพาะคนที่มี role จริง)
      const originalApprovers = approversResponse.data.data.filter(user =>
        !user.isProxy &&
        currentUser
        // ลบการ filter user.id !== currentUser.id เพราะ backend จัดการให้แล้ว
      );

      // ตรวจสอบว่า proxy approver มีอำนาจในระดับนี้อยู่แล้วหรือไม่ (ตรวจสอบวันที่ด้วย)
      const today = new Date().toISOString().split('T')[0];
      const existingProxyCheck = proxyApprovals.some(existingProxy =>
        existingProxy.proxyApproverId === selectedProxyUser.id &&
        existingProxy.approverLevel === formData.approverLevel &&
        existingProxy.status === 'ACTIVE' &&
        (
          // กรณีรายวัน: ตรวจว่าเป็นวันเดียวกัน
          (existingProxy.isDaily && existingProxy.dailyDate === today) ||
          // กรณีช่วงเวลา: ตรวจว่าวันปัจจุบันอยู่ในช่วงเวลา
          (!existingProxy.isDaily &&
           existingProxy.startDate <= today &&
           existingProxy.endDate >= today)
        )
      );

      if (existingProxyCheck) {
        notifyError(
          "ข้อมูลไม่ถูกต้อง",
          "ผู้อนุมัติแทนนี้มีอำนาจในระดับที่กำหนดอยู่แล้ว ไม่สามารถมอบอำนาจซ้ำได้"
        );
        return;
      }

      // ถ้าไม่มี original approvers ให้แสดง error
      if (originalApprovers.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "ไม่พบข้อมูลผู้อนุมัติต้นฉบับ",
          text: `ไม่พบผู้อนุมัติระดับ ${getRoleForLevel(formData.approverLevel)} ที่สามารถมอบอำนาจได้`,
        });
        return;
      }

      // สร้าง proxy approval เฉพาะคนที่ admin เลือก
      const payload = {
        originalApproverId: selectedOriginalUser.id, // original approver ที่ admin เลือก
        proxyApproverId: selectedProxyUser.id, // proxy approver ที่ admin เลือก
        approverLevel: formData.approverLevel,
        reason: formData.reason || '',
        isDaily: formData.isDaily,
        dailyDate: formData.isDaily ? formData.dailyDate : undefined,
        startDate: !formData.isDaily ? formData.startDate : undefined,
        endDate: !formData.isDaily ? formData.endDate : undefined,
      };


      let response;
      if (editingProxy) {
        // Update existing proxy approval
        response = await API.put(apiEndpoints.proxyApprovalById(editingProxy.id), payload);
      } else {
        // Create new proxy approval
        response = await API.post(apiEndpoints.proxyApproval, payload);
      }

      notifySuccess(
        "สำเร็จ",
        editingProxy ? "แก้ไขการมอบอำนาจสำเร็จแล้ว" : "สร้างการมอบอำนาจสำเร็จแล้ว"
      );

      loadProxyApprovals();
      setShowModal(false);
      resetForm();
      // แจ้ง Sidebar ให้ดึงสิทธิ์ proxy ใหม่ทันที (ไม่ต้องรอ refresh หน้า)
      window.dispatchEvent(new Event("proxy-updated"));
    } catch (err) {
      console.error("Error saving proxy approval:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);

      notifyError(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || err.message || "บันทึกข้อมูลไม่สำเร็จ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-kanit text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการการมอบอำนาจ
              </h1>
              <p className="text-sm text-slate-600">
                ตั้งค่าการมอบอำนาจสำหรับผู้อนุมัติในระบบ
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
              <button
                onClick={() => {
                  setShowModal(true);
                  setEditingProxy(null);
                  resetForm();
                }}
                className="px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus /> เพิ่มการมอบอำนาจ
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'today'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
            วันนี้
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ประวัติ
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-grow overflow-x-auto" style={{ minHeight: `${44 + (itemsPerPage * 65)}px` }}>
          <table className="min-w-full divide-y divide-slate-200 rounded-t-xl">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                ผู้อนุมัติต้นฉบับ
              </th>
              <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                ผู้อนุมัติแทน
              </th>
              <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                ระดับ
              </th>
              <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                วันที่
              </th>
              <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                สถานะ
              </th>
              {activeTab !== 'history' && (
                <th className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-700">
                  จัดการ
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {proxyApprovals.map((proxy, idx) => (
              <tr key={proxy.id} className={`border-t border-slate-100 transition-colors ${
                idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
              } hover:bg-brand-50`}>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate max-w-[150px]">
                        {proxy.originalApprover?.firstName} {proxy.originalApprover?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">{proxy.originalApprover?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate max-w-[150px]">
                        {proxy.proxyApprover?.firstName} {proxy.proxyApprover?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">{proxy.proxyApprover?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-900 align-top">
                  {approverLevels[proxy.approverLevel] || `ระดับ ${proxy.approverLevel}`}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-900 align-top">
                  {proxy.isDaily ? (
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-brand-500" />
                      <div>{proxy.dailyDate ? new Date(proxy.dailyDate).toLocaleDateString('th-TH') : '-'}</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-brand-500" />
                      <div>{new Date(proxy.startDate).toLocaleDateString('th-TH')}</div>
                      <div className="text-xs text-slate-500">ถึง {new Date(proxy.endDate).toLocaleDateString('th-TH')}</div>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {getStatusBadge(proxy.status)}
                </td>
                {activeTab !== 'history' && (
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(proxy)}
                        className="text-brand-600 hover:text-brand-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        disabled={proxy.status !== 'ACTIVE'}
                        title={proxy.status !== 'ACTIVE' ? 'ไม่สามารถแก้ไขการมอบอำนาจที่ไม่ได้ใช้งานอยู่' : 'แก้ไขการมอบอำนาจ'}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleCancel(proxy.id)}
                        className="text-rose-600 hover:text-rose-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        disabled={proxy.status !== 'ACTIVE'}
                        title={proxy.status !== 'ACTIVE' ? 'ไม่สามารถยกเลิกการมอบอำนาจที่ไม่ได้ใช้งานอยู่' : 'ยกเลิกการมอบอำนาจ'}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
          ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Tab วันนี้ */}
      {activeTab === 'today' && totalCountToday > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 mt-auto">
          <div className="text-sm text-slate-700">
            แสดง {Math.min((currentPageToday - 1) * itemsPerPage + 1, totalCountToday)} ถึง {Math.min(currentPageToday * itemsPerPage, totalCountToday)} จาก {totalCountToday} รายการ
          </div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => loadProxyApprovals(currentPageToday - 1)}
            disabled={currentPageToday === 1}
            className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ก่อนหน้า
          </button>
          {(() => {
            const totalPages = totalPagesToday;
            const currentPage = currentPageToday;
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
                  <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">...</span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => loadProxyApprovals(page)}
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
            onClick={() => loadProxyApprovals(currentPageToday + 1)}
            disabled={currentPageToday === totalPagesToday}
            className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป
          </button>
        </nav>
        </div>
      )}

      {/* Pagination Controls - Tab ประวัติ */}
      {activeTab === 'history' && totalCountHistory > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 mt-auto">
          <div className="text-sm text-slate-700">
            แสดง {Math.min((currentPageHistory - 1) * itemsPerPage + 1, totalCountHistory)} ถึง {Math.min(currentPageHistory * itemsPerPage, totalCountHistory)} จาก {totalCountHistory} รายการ
          </div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => loadProxyApprovals(currentPageHistory - 1)}
            disabled={currentPageHistory === 1}
            className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ก่อนหน้า
          </button>
          {(() => {
            const totalPages = totalPagesHistory;
            const currentPage = currentPageHistory;
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
                  <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">...</span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => loadProxyApprovals(page)}
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
            onClick={() => loadProxyApprovals(currentPageHistory + 1)}
            disabled={currentPageHistory === totalPagesHistory}
            className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป
          </button>
        </nav>
        </div>
      )}
    </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
          onMouseDown={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-[min(92vw,720px)] max-h-[90vh] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl font-kanit flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Admin Action
                </span>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingProxy ? 'แก้ไขการมอบอำนาจ' : 'เพิ่มการมอบอำนาจ'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-3 py-2.5 min-h-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative">

                  {/* Original Approver — เลือกอัตโนมัติตามระดับ กดเพื่อค้นหา/เปลี่ยนคน */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm text-slate-700">
                      ผู้มอบอำนาจ (Original Approver) <span className="text-rose-500">*</span>
                      <span className="ml-1 text-xs text-slate-400">— ระบบเลือกให้ตามระดับ กดเพื่อเปลี่ยนคน</span>
                    </label>

                    {!formData.approverLevel ? (
                      <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 border border-amber-200">
                        กรุณาเลือกระดับผู้อนุมัติก่อน
                      </div>
                    ) : selectedOriginalUser ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-medium">{formatUserName(selectedOriginalUser)}</span>
                          {selectedOriginalUser.department?.name && (
                            <span className="shrink-0 rounded-full bg-emerald-200 px-2 py-0.5 text-xs text-emerald-800">
                              {selectedOriginalUser.department.name}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPeoplePicker("original")}
                          className="shrink-0 text-xs text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                        >
                          เปลี่ยน
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPeoplePicker("original")}
                        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                      >
                        <FaUser className="h-3.5 w-3.5" />
                        เลือกผู้มอบอำนาจ
                      </button>
                    )}
                  </div>

                  {/* Proxy Approver — modal ค้นหา-แล้วเลือก */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm text-slate-700">
                      ผู้อนุมัติแทน <span className="text-rose-500">*</span>
                      <span className="ml-1 text-xs text-slate-400">— กดเพื่อค้นหาและเลือก</span>
                    </label>

                    {!formData.approverLevel ? (
                      <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 border border-amber-200">
                        กรุณาเลือกระดับผู้อนุมัติก่อน
                      </div>
                    ) : Number(formData.approverLevel) === 1 && !selectedOriginalUser ? (
                      <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 border border-amber-200">
                        กรุณาเลือกผู้มอบอำนาจ (หัวหน้าสาขา) ก่อน — ระบบจะให้เลือกผู้อนุมัติแทนเฉพาะบุคลากรในสาขานั้น
                      </div>
                    ) : selectedProxyUser ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-medium">{formatUserName(selectedProxyUser)}</span>
                          <span className="shrink-0 rounded-full bg-emerald-200 px-2 py-0.5 text-xs text-emerald-800">
                            {getProxyUserRole(selectedProxyUser.id)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPeoplePicker("proxy")}
                          className="shrink-0 text-xs text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                        >
                          เปลี่ยน
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPeoplePicker("proxy")}
                        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                      >
                        <FaUser className="h-3.5 w-3.5" />
                        เลือกผู้อนุมัติแทน
                      </button>
                    )}
                  </div>

                  {/* Role Conflict Warning */}
                  {roleConflict && (
                    <div className="col-span-2">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <div className="font-medium">ข้อควรพิจารณา:</div>
                          <ul className="mt-1 space-y-1">
                            <li>• ผู้อนุมัติแทน ({getProxyUserRole(selectedProxyUser.id)}) มี role เดียวกับระดับที่เลือก ({getRoleForLevel(formData.approverLevel)}) - จะได้รับอำนาจเพิ่มเติม</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Approver Level */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm text-slate-700">
                      ระดับผู้อนุมัติ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.approverLevel}
                        onChange={(e) => {
                          const selectedValue = e.target.value;

                          // ถ้าเลือก placeholder ให้เซ็ตเป็นค่าว่าง
                          if (selectedValue === '') {
                            setFormData({ ...formData, approverLevel: '' });
                            return;
                          }

                          const newLevel = parseInt(selectedValue);
                          setFormData({ ...formData, approverLevel: newLevel });

                          // Auto-map original approver เมื่อเปลี่ยนระดับ
                          if (newLevel) {
                            autoMapOriginalApprover(newLevel);
                          }
                        }}
                        className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                        required
                      >
                        <option value="">
                          เลือกระดับ...
                        </option>
                        {Object.entries(approverLevels).map(([key, label]) => (
                          <option key={key} value={parseInt(key)}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Proxy Type */}
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm text-slate-700">
                      ประเภทการมอบอำนาจ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.isDaily}
                        onChange={(e) => setFormData({ ...formData, isDaily: e.target.value === 'true' })}
                        className="w-full appearance-none rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      >
                        <option value={false}>ช่วงเวลา</option>
                        <option value={true}>รายวัน</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Date Fields */}
                  {formData.isDaily ? (
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm text-slate-700">
                        วันที่มอบอำนาจ <span className="text-rose-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.dailyDate ? new Date(formData.dailyDate) : null}
                        onChange={(date) => {
                          const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                          setFormData({ ...formData, dailyDate: formatted });
                        }}
                        dateFormat="dd/MM/yyyy"
                        locale={th}
                        placeholderText="เลือกวันที่มอบอำนาจ (วัน/เดือน/ปี)"
                        className={inputStyle}
                        wrapperClassName="w-full"
                        calendarClassName="!rounded-xl !border-2 !border-brand-300 p-2"
                        dayClassName={dayHighlight}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1 block text-sm text-slate-700">
                          วันเริ่มต้น <span className="text-rose-500">*</span>
                        </label>
                        <DatePicker
                          selected={formData.startDate ? new Date(formData.startDate) : null}
                          onChange={(date) => {
                            const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                            setFormData({ ...formData, startDate: formatted });
                          }}
                          dateFormat="dd/MM/yyyy"
                          locale={th}
                          placeholderText="เลือกวันที่เริ่มต้น (วัน/เดือน/ปี)"
                          className={inputStyle}
                          wrapperClassName="w-full"
                          calendarClassName="!rounded-xl !border-2 !border-brand-300 p-2"
                          dayClassName={dayHighlight}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-slate-700">
                          วันสิ้นสุด <span className="text-rose-500">*</span>
                        </label>
                        <DatePicker
                          selected={formData.endDate ? new Date(formData.endDate) : null}
                          onChange={(date) => {
                            const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                            setFormData({ ...formData, endDate: formatted });
                          }}
                          dateFormat="dd/MM/yyyy"
                          locale={th}
                          placeholderText="เลือกวันที่สิ้นสุด (วัน/เดือน/ปี)"
                          className={inputStyle}
                          wrapperClassName="w-full"
                          calendarClassName="!rounded-xl !border-2 !border-brand-300 p-2"
                          dayClassName={dayHighlight}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Reason */}
                  <div className="col-span-2">
                    <label className="mb-1 flex gap-1 text-sm text-slate-700">
                      เหตุผลการมอบอำนาจ <p className="text-slate-400">(ถ้ามี)</p>
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={3}
                      className={inputStyle}
                      placeholder="ระบุเหตุผลการมอบอำนาจ..."
                    />
                  </div>

                  {/* Role Conflict Warning */}
                      {roleConflict && (
                        <div className="col-span-2">
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div className="text-sm text-amber-800">
                              <div className="font-medium">ข้อควรพิจารณา:</div>
                              <ul className="mt-1 space-y-1">
                                {selectedProxyUser && getProxyUserRole(selectedProxyUser.id) === getRoleForLevel(formData.approverLevel) && ['APPROVER_1', 'APPROVER_2', 'APPROVER_3', 'APPROVER_4', 'APPROVER_5'].includes(getProxyUserRole(selectedProxyUser.id)) && (
                                  <li>• ผู้อนุมัติแทน ({getProxyUserRole(selectedProxyUser.id)}) มี role เดียวกับระดับที่เลือก ({getRoleForLevel(formData.approverLevel)}) - จะได้รับอำนาจเพิ่มเติม</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                  {/* Form Actions */}
                  <div className="col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={roleConflict || isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting && (
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    )}
                    {isSubmitting
                      ? "กำลังบันทึก..."
                      : editingProxy
                      ? "บันทึกการแก้ไข"
                      : "สร้างการมอบอำนาจ"}
                  </button>
                </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {peoplePicker && (
        <PeoplePickerModal
          title={peoplePicker === "original" ? "เลือกผู้มอบอำนาจ" : "เลือกผู้อนุมัติแทน"}
          subtitle={
            peoplePicker === "original"
              ? Number(formData.approverLevel) === 1
                ? "เฉพาะหัวหน้าสาขา (เลือกได้ทุกสาขา)"
                : "ผู้ถือบทบาทของระดับที่เลือก (แสดงทุกสาขา ดูสาขากำกับได้)"
              : Number(formData.approverLevel) === 1
                ? "เฉพาะบุคลากรในสาขาของผู้มอบอำนาจ"
                : "เลือกได้ทุกคนในระบบ"
          }
          users={peoplePicker === "original" ? originalApproverPool : proxyPickerUsers}
          currentId={
            peoplePicker === "original"
              ? selectedOriginalUser?.id
              : selectedProxyUser?.id
          }
          emptyText={
            peoplePicker === "original"
              ? Number(formData.approverLevel) === 1
                ? "ไม่พบหัวหน้าสาขา"
                : "ไม่มีผู้ถือบทบาทในระดับนี้"
              : Number(formData.approverLevel) === 1
                ? "ไม่พบบุคลากรในสาขานี้ (เลือกผู้มอบอำนาจก่อน)"
                : "ไม่พบผู้ใช้งาน"
          }
          onPick={(u) => {
            if (peoplePicker === "original") pickOriginalUser(u);
            else pickProxyUser(u);
            setPeoplePicker(null);
          }}
          onClose={() => setPeoplePicker(null)}
        />
      )}
      </div>
    </div>
  );
};

export default ProxyApprovalManagement;
