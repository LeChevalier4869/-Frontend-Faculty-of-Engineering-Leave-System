/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "../../../utils/alert";
import {
  FaUserShield,
  FaSearch,
  FaExchangeAlt,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserSlash,
  FaHistory,
} from "react-icons/fa";
import { API, apiEndpoints } from "../../../utils/api";

/** ลำดับขั้นการอนุมัติของคณะ (ระดับ 1 = หัวหน้าสาขา จัดการแยกด้านล่าง) */
const LEVEL_HINT = {
  2: "ตรวจสอบเอกสารก่อนส่งต่อสายอนุมัติ",
  3: "กลั่นกรองในระดับคณะ",
  4: "อนุมัติระดับรองคณบดี",
  5: "อนุมัติขั้นสุดท้าย",
};

const fullName = (u) =>
  u ? `${u.prefixName || ""}${u.firstName || ""} ${u.lastName || ""}`.trim() : "";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function ApproverManageContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [deptSearch, setDeptSearch] = useState("");

  // ตัวเลือกคน: { mode: "level"|"department", level?, department?, current? }
  const [picker, setPicker] = useState(null);
  // ประวัติผู้ดำรงตำแหน่งของขั้นคณะ: { level, label, loading, items } | null
  const [history, setHistory] = useState(null);

  // เปิดดูประวัติผู้ดำรงตำแหน่งของขั้นคณะนั้น ๆ
  const openHistory = useCallback(async (lv) => {
    setHistory({ level: lv.level, label: lv.label, loading: true, items: [] });
    try {
      const res = await API.get(apiEndpoints.approverPositionHistory(lv.level));
      setHistory({
        level: lv.level,
        label: lv.label,
        loading: false,
        items: res?.data?.data || [],
      });
    } catch {
      setHistory({ level: lv.level, label: lv.label, loading: false, items: [] });
    }
  }, []);

  const loadAll = useCallback(async () => {
    const [posRes, deptRes, userRes] = await Promise.all([
      API.get(apiEndpoints.approverPositions).catch(() => null),
      API.get(apiEndpoints.departmentsAdmin).catch(() => null),
      API.get(apiEndpoints.userLanding).catch(() => null),
    ]);
    setLevels(posRes?.data?.data || []);
    setDepartments(deptRes?.data?.data || []);
    setUsers(userRes?.data?.user || userRes?.data?.data || []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAll();
      setLoading(false);
    })();
  }, [loadAll]);

  /** จำนวนพนักงานต่อสาขา (ใช้ชี้ว่าสาขาไหน "เจ็บจริง" ถ้าไม่มีหัวหน้า) */
  const staffCount = useMemo(() => {
    const map = new Map();
    for (const u of users) {
      const id = u.department?.id ?? u.departmentId;
      if (id != null) map.set(id, (map.get(id) || 0) + 1);
    }
    return map;
  }, [users]);

  const visibleDepartments = useMemo(() => {
    const q = deptSearch.trim().toLowerCase();
    const list = [...departments].sort((a, b) =>
      a.name.localeCompare(b.name, "th")
    );
    if (!q) return list;
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        fullName(d.head).toLowerCase().includes(q)
    );
  }, [departments, deptSearch]);

  const problemCount = useMemo(() => {
    const noHead = departments.filter(
      (d) => !d.head && (staffCount.get(d.id) || 0) > 0
    ).length;
    const outOfSync = levels.filter((l) => !l.inSync).length;
    return noHead + outOfSync;
  }, [departments, levels, staffCount]);

  // ---------------- actions ----------------

  const assignLevel = async (level, user) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการแต่งตั้ง?",
      html: `แต่งตั้ง <b>${fullName(user)}</b> เป็น<b>${level.label}</b><br/><span style="font-size:13px;color:#64748b">ผู้ดำรงตำแหน่งเดิมจะถูกปลดโดยอัตโนมัติ</span>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "แต่งตั้ง",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#7A1B22",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      await API.post(apiEndpoints.approverPositions, {
        level: level.level,
        userId: user.id,
      });
      await loadAll();
      setPicker(null);
      Swal.fire("สำเร็จ", `แต่งตั้ง${level.label}เรียบร้อยแล้ว`, "success");
    } catch (err) {
      Swal.fire(
        "ไม่สำเร็จ",
        err.response?.data?.message || "ไม่สามารถแต่งตั้งได้",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const vacateLevel = async (level) => {
    const confirm = await Swal.fire({
      title: `ปลด${level.label}?`,
      html: `<b>${fullName(level.holder)}</b> จะถูกถอนสิทธิ์อนุมัติในระดับนี้<br/><span style="font-size:13px;color:#b91c1c">ระหว่างที่ยังไม่มีผู้รับผิดชอบ คำขอลาจะติดค้างที่ขั้นนี้</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ปลดออก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      await API.delete(apiEndpoints.approverPositionByLevel(level.level));
      await loadAll();
      Swal.fire("สำเร็จ", "ปลดผู้ดำรงตำแหน่งเรียบร้อยแล้ว", "success");
    } catch (err) {
      Swal.fire(
        "ไม่สำเร็จ",
        err.response?.data?.message || "ไม่สามารถปลดได้",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const assignHead = async (department, user) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการแต่งตั้ง?",
      html: `แต่งตั้ง <b>${fullName(user)}</b> เป็นหัวหน้า<b>${department.name}</b>${
        department.head
          ? `<br/><span style="font-size:13px;color:#64748b">แทน ${fullName(department.head)}</span>`
          : ""
      }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "แต่งตั้ง",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#7A1B22",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      await API.post(apiEndpoints.assignDepartmentHead, {
        departmentId: department.id,
        headId: user.id,
      });
      await loadAll();
      setPicker(null);
      Swal.fire("สำเร็จ", "แต่งตั้งหัวหน้าสาขาเรียบร้อยแล้ว", "success");
    } catch (err) {
      Swal.fire(
        "ไม่สำเร็จ",
        err.response?.data?.message || "ไม่สามารถแต่งตั้งได้",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePick = (user) => {
    if (!picker) return;
    if (picker.mode === "level") assignLevel(picker.level, user);
    else assignHead(picker.department, user);
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-500">
        กำลังโหลดข้อมูลผู้อนุมัติ...
      </div>
    );
  }

  return (
    <div className="font-kanit text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการผู้อนุมัติ
              </h1>
              <p className="text-sm text-slate-600">
                กำหนดว่าใครรับผิดชอบการอนุมัติในแต่ละขั้น
                ทั้งระดับคณะและหัวหน้าสาขา
              </p>
            </div>
            {problemCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                <FaExclamationTriangle />
                มี {problemCount} รายการที่ต้องตรวจสอบ
              </span>
            )}
          </div>
        </div>

        {/* ---------- ส่วน A: ระดับคณะ ---------- */}
        <section className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-lg font-semibold">ผู้อนุมัติระดับคณะ</h2>
            <span className="text-xs text-slate-500">
              แต่ละตำแหน่งมีผู้รับผิดชอบได้ 1 คน
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {levels.map((lv) => (
              <article
                key={lv.level}
                className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${
                  lv.inSync ? "border-slate-200" : "border-amber-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      ขั้นที่ {lv.level}
                    </p>
                    <h3 className="text-base font-semibold">{lv.label}</h3>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <FaUserShield />
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {LEVEL_HINT[lv.level] || ""}
                </p>

                <div className="mt-3 flex-1 rounded-xl bg-slate-50 p-3">
                  {lv.holder ? (
                    <>
                      <p className="truncate text-sm font-medium text-slate-800">
                        {fullName(lv.holder)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {lv.holder.email}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        แต่งตั้งเมื่อ {formatDate(lv.position?.appointDate)}
                      </p>
                    </>
                  ) : (
                    <p className="py-2 text-center text-sm text-rose-600">
                      ยังไม่มีผู้รับผิดชอบ
                    </p>
                  )}
                </div>

                {!lv.inSync && (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-700">
                    <FaExclamationTriangle className="mt-0.5 shrink-0" />
                    <span>
                      ทะเบียนกับสิทธิ์จริงไม่ตรงกัน (ผู้ถือสิทธิ์{" "}
                      {lv.roleHolders.length} คน) — แต่งตั้งใหม่เพื่อแก้ไข
                    </span>
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setPicker({ mode: "level", level: lv, current: lv.holder })}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    <FaExchangeAlt />
                    {lv.holder ? "เปลี่ยน" : "แต่งตั้ง"}
                  </button>
                  <button
                    onClick={() => openHistory(lv)}
                    title="ประวัติผู้ดำรงตำแหน่ง"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <FaHistory />
                  </button>
                  {lv.holder && (
                    <button
                      onClick={() => vacateLevel(lv)}
                      disabled={saving}
                      title="ปลดผู้ดำรงตำแหน่ง"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                    >
                      <FaUserSlash />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- ส่วน B: หัวหน้าสาขา ---------- */}
        <section className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                หัวหน้าสาขา (ผู้อนุมัติขั้นที่ 1)
              </h2>
              <p className="text-xs text-slate-500">
                หัวหน้าสาขาคือผู้อนุมัติคนแรกของพนักงานในสาขานั้น — 1 สาขามีหัวหน้าได้ 1 คน
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                placeholder="ค้นหาสาขา หรือชื่อหัวหน้า..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          {/* Desktop: ตาราง */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse bg-white text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="w-[30%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em]">
                      สาขา
                    </th>
                    <th className="w-[12%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em]">
                      พนักงาน
                    </th>
                    <th className="w-[28%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em]">
                      หัวหน้าสาขา
                    </th>
                    <th className="w-[18%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em]">
                      สถานะ
                    </th>
                    <th className="w-[12%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em]">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDepartments.map((d, idx) => {
                    const staff = staffCount.get(d.id) || 0;
                    const risky = !d.head && staff > 0;
                    return (
                      <tr
                        key={d.id}
                        className={`border-t border-slate-100 transition-colors hover:bg-brand-50/40 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        }`}
                      >
                        <td className="truncate px-4 py-3 font-medium" title={d.name}>
                          {d.name}
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums text-slate-600">
                          {staff}
                        </td>
                        <td className="truncate px-4 py-3">
                          {d.head ? (
                            fullName(d.head)
                          ) : (
                            <span className="text-slate-400">— ยังไม่กำหนด</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {risky ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                              <FaExclamationTriangle className="h-3 w-3" />
                              อนุมัติไม่ได้
                            </span>
                          ) : d.head ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              <FaCheckCircle className="h-3 w-3" />
                              พร้อมใช้งาน
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              ไม่มีพนักงาน
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              setPicker({
                                mode: "department",
                                department: d,
                                current: d.head,
                              })
                            }
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-600 disabled:opacity-60"
                          >
                            <FaExchangeAlt className="h-3 w-3" />
                            {d.head ? "เปลี่ยน" : "กำหนด"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {visibleDepartments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-sm text-slate-500"
                      >
                        ไม่พบสาขาที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: การ์ด (ตาราง 5 คอลัมน์แคบเกินไปบนจอมือถือ) */}
          <div className="space-y-3 md:hidden">
            {visibleDepartments.map((d) => {
              const staff = staffCount.get(d.id) || 0;
              const risky = !d.head && staff > 0;
              return (
                <div
                  key={d.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${
                    risky ? "border-rose-200" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 font-medium text-slate-800">
                      {d.name}
                    </p>
                    {risky ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                        <FaExclamationTriangle className="h-2.5 w-2.5" />
                        อนุมัติไม่ได้
                      </span>
                    ) : d.head ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <FaCheckCircle className="h-2.5 w-2.5" />
                        พร้อม
                      </span>
                    ) : null}
                  </div>

                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-slate-500">หัวหน้าสาขา:</dt>
                      <dd className="min-w-0 flex-1 truncate text-slate-800">
                        {d.head ? fullName(d.head) : "— ยังไม่กำหนด"}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-slate-500">พนักงาน:</dt>
                      <dd className="tabular-nums text-slate-800">{staff} คน</dd>
                    </div>
                  </dl>

                  <button
                    onClick={() =>
                      setPicker({
                        mode: "department",
                        department: d,
                        current: d.head,
                      })
                    }
                    disabled={saving}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-600 disabled:opacity-60"
                  >
                    <FaExchangeAlt className="h-3 w-3" />
                    {d.head ? "เปลี่ยนหัวหน้าสาขา" : "กำหนดหัวหน้าสาขา"}
                  </button>
                </div>
              );
            })}
            {visibleDepartments.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                ไม่พบสาขาที่ค้นหา
              </div>
            )}
          </div>
        </section>
      </div>

      {picker && (
        <UserPickerModal
          title={
            picker.mode === "level"
              ? `เลือกผู้รับผิดชอบ: ${picker.level.label}`
              : `เลือกหัวหน้าสาขา: ${picker.department.name}`
          }
          users={users}
          current={picker.current}
          preferredDepartmentId={
            picker.mode === "department" ? picker.department.id : null
          }
          departments={departments}
          saving={saving}
          onPick={handlePick}
          onClose={() => setPicker(null)}
        />
      )}

      {history && (
        <PositionHistoryModal
          history={history}
          onClose={() => setHistory(null)}
        />
      )}
    </div>
  );
}

/* ---------------- ประวัติผู้ดำรงตำแหน่งระดับคณะ ---------------- */

function PositionHistoryModal({ history, onClose }) {
  const { label, loading, items } = history;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[70vh] max-h-[560px] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">
              ประวัติผู้ดำรงตำแหน่ง
            </h3>
            <p className="truncate text-xs text-slate-500">{label}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-400">
              กำลังโหลดประวัติ...
            </p>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <FaHistory className="h-6 w-6" />
              <p className="text-sm">ยังไม่มีประวัติการดำรงตำแหน่ง</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className={`rounded-xl border p-3 ${
                    it.isActive
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {fullName(it.user)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {it.user?.position || "ไม่ระบุตำแหน่ง"} ·{" "}
                        {it.user?.department?.name || "ไม่ระบุสาขา"}
                      </p>
                    </div>
                    {it.isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <FaCheckCircle className="h-2.5 w-2.5" />
                        ปัจจุบัน
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {formatDate(it.appointDate)} —{" "}
                    {it.isActive ? "ปัจจุบัน" : formatDate(it.endDate) || "-"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- ตัวเลือกผู้ใช้ ---------------- */

/** บทบาทที่เกี่ยวกับการอนุมัติ — ใช้เตือนว่าคนนี้ถือตำแหน่งอะไรอยู่แล้ว */
const APPROVER_ROLE_LABEL = {
  APPROVER_1: "หัวหน้าสาขา",
  VERIFIER: "ผู้ตรวจสอบ",
  APPROVER_2: "สารบรรณคณะ",
  APPROVER_3: "รองคณบดี",
  APPROVER_4: "คณบดี",
};

/** สีพื้นของอักษรย่อ — กระจายตาม id ให้คงที่ต่อคน (ไม่ใช่สื่อความหมาย) */
const AVATAR_TONES = [
  "bg-brand-50 text-brand-700",
  "bg-sky-50 text-sky-700",
  "bg-emerald-50 text-emerald-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
];

const initial = (u) => (u?.firstName || u?.email || "?").trim().charAt(0);

function UserPickerModal({
  title,
  users,
  current,
  preferredDepartmentId,
  departments,
  saving,
  onPick,
  onClose,
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  /** map: userId -> ชื่อสาขาที่เป็นหัวหน้าอยู่ (ใช้กันตั้งซ้อน 2 สาขา) */
  const headOf = useMemo(() => {
    const m = new Map();
    for (const d of departments || []) {
      if (d.head?.id) m.set(d.head.id, d.name);
    }
    return m;
  }, [departments]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = users.filter((u) => {
      if (!term) return true;
      return (
        fullName(u).toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.department?.name || "").toLowerCase().includes(term) ||
        (u.position || "").toLowerCase().includes(term)
      );
    });
    // คนในสาขานั้นขึ้นก่อน เพื่อให้เลือกหัวหน้าได้ตรงกลุ่ม
    if (!preferredDepartmentId) return filtered.slice(0, 100);
    return [...filtered]
      .sort((a, b) => {
        const av = (a.department?.id ?? a.departmentId) === preferredDepartmentId ? 0 : 1;
        const bv = (b.department?.id ?? b.departmentId) === preferredDepartmentId ? 0 : 1;
        return av - bv;
      })
      .slice(0, 100);
  }, [users, q, preferredDepartmentId]);

  useEffect(() => setActive(0), [q]);

  // คีย์ลัด: ↑ ↓ เลื่อน, Enter เลือก, Esc ปิด
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, list.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const u = list[active];
        if (u && current?.id !== u.id && !saving) onPick(u);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list, active, current, saving, onPick, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ความสูงคงที่ ไม่ยืด-หดตามผลค้นหา เพื่อไม่ให้ modal กระตุกระหว่างพิมพ์ */}
      <div className="flex h-[70vh] max-h-[560px] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="truncate pr-2 text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-100 px-5 py-3">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาชื่อ อีเมล ตำแหน่ง หรือสาขา..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
          {list.map((u, idx) => {
            const isCurrent = current?.id === u.id;
            const inDept =
              preferredDepartmentId != null &&
              (u.department?.id ?? u.departmentId) === preferredDepartmentId;
            const roles = (u.userRoles || [])
              .map((ur) => APPROVER_ROLE_LABEL[ur.role?.name])
              .filter(Boolean);
            // เตือนเมื่อกำลังเลือกหัวหน้าสาขา แต่คนนี้เป็นหัวหน้าสาขาอื่นอยู่แล้ว
            const headsOther =
              preferredDepartmentId != null &&
              headOf.has(u.id) &&
              !inDept &&
              headOf.get(u.id);

            return (
              <li key={u.id}>
                <button
                  onClick={() => !isCurrent && !saving && onPick(u)}
                  onMouseEnter={() => setActive(idx)}
                  disabled={isCurrent || saving}
                  className={`flex w-full items-start gap-3 px-5 py-3 text-left transition ${
                    isCurrent
                      ? "cursor-not-allowed bg-slate-50"
                      : idx === active
                        ? "bg-brand-50"
                        : "hover:bg-brand-50/60"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      AVATAR_TONES[u.id % AVATAR_TONES.length]
                    }`}
                  >
                    {initial(u)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {fullName(u)}
                      </p>
                      {isCurrent && (
                        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                          ปัจจุบัน
                        </span>
                      )}
                      {!isCurrent && inDept && (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                          ในสาขา
                        </span>
                      )}
                    </div>

                    <p className="truncate text-xs text-slate-500">
                      {u.position || "ไม่ระบุตำแหน่ง"} · {u.department?.name || "ไม่ระบุสาขา"}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">{u.email}</p>

                    {(roles.length > 0 || headsOther) && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {roles.map((r) => (
                          <span
                            key={r}
                            className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600"
                          >
                            {r}
                          </span>
                        ))}
                        {headsOther && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                            <FaExclamationTriangle className="h-2.5 w-2.5" />
                            เป็นหัวหน้า {headsOther} อยู่แล้ว
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="flex h-full flex-col items-center justify-center gap-2 py-10 text-slate-400">
              <FaSearch className="h-6 w-6" />
              <p className="text-sm">ไม่พบผู้ใช้งานที่ค้นหา</p>
              <p className="text-xs">ลองค้นด้วยชื่อ อีเมล หรือชื่อสาขา</p>
            </li>
          )}
        </ul>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-[11px] text-slate-500">
          <span>
            แสดง {list.length} จาก {users.length} คน
            {list.length === 100 && " (จำกัด 100 รายการแรก)"}
          </span>
          <span className="hidden sm:inline">
            ↑ ↓ เลื่อน · Enter เลือก · Esc ปิด
          </span>
        </div>
      </div>
    </div>
  );
}
