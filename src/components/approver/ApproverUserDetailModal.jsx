import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaPhone, FaEnvelope, FaIdBadge } from "react-icons/fa";
import { API } from "../../utils/api";
import {
  isSelfServiceLeaveType,
  filterLeaveBalancesLatestYear,
  formatRemainingDays,
} from "../../utils/leavePolicy";

const STATUS = {
  PENDING: { label: "รออนุมัติ", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "อนุมัติแล้ว", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "ถูกปฏิเสธ", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  CANCELLED: { label: "ยกเลิก", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })
    : "-";

const dateRange = (a, b) => {
  const s = fmt(a);
  const e = fmt(b);
  return s === e ? s : `${s} – ${e}`;
};

/**
 * โมดัลรายละเอียดผู้ใช้สำหรับผู้อนุมัติ — โปรไฟล์ + ยอดวันลาคงเหลือ (3 ประเภทที่ลาเองได้)
 * + ประวัติการลาทั้งหมด (กดดูรายละเอียดใบลาได้)
 */
export default function ApproverUserDetailModal({ userId, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await API.get(`/approver/oversight/users/${userId}`);
        if (alive) setData(res?.data?.data || null);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const profile = data?.profile;
  // ยอดวันลาปีล่าสุด เฉพาะ 3 ประเภทที่ผู้ใช้ลาเองได้ในระบบ
  const balances = filterLeaveBalancesLatestYear(data?.balances || []).filter((b) =>
    isSelfServiceLeaveType(b.leaveType?.name)
  );
  const history = data?.history || [];
  const historyTotal = data?.historyTotal ?? history.length;
  const historyTruncated = historyTotal > history.length;

  const openLeave = (id) => {
    onClose();
    navigate(`/leave/${id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 font-kanit text-slate-900"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold">รายละเอียดผู้ใช้งาน</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
          ) : error || !profile ? (
            <p className="py-12 text-center text-sm text-rose-500">โหลดข้อมูลไม่สำเร็จ</p>
          ) : (
            <div className="space-y-5">
              {/* โปรไฟล์ */}
              <div className="flex items-start gap-4">
                {profile.profilePicturePath ? (
                  <img
                    src={profile.profilePicturePath}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700 ring-1 ring-brand-100">
                    {(profile.firstName || "?").charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-slate-900">{profile.fullName}</p>
                  <p className="text-sm text-slate-500">
                    {profile.position || "ไม่ระบุตำแหน่ง"} · {profile.department?.name || "ไม่ระบุสาขา"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {profile.personnelType?.name && (
                      <span className="inline-flex items-center gap-1">
                        <FaIdBadge className="text-slate-400" />
                        {profile.personnelType.name}
                      </span>
                    )}
                    {profile.phone && (
                      <span className="inline-flex items-center gap-1">
                        <FaPhone className="text-slate-400" />
                        {profile.phone}
                      </span>
                    )}
                    {profile.email && (
                      <span className="inline-flex items-center gap-1">
                        <FaEnvelope className="text-slate-400" />
                        {profile.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ยอดวันลาคงเหลือ */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  ยอดวันลาคงเหลือ (ปีงบประมาณล่าสุด)
                </p>
                {balances.length === 0 ? (
                  <p className="text-sm text-slate-400">ยังไม่มีข้อมูลยอดวันลา</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {balances.map((b) => {
                      const rd = formatRemainingDays(b.remainingDays);
                      return (
                        <div
                          key={b.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                        >
                          <p className="truncate text-xs text-slate-500">{b.leaveType?.name}</p>
                          <p className={`mt-1 text-lg font-semibold ${rd.className || "text-brand-700"}`}>
                            {rd.text}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ใช้ไป {b.usedDays ?? 0} · รออนุมัติ {b.pendingDays ?? 0}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ประวัติการลา */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  ประวัติการลา ({historyTotal})
                  {historyTruncated && (
                    <span className="ml-1 normal-case text-slate-400">
                      — แสดง {history.length} รายการล่าสุด
                    </span>
                  )}
                </p>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400">ยังไม่มีประวัติการลา</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2 font-medium">ประเภท</th>
                          <th className="px-3 py-2 font-medium">ช่วงวันลา</th>
                          <th className="px-3 py-2 text-center font-medium">วัน</th>
                          <th className="px-3 py-2 font-medium">สถานะ</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map((h) => {
                          const st = STATUS[h.status] || { label: h.status, cls: "bg-slate-100 text-slate-600 border-slate-200" };
                          return (
                            <tr key={h.id} className="hover:bg-slate-50/60">
                              <td className="px-3 py-2 text-slate-700">{h.leaveType?.name || "-"}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                                {dateRange(h.startDate, h.endDate)}
                              </td>
                              <td className="px-3 py-2 text-center tabular-nums text-slate-600">
                                {h.thisTimeDays ?? "-"}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                                  {st.label}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  onClick={() => openLeave(h.id)}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                                >
                                  รายละเอียด
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ApproverUserDetailModal.propTypes = {
  userId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};
