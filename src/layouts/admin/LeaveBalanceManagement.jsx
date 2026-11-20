/* eslint-disable react/prop-types */
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal, { notifyError, notifySuccess } from "../../utils/alert";
import { apiEndpoints } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  FaBalanceScale,
  FaExclamationTriangle,
  FaSync,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

const Panel = ({ className = "", children }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </section>
);

const nameOf = (user) =>
  `${user.prefixName || ""}${user.firstName || ""} ${user.lastName || ""}`.trim();
const isCountOnlyRank = (rank) =>
  rank?.receiveDays === 0 && rank?.isBalance === true;
const getBalanceDraft = (user, balance, balanceDrafts) => {
  const rankOptions = user.ranks.filter(
    (rank) => rank.leaveTypeId === balance.leaveTypeId,
  );
  const saved = balanceDrafts[balance.id];
  const rankId = String(saved?.rankId || rankOptions[0]?.id || "");
  const rank = rankOptions.find((option) => String(option.id) === rankId);
  const countOnly =
    balance.leaveType?.isNonDeductible === true || isCountOnlyRank(rank);
  return {
    rankOptions,
    rankId,
    countOnly,
    remainingDays: countOnly
      ? "0"
      : String(saved?.remainingDays ?? balance.remainingDays ?? 0),
    usedDays: String(saved?.usedDays ?? balance.usedDays ?? 0),
  };
};
const getBalanceValidation = (balance, draft) => {
  const remainingDays = String(draft.remainingDays ?? "").trim();
  const usedDays = String(draft.usedDays ?? "").trim();
  const remaining = Number(remainingDays);
  const used = Number(usedDays);
  const pending = Number(balance.pendingDays) || 0;
  const rank = draft.rankOptions.find(
    (option) => String(option.id) === String(draft.rankId),
  );
  const maxAllowed =
    rank?.maxDays == null
      ? null
      : Number(rank.maxDays) + (Number(balance.carryOverDays) || 0);

  if (
    !draft.rankId ||
    !remainingDays ||
    !usedDays ||
    !Number.isSafeInteger(remaining) ||
    remaining < 0 ||
    !Number.isSafeInteger(used) ||
    used < 0
  ) {
    return { invalid: true, message: "กรอกจำนวนวันเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป" };
  }
  if (maxAllowed == null || !Number.isSafeInteger(maxAllowed) || maxAllowed < 0) {
    return { invalid: true, message: "Rank นี้ไม่ได้กำหนดสิทธิ์วันลาสูงสุด" };
  }
  if (draft.countOnly) {
    return remaining === 0
      ? { invalid: false }
      : { invalid: true, message: "ประเภทลานี้ต้องกำหนดยอดคงเหลือเป็น 0" };
  }

  const total = remaining + used + pending;
  return total > maxAllowed
    ? {
        invalid: true,
        message: `รวม ${total} วัน เกินสิทธิ์ ${maxAllowed} วัน (รวมรออนุมัติ ${pending} วัน)`,
      }
    : { invalid: false };
};
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500";
const dayInputClass =
  "w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-500";
const checkboxClass =
  "h-5 w-5 cursor-pointer rounded border-slate-300 accent-brand-600 focus:ring-2 focus:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-40";
const maxSelectableUsers = 1000;

export default function LeaveBalanceManagement({ embedded = false }) {
  const { user: currentUser } = useAuth();
  const roles = Array.isArray(currentUser?.roles)
    ? currentUser.roles
    : Array.isArray(currentUser?.role)
      ? currentUser.role
      : [];
  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [options, setOptions] = useState({
    year: null,
    organizations: [],
    departments: [],
    ranks: [],
  });
  const [filters, setFilters] = useState({
    organizationId: "",
    departmentId: "",
    rankId: "",
    search: "",
  });
  const [users, setUsers] = useState([]);
  const [knownUsers, setKnownUsers] = useState(new Map());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [balanceDrafts, setBalanceDrafts] = useState({});
  const [showSelectedUsers, setShowSelectedUsers] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [serverInvalidBalanceIds, setServerInvalidBalanceIds] = useState(new Set());

  const [fiscalYear, setFiscalYear] = useState({
    fiscalYear: null,
    currentYear: null,
  });
  const [yearInputs, setYearInputs] = useState({
    fiscalYear: "",
    currentYear: "",
  });
  const [availableYears, setAvailableYears] = useState([]);
  const [deleteYearInput, setDeleteYearInput] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [yearSaving, setYearSaving] = useState(false);

  const authHeader = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }), []);

  const loadOptions = useCallback(async () => {
    const response = await axios.get(
      apiEndpoints.adminLeaveBalanceManagementOptions,
      authHeader(),
    );
    setOptions(response.data.data);
  }, [authHeader]);

  const loadFiscalYearData = useCallback(async () => {
    const [yearResponse, yearsResponse] = await Promise.all([
      axios.get(apiEndpoints.getFiscalYear, authHeader()),
      axios.get(apiEndpoints.getAvailableYears, authHeader()),
    ]);
    setFiscalYear(yearResponse.data.data);
    setYearInputs({
      fiscalYear: yearResponse.data.data.fiscalYear?.toString() || "",
      currentYear: yearResponse.data.data.currentYear?.toString() || "",
    });
    setAvailableYears(yearsResponse.data.data || []);
  }, [authHeader]);

  useEffect(() => {
    Promise.all([loadOptions(), loadFiscalYearData()])
      .catch((error) => {
        console.error("ไม่สามารถโหลดข้อมูลจัดการยอดวันลา:", error);
        notifyError(
          "โหลดข้อมูลไม่สำเร็จ",
          error.response?.data?.message || "ไม่สามารถโหลดข้อมูลจัดการยอดวันลาได้",
        );
      })
      .finally(() => setLoading(false));
  }, [loadFiscalYearData, loadOptions]);

  const departments = useMemo(
    () =>
      filters.organizationId
        ? options.departments.filter(
            (department) =>
              String(department.organizationId) === String(filters.organizationId),
          )
        : options.departments,
    [filters.organizationId, options.departments],
  );

  const selectedUsers = useMemo(
    () =>
      [...selectedIds]
        .map((id) => knownUsers.get(id))
        .filter(Boolean),
    [knownUsers, selectedIds],
  );

  const leaveTypeColumns = useMemo(() => {
    const leaveTypes = new Map();
    selectedUsers.forEach((user) => {
      user.leaveBalances.forEach((balance) => {
        if (balance.leaveType && !leaveTypes.has(balance.leaveTypeId)) {
          leaveTypes.set(balance.leaveTypeId, balance.leaveType);
        }
      });
    });
    return [...leaveTypes.values()].sort((a, b) => a.id - b.id);
  }, [selectedUsers]);

  const balanceChanges = useMemo(() => {
    const changes = [];
    selectedUsers.forEach((user) => {
      user.leaveBalances.forEach((balance) => {
        const draft = getBalanceDraft(user, balance, balanceDrafts);
        if (draft.rankId && (
          draft.remainingDays !== String(balance.remainingDays ?? 0) ||
          draft.usedDays !== String(balance.usedDays ?? 0)
        )) {
          changes.push({
            balanceId: balance.id,
            rankId: draft.rankId,
            remainingDays: draft.remainingDays,
            usedDays: draft.usedDays,
            userId: user.id,
          });
        }
      });
    });
    return changes;
  }, [balanceDrafts, selectedUsers]);

  const visibleSelectableUsers = users;
  const allVisibleSelected =
    visibleSelectableUsers.length > 0 &&
    visibleSelectableUsers.every((item) => selectedIds.has(item.id));
  const someVisibleSelected = visibleSelectableUsers.some((item) =>
    selectedIds.has(item.id),
  );

  const loadUsers = async (nextFilters = filters) => {
    const params = Object.fromEntries(
      Object.entries(nextFilters).filter(([, value]) => String(value || "").trim()),
    );
    const response = await axios.get(
      apiEndpoints.adminLeaveBalanceManagementUsers,
      { ...authHeader(), params },
    );
    const fetchedUsers = response.data.users || [];
    setUsers(fetchedUsers);
    setHasSearched(true);
    setKnownUsers((previous) => {
      const next = new Map(previous);
      fetchedUsers.forEach((item) => next.set(item.id, item));
      return next;
    });
    setOptions((previous) => ({ ...previous, year: response.data.year }));
  };

  const handleSearch = async () => {
    try {
      setSearching(true);
      await loadUsers();
    } catch (error) {
      console.error("ไม่สามารถค้นหาผู้ใช้งาน:", error);
      notifyError(
        "ค้นหาไม่สำเร็จ",
        error.response?.data?.message || "ไม่สามารถค้นหารายชื่อได้",
      );
    } finally {
      setSearching(false);
    }
  };

  const toggleUser = (id) => {
    if (!selectedIds.has(id) && selectedIds.size >= maxSelectableUsers) {
      Swal.fire(
        "เลือกครบจำนวนสูงสุดแล้ว",
        `เลือกผู้ใช้ได้ไม่เกิน ${maxSelectableUsers} คนต่อครั้ง`,
        "warning",
      );
      return;
    }
    setSaveError("");
    setServerInvalidBalanceIds(new Set());
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisibleUsers = () => {
    if (!allVisibleSelected) {
      const additionalUsers = visibleSelectableUsers.filter(
        (item) => !selectedIds.has(item.id),
      ).length;
      if (selectedIds.size + additionalUsers > maxSelectableUsers) {
        Swal.fire(
          "จำนวนผู้ใช้เกินกำหนด",
          `เลือกผู้ใช้ได้ไม่เกิน ${maxSelectableUsers} คนต่อครั้ง กรุณาแบ่งเลือกเป็นชุด`,
          "warning",
        );
        return;
      }
    }
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) {
        visibleSelectableUsers.forEach((item) => next.delete(item.id));
      } else {
        visibleSelectableUsers.forEach((item) => next.add(item.id));
      }
      return next;
    });
  };

  const handleInitializeMissingBalances = async () => {
    if (!selectedUsers.length) return;

    const confirmation = await Swal.fire({
      title: "สร้างยอดวันลาที่ขาดจาก Rank?",
      text: `สร้างเฉพาะยอดที่ขาดในปีงบประมาณ ${options.year} สำหรับผู้ใช้ ${selectedUsers.length} คน: ลาพักผ่อนจะคำนวณยอดสะสม, ลาถาวรจะคัดลอกยอดล่าสุดโดยไม่รีเซ็ต, และประเภทที่ไม่สร้างยอดใหม่ตามรอบปีจะถูกข้าม ยอดที่มีอยู่แล้วจะไม่ถูกแก้ไข`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "สร้างยอดที่ขาด",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#b45309",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    try {
      setInitializing(true);
      const response = await axios.post(
        apiEndpoints.adminLeaveBalanceInitializeMissing,
        { userIds: selectedUsers.map((user) => user.id) },
        authHeader(),
      );
      const result = response.data.data;
      const createdBalances = result.createdBalances || [];
      const balancesByUser = new Map();
      createdBalances.forEach(({ userId, balance }) => {
        const balances = balancesByUser.get(userId) || [];
        balances.push(balance);
        balancesByUser.set(userId, balances);
      });
      const addCreatedBalances = (user) => {
        const additions = balancesByUser.get(user.id) || [];
        if (!additions.length) return user;
        const existingIds = new Set(user.leaveBalances.map((balance) => balance.id));
        return {
          ...user,
          leaveBalances: [
            ...user.leaveBalances,
            ...additions.filter((balance) => !existingIds.has(balance.id)),
          ],
        };
      };
      setKnownUsers((previous) => {
        const next = new Map(previous);
        selectedUsers.forEach((user) => next.set(user.id, addCreatedBalances(user)));
        return next;
      });
      setUsers((previous) => previous.map(addCreatedBalances));

      const skipped = result.skipped || [];
      const skipDetails = skipped
        .slice(0, 8)
        .map((item) => `${item.userName}: ${item.reason}`)
        .join("\n");
      if (result.createdCount > 0) {
        await Swal.fire({
          title: "สร้างยอดวันลาสำเร็จ",
          text: `สร้าง ${result.createdCount} รายการในปีงบประมาณ ${result.year}${skipped.length ? `\nข้าม ${skipped.length} รายการ\n${skipDetails}` : ""}`,
          icon: "success",
        });
      } else {
        await Swal.fire({
          title: "ไม่มีรายการที่สร้างได้",
          text: skipDetails || "ผู้ใช้ที่เลือกมีข้อมูลยอดวันลาครบแล้ว",
          icon: "info",
        });
      }
    } catch (error) {
      console.error("ไม่สามารถสร้างยอดวันลาที่ขาด:", error);
      notifyError(
        "สร้างยอดวันลาไม่สำเร็จ",
        error.response?.data?.message || "ไม่สามารถสร้างยอดวันลาจาก Rank ได้",
      );
    } finally {
      setInitializing(false);
    }
  };

  const updateBalanceDraft = (user, balance, field, value) => {
    setSaveError("");
    setServerInvalidBalanceIds((previous) => {
      if (!previous.has(balance.id)) return previous;
      const next = new Set(previous);
      next.delete(balance.id);
      return next;
    });
    const current = getBalanceDraft(user, balance, balanceDrafts);
    const next = { ...current, [field]: value };
    if (field === "rankId") {
      const selectedRank = current.rankOptions.find(
        (rank) => String(rank.id) === String(value),
      );
      if (
        balance.leaveType?.isNonDeductible === true ||
        isCountOnlyRank(selectedRank)
      ) {
        next.remainingDays = "0";
      }
    }
    setBalanceDrafts((previous) => ({
      ...previous,
      [balance.id]: next,
    }));
  };

  const handleSaveBalanceChanges = async () => {
    setValidationAttempted(true);
    setSaveError("");
    setServerInvalidBalanceIds(new Set());
    if (!balanceChanges.length) {
      await Swal.fire(
        "ยังไม่มีการแก้ไข",
        "ปรับยอดคงเหลือหรือวันที่ใช้ไปก่อนบันทึก",
        "info",
      );
      return;
    }

    const invalidBalanceIds = new Set();
    const invalidBalances = [];
    balanceChanges.forEach((change) => {
      const user = selectedUsers.find((item) => item.id === change.userId);
      const balance = user?.leaveBalances.find((item) => item.id === change.balanceId);
      if (!user || !balance) return;
      const validation = getBalanceValidation(
        balance,
        getBalanceDraft(user, balance, balanceDrafts),
      );
      if (validation.invalid) {
        invalidBalanceIds.add(balance.id);
        invalidBalances.push(
          `${nameOf(user)} · ${balance.leaveType?.name || "ประเภทลา"}: ${validation.message}`,
        );
      }
    });
    if (invalidBalanceIds.size) {
      await Swal.fire(
        "ตรวจสอบยอดวันลา",
        [...new Set(invalidBalances)].join("\n"),
        "warning",
      );
      return;
    }

    if (
      balanceChanges.some(
        (change) =>
          !String(change.rankId || "").trim() ||
          !String(change.remainingDays ?? "").trim() ||
          !String(change.usedDays ?? "").trim(),
      )
    ) {
      await Swal.fire(
        "ตรวจสอบจำนวนวัน",
        "เลือก Rank และกรอกจำนวนวันให้ครบก่อนบันทึก",
        "warning",
      );
      return;
    }

    const changes = balanceChanges.map((change) => ({
      balanceId: change.balanceId,
      rankId: Number(change.rankId),
      remainingDays: Number(change.remainingDays),
      usedDays: Number(change.usedDays),
    }));
    if (
      changes.some(
        (change) =>
          !Number.isSafeInteger(change.rankId) ||
          change.rankId <= 0 ||
          !Number.isSafeInteger(change.remainingDays) ||
          change.remainingDays < 0 ||
          !Number.isSafeInteger(change.usedDays) ||
          change.usedDays < 0,
      )
    ) {
      await Swal.fire(
        "ตรวจสอบจำนวนวัน",
        "เลือก Rank และกรอกจำนวนวันเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไปให้ครบ",
        "warning",
      );
      return;
    }

    const affectedUserCount = new Set(balanceChanges.map((change) => change.userId)).size;
    const confirmation = await Swal.fire({
      title: "ยืนยันบันทึกยอดวันลา?",
      text: `มีรายการเปลี่ยนแปลง ${changes.length} รายการ จากผู้ใช้ ${affectedUserCount} คน\nระบบจะตรวจสิทธิ์ Rank และยอดรออนุมัติทุกรายการก่อนบันทึก และเก็บประวัติข้อมูลเดิม/ใหม่ใน Audit Log`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "บันทึกทั้งหมด",
      cancelButtonText: "กลับไปตรวจสอบ",
      confirmButtonColor: "#b45309",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    try {
      setSaving(true);
      const response = await axios.post(
        apiEndpoints.adminLeaveBalanceBulkAdjust,
        { changes },
        authHeader(),
      );
      await notifySuccess(
        "ปรับยอดสำเร็จ",
        `บันทึกยอดวันลา ${response.data.data.updatedCount} รายการ ปีงบประมาณ ${response.data.data.year}`,
      );
      setSelectedIds(new Set());
      setUsers([]);
      setHasSearched(false);
      setKnownUsers(new Map());
      setBalanceDrafts({});
      setValidationAttempted(false);
      setSaveError("");
      setServerInvalidBalanceIds(new Set());
    } catch (error) {
      console.error("ไม่สามารถปรับยอดวันลา:", error);
      const message =
        error.response?.data?.message || "ไม่สามารถปรับยอดวันลาได้";
      if (error.response?.status === 400) {
        setSaveError(message);
        setServerInvalidBalanceIds(
          new Set(balanceChanges.map((change) => change.balanceId)),
        );
      }
      notifyError(
        "ปรับยอดไม่สำเร็จ",
        message,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetLeaveBalance = async () => {
    const confirmation = await Swal.fire({
      title: "ยืนยันรีเซ็ตยอดวันลาทั้งระบบ?",
      html: "<div class='text-left'><p>ระบบจะสร้างยอดปีงบประมาณปัจจุบันใหม่ตาม Rank และจัดการยอดสะสมตามกฎเดิม</p><p class='mt-3 font-semibold text-rose-700'>ยอดที่ใช้ไปและรออนุมัติอาจถูกลบ และไม่สามารถย้อนกลับได้</p></div>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันรีเซ็ต",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#b45309",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    const runReset = (force) =>
      axios.post(
        apiEndpoints.resetLeaveBalance,
        force ? { confirm: true, force: true } : { confirm: true },
        authHeader(),
      );

    try {
      setResetLoading(true);
      let response;
      try {
        response = await runReset(false);
      } catch (error) {
        if (error.response?.status !== 409) throw error;
        const forceConfirmation = await Swal.fire({
          title: "ปีงบประมาณนี้มีวันลาที่ใช้หรือรออนุมัติ",
          text:
            error.response.data?.message ||
            "การรีเซ็ตจะลบยอดที่ใช้ไปและรออนุมัติทั้งหมด",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ยืนยันลบและรีเซ็ต",
          cancelButtonText: "ยกเลิก",
          confirmButtonColor: "#dc2626",
          reverseButtons: true,
        });
        if (!forceConfirmation.isConfirmed) return;
        response = await runReset(true);
      }
      await Swal.fire(
        "รีเซ็ตสำเร็จ",
        `รีเซ็ตยอดวันลาเรียบร้อยแล้ว (${response.data.timestamp || ""})`,
        "success",
      );
      await Promise.all([loadOptions(), loadFiscalYearData()]);
      setUsers([]);
      setHasSearched(false);
      setKnownUsers(new Map());
      setSelectedIds(new Set());
    } catch (error) {
      console.error("ไม่สามารถรีเซ็ตยอดวันลา:", error);
      notifyError(
        "รีเซ็ตไม่สำเร็จ",
        error.response?.data?.message || "ไม่สามารถรีเซ็ตยอดวันลาได้",
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdateFiscalYear = async () => {
    const fiscal = Number(yearInputs.fiscalYear);
    const calendar = Number(yearInputs.currentYear);
    if (
      !Number.isSafeInteger(fiscal) ||
      !Number.isSafeInteger(calendar) ||
      fiscal < 2000 ||
      fiscal > 2100 ||
      calendar < 2000 ||
      calendar > 2100
    ) {
      await Swal.fire("ปีไม่ถูกต้อง", "กรุณากรอกปีระหว่าง ค.ศ. 2000-2100", "warning");
      return;
    }
    const confirmation = await Swal.fire({
      title: "ยืนยันการอัปเดตปี?",
      text: `ปีงบประมาณ ${fiscal} และปีปฏิทิน ${calendar}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันอัปเดต",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    try {
      setYearSaving(true);
      await axios.put(
        apiEndpoints.updateFiscalYear,
        { fiscalYear: fiscal, currentYear: calendar },
        authHeader(),
      );
      await Promise.all([loadOptions(), loadFiscalYearData()]);
      await notifySuccess("อัปเดตปีสำเร็จ");
    } catch (error) {
      console.error("ไม่สามารถอัปเดตปีงบประมาณ:", error);
      notifyError(
        "อัปเดตปีไม่สำเร็จ",
        error.response?.data?.message || "ไม่สามารถอัปเดตปีงบประมาณได้",
      );
    } finally {
      setYearSaving(false);
    }
  };

  const handleDeleteLeaveBalanceByYear = async () => {
    const year = Number(deleteYearInput);
    if (!Number.isSafeInteger(year) || year < 2000 || year > 2100) {
      await Swal.fire("ปีไม่ถูกต้อง", "กรุณาระบุปี ค.ศ. 2000-2100", "warning");
      return;
    }
    const confirmation = await Swal.fire({
      title: `ลบข้อมูลวันลาปี ${year}?`,
      text: "การลบข้อมูลวันลาของทุกคนในปีนี้ไม่สามารถย้อนกลับได้",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "ลบข้อมูลถาวร",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed) return;

    try {
      setDeleteLoading(true);
      const response = await axios.delete(
        apiEndpoints.deleteLeaveBalanceByYear(year),
        authHeader(),
      );
      await notifySuccess(
        "ลบข้อมูลสำเร็จ",
        `ลบ ${response.data.deletedCount} รายการในปี ${year}`,
      );
      setDeleteYearInput("");
      await loadFiscalYearData();
    } catch (error) {
      console.error("ไม่สามารถลบข้อมูลวันลา:", error);
      notifyError(
        "ลบข้อมูลไม่สำเร็จ",
        error.response?.data?.message || "ไม่สามารถลบข้อมูลได้",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="กำลังโหลดหน้าจัดการยอดวันลา..." fullScreen={false} />;
  }

  return (
    <div className={`space-y-6 font-kanit text-slate-900 ${embedded ? "" : "min-h-screen rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8"}`}>
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-brand-700">
            <FaBalanceScale />
            Admin leave balance tools
          </div>
          <h1 className="text-2xl font-semibold md:text-3xl">จัดการยอดวันลา</h1>
          <p className="mt-1 text-sm text-slate-600">
            เลือกผู้ใช้หลายแผนกได้ หรือกรองตามองค์กร แผนก และ Rank
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2 text-sm text-brand-900 shadow-sm">
          ยอดวันลาปีงบประมาณ <strong>{options.year || "-"}</strong>
        </div>
      </header>

      <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
        <FaExclamationTriangle className="mt-1 shrink-0" />
        <div>
          <p className="font-semibold">โปรดใช้การปรับยอดเมื่อจำเป็นและตรวจสอบให้รอบคอบ</p>
          <p className="mt-1 text-sm">
            การแก้ไขนี้มีผลต่อสิทธิ์วันลาที่ผู้ใช้ยื่นได้ ระบบจะตรวจ Rank และยอดรออนุมัติ
            ก่อนบันทึก พร้อมบันทึกผู้ดำเนินการและข้อมูลก่อน/หลังไว้ในประวัติ
          </p>
        </div>
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">1. ค้นหาและเลือกรายชื่อ</h2>
          <p className="mt-1 text-sm text-slate-600">
            กดแสดงรายชื่อเพื่อดูผู้ใช้ทั้งหมด หรือเลือกองค์กร/แผนก/Rank เพื่อกรองรายชื่อ
            สามารถค้นหาและเก็บรายชื่อข้ามแผนกไว้ในชุดเดียวกันได้
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium">
            องค์กร
            <select
              value={filters.organizationId}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  organizationId: event.target.value,
                  departmentId: "",
                }))
              }
              className={inputClass}
            >
              <option value="">ทุกองค์กร</option>
              {options.organizations.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            แผนก
            <select
              value={filters.departmentId}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  departmentId: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">ทุกแผนก</option>
              {departments.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Rank
            <select
              value={filters.rankId}
              onChange={(event) =>
                setFilters((previous) => ({ ...previous, rankId: event.target.value }))
              }
              className={inputClass}
            >
              <option value="">ทุก Rank</option>
              {options.ranks.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.personnelType?.name} · {rank.leaveType?.name} · {rank.rank}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            ค้นหาชื่อหรืออีเมล
            <input
              value={filters.search}
              onChange={(event) =>
                setFilters((previous) => ({ ...previous, search: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              className={inputClass}
              placeholder="พิมพ์ชื่อหรืออีเมล"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:cursor-wait disabled:opacity-60"
          >
            {searching ? "กำลังค้นหา..." : "แสดงรายชื่อ"}
          </button>
          <button
            type="button"
            onClick={toggleVisibleUsers}
            disabled={!visibleSelectableUsers.length}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {allVisibleSelected ? "ยกเลิกที่แสดง" : `เลือกทั้งหมดที่แสดง (${visibleSelectableUsers.length})`}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set());
              setSaveError("");
              setServerInvalidBalanceIds(new Set());
            }}
            disabled={!selectedIds.size}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ล้างรายการที่เลือก
          </button>
          <button
            type="button"
            onClick={() => setShowSelectedUsers(true)}
            disabled={!selectedIds.size}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaUsers />
            เลือกแล้ว {selectedIds.size} คน
          </button>
        </div>
        {hasSearched && (
          <div
            role="status"
            className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            <span>
              แสดงรายชื่อ <strong className="text-slate-900">{users.length}</strong> คน
            </span>
            <span>
              มี Leave Balance ปี {options.year}:{" "}
              <strong className="text-emerald-700">
                {users.filter((item) => item.leaveBalances.length > 0).length} คน
              </strong>
            </span>
            <span>
              ไม่มี Leave Balance ปีนี้:{" "}
              <strong className="text-amber-700">
                {users.filter((item) => item.leaveBalances.length === 0).length} คน
              </strong>
            </span>
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">
                  <label
                    className="inline-flex cursor-pointer items-center gap-2"
                    title="เลือกหรือยกเลิกผู้ใช้ทั้งหมดที่แสดง"
                  >
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(checkbox) => {
                        if (checkbox) {
                          checkbox.indeterminate =
                            someVisibleSelected && !allVisibleSelected;
                        }
                      }}
                      onChange={toggleVisibleUsers}
                      disabled={!visibleSelectableUsers.length}
                      aria-label="เลือกผู้ใช้ทั้งหมดที่แสดง"
                      className={checkboxClass}
                    />
                    <span>เลือก</span>
                  </label>
                </th>
                <th className="px-4 py-3">ผู้ใช้งาน</th>
                <th className="px-4 py-3">องค์กร / แผนก</th>
                <th className="px-4 py-3">ประเภทลาที่มีข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className={`border-t border-slate-100 align-top transition-colors ${
                      selectedIds.has(item.id) ? "bg-brand-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleUser(item.id)}
                        aria-label={`เลือก ${nameOf(item)}`}
                        title={`เลือก ${nameOf(item)}`}
                        className={checkboxClass}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{nameOf(item)}</div>
                      <div className="text-xs text-slate-500">{item.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.department?.organization?.name || "-"}
                      <div className="text-xs text-slate-500">{item.department?.name || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {item.leaveBalances.length
                        ? item.leaveBalances.map((balance) => balance.leaveType?.name).filter(Boolean).join(", ")
                        : `ไม่มีข้อมูลยอดวันลาปี ${options.year || "-"}`}
                      {!item.ranks.length && item.leaveBalances.length > 0 && (
                        <div className="mt-1 text-amber-700">ไม่มี Rank ที่ใช้ได้สำหรับปรับยอด</div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!users.length && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                    {hasSearched
                      ? "ไม่พบผู้ใช้ตามเงื่อนไขที่เลือก"
                      : "เลือกเงื่อนไขหรือกด “แสดงรายชื่อ” เพื่อดูผู้ใช้ทั้งหมด"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ปีงบประมาณ {options.year || "-"} คือปีของยอดวันลาที่กำลังแสดง ไม่ใช่ปีที่เริ่มทำงาน
          · เลือกผู้ใช้ข้ามองค์กรหรือแผนกได้ ยอดจะนำมาจากปีงบประมาณนี้เท่านั้น
        </p>
      </Panel>

      {showSelectedUsers && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowSelectedUsers(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-leave-users-title"
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 id="selected-leave-users-title" className="text-lg font-semibold text-slate-900">
                  รายชื่อที่เลือก {selectedUsers.length} คน
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  รายชื่อจะยังคงอยู่ แม้เปลี่ยนตัวกรองหรือค้นหาคนจากแผนกอื่น
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSelectedUsers(false)}
                aria-label="ปิดรายชื่อที่เลือก"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <FaTimes />
              </button>
            </header>
            <div className="overflow-auto p-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-600">
                    <tr>
                      <th className="px-4 py-3">ชื่อ</th>
                      <th className="px-4 py-3">อีเมล</th>
                      <th className="px-4 py-3">องค์กร / แผนก</th>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">นำออก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUsers.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100 align-top">
                        <td className="px-4 py-3 font-medium">
                          {nameOf(item)}
                          <div className="text-xs font-normal text-slate-500">User ID {item.id}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.email || "—"}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.department?.organization?.name || "—"}
                          <div className="text-xs text-slate-500">{item.department?.name || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {item.ranks.length
                            ? item.ranks.map((rank) => (
                                <div key={rank.id}>
                                  {rank.leaveType?.name || "ประเภทลา"} · {rank.rank}
                                </div>
                              ))
                            : "ไม่มี Rank ที่ใช้ได้"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleUser(item.id)}
                            className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            นำออก
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!selectedUsers.length && (
                <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีรายชื่อที่เลือก</p>
              )}
            </div>
            <footer className="flex justify-end border-t border-slate-200 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowSelectedUsers(false)}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
              >
                เสร็จสิ้น
              </button>
            </footer>
          </section>
        </div>
      )}

      <Panel className="p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">2. ตรวจสอบและแก้ไขยอดในตาราง</h2>
          <p className="mt-1 text-sm text-slate-600">
            ยอดเดิมจะแสดงไว้ก่อน แก้ไขเฉพาะช่องที่ต้องการ แล้วกดบันทึกครั้งเดียว
            ระบบจะตรวจ Rank และยอดรออนุมัติทุกรายการก่อนบันทึก
          </p>
        </div>
        {selectedUsers.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-900">
              สร้างเฉพาะยอดที่ยังขาดจาก Rank สำหรับ {selectedUsers.length} คนที่เลือก
              ลาพักผ่อนใช้ยอดสะสม ลาถาวรคัดลอกยอดเดิม และไม่แก้ไขรายการที่มีอยู่แล้ว
            </p>
            <button
              type="button"
              onClick={handleInitializeMissingBalances}
              disabled={initializing || saving}
              className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60"
            >
              {initializing ? "กำลังสร้างยอด..." : "สร้างยอดที่ขาดจาก Rank"}
            </button>
          </div>
        )}
        {!selectedUsers.length ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            เลือกผู้ใช้งานอย่างน้อย 1 คนจากรายการด้านบนก่อน
          </p>
        ) : !leaveTypeColumns.length ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            ผู้ใช้ที่เลือกยังไม่มีข้อมูลยอดวันลาในปีงบประมาณปัจจุบัน กด “สร้างยอดที่ขาดจาก Rank”
            เพื่อสร้างยอดตั้งต้นตามสิทธิ์ที่ใช้ได้ก่อน
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-900">
              <span>
                เลือก {selectedUsers.length} คน · แก้ไขแล้ว {balanceChanges.length} ช่องยอด · ยอดปีงบประมาณ {options.year}
              </span>
              <span className="text-xs">
                ยอดรออนุมัติไม่เปลี่ยนแปลง และจะถูกนำมารวมตรวจสิทธิ์ Rank
              </span>
            </div>
            {saveError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800"
              >
                <FaExclamationTriangle className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">บันทึกไม่สำเร็จ กรุณาตรวจสอบช่องที่ทำเครื่องหมายสีแดง</p>
                  <p>{saveError}</p>
                </div>
              </div>
            )}
            <div className="overflow-auto rounded-xl border border-slate-200">
              <table className="min-w-max border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
                  <tr>
                    <th rowSpan="2" className="sticky left-0 z-20 min-w-56 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 text-left">
                      ผู้ใช้งาน
                    </th>
                    <th rowSpan="2" className="min-w-44 border-b border-r border-slate-200 px-3 py-3 text-left">
                      องค์กร / แผนก
                    </th>
                    {leaveTypeColumns.map((leaveType) => (
                      <th
                        key={leaveType.id}
                        colSpan="2"
                        className="min-w-52 border-b border-r border-slate-200 px-3 py-3 text-center"
                      >
                        <div>{leaveType.name}</div>
                        <div className="mt-0.5 text-[11px] font-normal text-slate-500">
                          Leave Type ID {leaveType.id}
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {leaveTypeColumns.map((leaveType) => (
                      <Fragment key={leaveType.id}>
                        <th className="border-b border-r border-slate-200 px-2 py-2 text-right text-xs font-medium">
                          คงเหลือ
                        </th>
                        <th className="border-b border-r border-slate-200 px-2 py-2 text-right text-xs font-medium">
                          ใช้ไปแล้ว
                        </th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 align-top hover:bg-slate-50/60">
                      <th className="sticky left-0 z-[1] border-r border-slate-200 bg-white px-3 py-3 text-left font-medium">
                        {nameOf(user)}
                        <div className="mt-0.5 text-xs font-normal text-slate-500">
                          User ID {user.id}
                        </div>
                      </th>
                      <td className="border-r border-slate-200 px-3 py-3 text-slate-700">
                        {user.department?.organization?.name || "—"}
                        <div className="text-xs text-slate-500">{user.department?.name || "—"}</div>
                      </td>
                      {leaveTypeColumns.map((leaveType) => {
                        const balance = user.leaveBalances.find(
                          (item) => item.leaveTypeId === leaveType.id,
                        );
                        if (!balance) {
                          return (
                            <td
                              key={leaveType.id}
                              colSpan="2"
                              className="border-r border-slate-200 px-3 py-3 text-center text-xs text-slate-400"
                            >
                              ไม่มีข้อมูลปีนี้
                            </td>
                          );
                        }
                        const draft = getBalanceDraft(user, balance, balanceDrafts);
                        const validation = getBalanceValidation(balance, draft);
                        const serverInvalid = serverInvalidBalanceIds.has(balance.id);
                        const invalidBorderClass =
                          serverInvalid || (validationAttempted && validation.invalid)
                            ? "border-rose-500 bg-rose-50 focus:border-rose-600 focus:ring-rose-100"
                            : validation.invalid
                              ? "border-amber-400 bg-amber-50 focus:border-amber-500 focus:ring-amber-100"
                              : "";
                        const validationMessage = serverInvalid
                          ? saveError
                          : validation.message;
                        if (!draft.rankOptions.length) {
                          return (
                            <td
                              key={leaveType.id}
                              colSpan="2"
                              className="border-r border-slate-200 px-3 py-3 text-center text-xs text-rose-700"
                            >
                              ไม่มี Rank ที่ใช้ได้
                              <div className="mt-1 text-slate-600">
                                คงเหลือ {balance.remainingDays} · ใช้ไปแล้ว {balance.usedDays}
                              </div>
                            </td>
                          );
                        }
                        const balanceInput = (field, value) => (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={value}
                            disabled={saving}
                            aria-label={`${nameOf(user)} ${leaveType.name} ${field === "remainingDays" ? "วันลาคงเหลือ" : "วันที่ใช้ไปแล้ว"}`}
                            onChange={(event) =>
                              updateBalanceDraft(user, balance, field, event.target.value)
                            }
                            aria-invalid={validation.invalid || serverInvalid}
                            className={`${dayInputClass} ${invalidBorderClass}`}
                          />
                        );
                        return (
                          <Fragment key={leaveType.id}>
                            <td className="border-r border-slate-200 px-2 py-2">
                              {draft.rankOptions.length > 1 && (
                                <label className="mb-1 block text-[10px] text-slate-500">
                                  Rank
                                  <select
                                    value={draft.rankId}
                                    onChange={(event) =>
                                      updateBalanceDraft(user, balance, "rankId", event.target.value)
                                    }
                                    disabled={saving}
                                    className="mb-1 w-full rounded-md border border-slate-300 bg-white px-1.5 py-1 text-xs text-slate-900"
                                  >
                                    {draft.rankOptions.map((rank) => (
                                      <option key={rank.id} value={rank.id}>{rank.rank}</option>
                                    ))}
                                  </select>
                                </label>
                              )}
                              {draft.countOnly ? (
                                <span className="inline-flex min-w-24 justify-end rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600">
                                  0 · ไม่นับยอด
                                </span>
                              ) : (
                                balanceInput("remainingDays", draft.remainingDays)
                              )}
                              {(validation.invalid || serverInvalid) && (
                                <div
                                  className={`mt-1 max-w-40 text-[10px] ${
                                    validationAttempted || serverInvalid
                                      ? "font-medium text-rose-700"
                                      : "text-amber-700"
                                  }`}
                                >
                                  {validationMessage}
                                </div>
                              )}
                              {!validation.invalid && !draft.countOnly && (
                                <div className="mt-1 text-[10px] text-slate-500">
                                  สิทธิ์ {draft.rankOptions.find((rank) => String(rank.id) === draft.rankId)?.maxDays ?? "—"}
                                  {balance.carryOverDays > 0 && ` + สะสม ${balance.carryOverDays}`} วัน
                                </div>
                              )}
                            </td>
                            <td className="border-r border-slate-200 px-2 py-2">
                              {balanceInput("usedDays", draft.usedDays)}
                              <div className="mt-1 text-[10px] text-slate-500">
                                รออนุมัติ {balance.pendingDays ?? 0}
                              </div>
                            </td>
                          </Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                แก้ไขเฉพาะค่าที่ต้องการ ระบบจะไม่เปลี่ยนยอดรออนุมัติ
              </p>
              <button
                type="button"
                onClick={handleSaveBalanceChanges}
                disabled={saving || !balanceChanges.length}
                className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : `บันทึก ${balanceChanges.length} รายการ`}
              </button>
            </div>
          </div>
        )}
      </Panel>

      <Panel className="border-amber-200 p-5 sm:p-6">
        <details>
          <summary className="cursor-pointer text-lg font-semibold text-slate-900">
            รีเซ็ตและจัดการข้อมูลปีวันลา
          </summary>
          <div className="mt-4 space-y-5 border-t border-slate-200 pt-4">
            <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <FaExclamationTriangle className="mt-0.5 shrink-0" />
              <p>
                การรีเซ็ตหรือลบข้อมูลอาจกระทบยอดวันลาของผู้ใช้ทั้งระบบ
                ใช้เมื่อจำเป็นเท่านั้นและตรวจสอบปีให้ถูกต้องก่อนดำเนินการ
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold">ปีที่ระบบใช้งาน</h3>
                <p className="mt-2 text-sm text-slate-600">
                  ปีงบประมาณ: <strong>{fiscalYear.fiscalYear || "-"}</strong>
                </p>
                <p className="text-sm text-slate-600">
                  ปีปฏิทิน: <strong>{fiscalYear.currentYear || "-"}</strong>
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold">แก้ไขปีที่ตั้งค่าผิด</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    aria-label="ปีงบประมาณ"
                    placeholder="ปีงบฯ"
                    value={yearInputs.fiscalYear}
                    onChange={(event) =>
                      setYearInputs((previous) => ({
                        ...previous,
                        fiscalYear: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    aria-label="ปีปฏิทิน"
                    placeholder="ปีปฏิทิน"
                    value={yearInputs.currentYear}
                    onChange={(event) =>
                      setYearInputs((previous) => ({
                        ...previous,
                        currentYear: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdateFiscalYear}
                  disabled={yearSaving}
                  className="mt-3 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {yearSaving ? "กำลังบันทึก..." : "บันทึกปี"}
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold">ปีที่มีข้อมูลวันลา</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {availableYears.map((item) => (
                    <span key={item.year} className="rounded bg-slate-100 px-2 py-1 text-xs">
                      {item.year} ({item.count})
                    </span>
                  ))}
                  {!availableYears.length && (
                    <span className="text-sm text-slate-500">ไม่มีข้อมูล</span>
                  )}
                </div>
              </div>
            </div>
            {isSuperAdmin ? (
              <div className="grid gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-rose-900">รีเซ็ตยอดวันลาทั้งระบบ</h3>
                  <p className="mt-1 text-sm text-rose-800">
                    สร้างยอดใหม่ตาม Rank และกฎทบยอดเดิม ผู้ใช้ที่ไม่ใช่ SUPER_ADMIN
                    ไม่มีสิทธิ์ดำเนินการนี้
                  </p>
                  <button
                    type="button"
                    onClick={handleResetLeaveBalance}
                    disabled={resetLoading}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <FaSync />
                    {resetLoading ? "กำลังรีเซ็ต..." : "รีเซ็ตยอดวันลา"}
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-rose-900">ลบข้อมูลยอดวันลาตามปี</h3>
                  <p className="mt-1 text-sm text-rose-800">
                    ลบข้อมูลทั้งปีอย่างถาวร ใช้เฉพาะเมื่อต้องการล้างข้อมูลที่ผิดพลาด
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      placeholder="ปี ค.ศ."
                      value={deleteYearInput}
                      onChange={(event) => setDeleteYearInput(event.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteLeaveBalanceByYear}
                      disabled={deleteLoading || !deleteYearInput}
                      className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {deleteLoading ? "กำลังลบ..." : "ลบข้อมูลปี"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                การรีเซ็ตและลบข้อมูลทั้งระบบสงวนสิทธิ์สำหรับ SUPER_ADMIN เท่านั้น
              </p>
            )}
          </div>
        </details>
      </Panel>
    </div>
  );
}
