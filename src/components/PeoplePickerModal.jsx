import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FaSearch, FaTimes } from "react-icons/fa";

const fullName = (u) =>
  u ? [u.prefixName, u.firstName, u.lastName].filter(Boolean).join(" ").trim() : "";

const initial = (u) => (u?.firstName || u?.email || "?").trim().charAt(0);

// สีพื้นอักษรย่อ — คงที่ต่อคน (ไม่ได้สื่อความหมาย)
const TONES = [
  "bg-brand-50 text-brand-700",
  "bg-sky-50 text-sky-700",
  "bg-emerald-50 text-emerald-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
];

/**
 * โมดัลค้นหา-แล้วเลือกผู้ใช้ (overlay ระดับบนสุด z-[60] ไม่ถูก overflow ของ modal อื่นตัด)
 * ใช้รูปแบบเดียวกับตัวเลือกผู้อนุมัติในหน้าจัดการผู้อนุมัติ
 */
export default function PeoplePickerModal({
  title,
  subtitle,
  users,
  currentId,
  onPick,
  onClose,
  emptyText = "ไม่พบผู้ใช้งานที่ค้นหา",
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = Array.isArray(users) ? users : [];
    if (!term) return base.slice(0, 100);
    return base
      .filter((u) => {
        return (
          fullName(u).toLowerCase().includes(term) ||
          (u.email || "").toLowerCase().includes(term) ||
          (u.department?.name || "").toLowerCase().includes(term) ||
          (u.position || "").toLowerCase().includes(term)
        );
      })
      .slice(0, 100);
  }, [users, q]);

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
        e.preventDefault();
        const u = list[active];
        if (u) onPick(u);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list, active, onPick, onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 font-kanit text-slate-900"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[70vh] max-h-[560px] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{title}</h3>
            {subtitle && (
              <p className="truncate text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
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
            const isCurrent = currentId != null && u.id === currentId;
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onPick(u)}
                  onMouseEnter={() => setActive(idx)}
                  className={`flex w-full items-start gap-3 px-5 py-3 text-left transition ${
                    idx === active ? "bg-brand-50" : "hover:bg-brand-50/60"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      TONES[u.id % TONES.length]
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
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {u.position || "ไม่ระบุตำแหน่ง"} · {u.department?.name || "ไม่ระบุสาขา"}
                    </p>
                    {u.email && (
                      <p className="truncate text-[11px] text-slate-400">{u.email}</p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="flex h-full flex-col items-center justify-center gap-2 py-10 text-slate-400">
              <FaSearch className="h-6 w-6" />
              <p className="text-sm">{emptyText}</p>
            </li>
          )}
        </ul>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-[11px] text-slate-500">
          <span>
            แสดง {list.length} จาก {(users || []).length} คน
            {list.length === 100 && " (จำกัด 100 รายการแรก)"}
          </span>
          <span className="hidden sm:inline">↑ ↓ เลื่อน · Enter เลือก · Esc ปิด</span>
        </div>
      </div>
    </div>
  );
}

PeoplePickerModal.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  users: PropTypes.array,
  currentId: PropTypes.number,
  onPick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  emptyText: PropTypes.string,
};
