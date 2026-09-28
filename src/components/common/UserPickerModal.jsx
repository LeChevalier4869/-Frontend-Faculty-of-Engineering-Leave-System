/* eslint-disable react/prop-types */
/**
 * ตัวเลือกผู้ใช้แบบ modal (ค้นหา + คีย์ลัด ↑ ↓ Enter Esc)
 * ใช้ร่วมกันระหว่างหน้าจัดการผู้อนุมัติ และหน้าจัดการแผนก (เลือกหัวหน้าสาขา)
 * - preferredDepartmentId: ถ้าระบุ จะแสดงเฉพาะคนในสาขานั้น (+ ผู้ดำรงตำแหน่งปัจจุบัน)
 */
import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const fullName = (u) =>
  u ? `${u.prefixName || ""}${u.firstName || ""} ${u.lastName || ""}`.trim() : "";

/* ---------------- ตัวเลือกผู้ใช้ ---------------- */

/** บทบาทที่เกี่ยวกับการอนุมัติ — ใช้เตือนว่าคนนี้ถือตำแหน่งอะไรอยู่แล้ว */
const APPROVER_ROLE_LABEL = {
  APPROVER_1: "หัวหน้าสาขา",
  APPROVER_2: "สารบรรณคณะ",
  APPROVER_3: "หัวหน้าสำนักงานคณบดี",
  APPROVER_4: "รองคณบดีฝ่ายบริหาร",
  APPROVER_5: "คณบดี",
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

export default function UserPickerModal({
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

  // เลือกหัวหน้าสาขา: แสดงเฉพาะคนในสาขานั้น (รวมหัวหน้าปัจจุบันไว้ด้วยเสมอ)
  const pool = useMemo(() => {
    if (preferredDepartmentId == null) return users;
    return users.filter(
      (u) =>
        (u.department?.id ?? u.departmentId) === preferredDepartmentId ||
        u.id === current?.id
    );
  }, [users, preferredDepartmentId, current]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = pool.filter((u) => {
      if (!term) return true;
      return (
        fullName(u).toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.department?.name || "").toLowerCase().includes(term) ||
        (u.position || "").toLowerCase().includes(term)
      );
    });
    return filtered.slice(0, 100);
  }, [pool, q]);

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
              {preferredDepartmentId != null && pool.length === 0 ? (
                <>
                  <p className="text-sm">ยังไม่มีบุคลากรในสาขานี้</p>
                  <p className="text-xs">เพิ่มบุคลากรเข้าสาขาก่อน จึงจะเลือกเป็นหัวหน้าสาขาได้</p>
                </>
              ) : (
                <>
                  <p className="text-sm">ไม่พบผู้ใช้งานที่ค้นหา</p>
                  <p className="text-xs">ลองค้นด้วยชื่อ อีเมล หรือตำแหน่ง</p>
                </>
              )}
            </li>
          )}
        </ul>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-[11px] text-slate-500">
          <span>
            แสดง {list.length} จาก {pool.length} คน
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
