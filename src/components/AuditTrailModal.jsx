import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaHistory } from "react-icons/fa";
import { API } from "../utils/api";

// แปลชื่อ action ให้อ่านออก (มาตรฐานเดียวกับหน้า Audit Log เต็ม)
const ACTION_TH = {
  CREATE: "สร้าง",
  "Create Request": "สร้างคำขอลา", // action รูปแบบเก่าที่ยังไม่ normalize
  UPDATE: "แก้ไข",
  DELETE: "ลบ",
  APPROVE: "อนุมัติ",
  REJECT: "ปฏิเสธ",
  CANCEL: "ยกเลิก",
  ROLE_GRANT: "เพิ่มบทบาท",
  ROLE_REVOKE: "ถอนบทบาท",
  SELF_APPROVE: "อนุมัติคำขอของตนเอง",
  ASSIGN_HEAD: "แต่งตั้งหัวหน้าสาขา",
  APPROVER_ASSIGN: "แต่งตั้งผู้อนุมัติ",
  APPROVER_VACATE: "ถอนผู้อนุมัติ",
  IMPORT: "นำเข้าข้อมูล",
  LEAVE_REQUEST_REJECTED: "ปฏิเสธคำขอลา",
};

const ACTION_CLS = {
  CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Create Request": "bg-emerald-50 text-emerald-700 border-emerald-200",
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ROLE_GRANT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  APPROVER_ASSIGN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPDATE: "bg-sky-50 text-sky-700 border-sky-200",
  IMPORT: "bg-sky-50 text-sky-700 border-sky-200",
  DELETE: "bg-rose-50 text-rose-700 border-rose-200",
  REJECT: "bg-rose-50 text-rose-700 border-rose-200",
  LEAVE_REQUEST_REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  ROLE_REVOKE: "bg-rose-50 text-rose-700 border-rose-200",
  APPROVER_VACATE: "bg-rose-50 text-rose-700 border-rose-200",
  CANCEL: "bg-slate-100 text-slate-600 border-slate-200",
};

const fullName = (u) =>
  u ? `${u.prefixName || ""}${u.firstName || ""} ${u.lastName || ""}`.trim() : "ระบบ";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/**
 * โมดัลแสดง "ประวัติการเปลี่ยนแปลง" ของ entity หนึ่ง ๆ (ผู้ใช้/ใบลา)
 * รับ url แบบ relative แล้วดึงผ่าน API (baseURL ถูกตั้งไว้แล้ว) — คืน { data: [...] }
 */
export default function AuditTrailModal({ title, subtitle, url, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await API.get(url);
        const data = res?.data?.data || [];
        // เรียงใหม่สุดขึ้นก่อนเสมอ (บาง endpoint ส่งเรียงเก่า->ใหม่)
        const sorted = [...(Array.isArray(data) ? data : [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        if (alive) setLogs(sorted);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 font-kanit text-slate-900"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[70vh] max-h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{title}</h3>
            {subtitle && (
              <p className="truncate text-xs text-slate-500">{subtitle}</p>
            )}
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
          ) : error ? (
            <p className="py-10 text-center text-sm text-rose-500">
              โหลดประวัติไม่สำเร็จ
            </p>
          ) : logs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
              <FaHistory className="h-6 w-6" />
              <p className="text-sm">ยังไม่มีประวัติการเปลี่ยนแปลง</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        ACTION_CLS[log.action] ||
                        "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {ACTION_TH[log.action] || log.action}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {fmt(log.createdAt)}
                    </span>
                  </div>
                  {log.details && (
                    <p className="mt-1.5 break-words text-sm text-slate-700">
                      {log.details}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    โดย {fullName(log.user)}
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

AuditTrailModal.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  url: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
