import { useState, useEffect } from "react";
import Swal from "../../utils/alert";
import { API, apiEndpoints } from "../../utils/api";

/* eslint-disable react/prop-types */
const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const SYSTEM_ROLES = [
  "USER", "ADMIN", "SUPER_ADMIN",
  "VERIFIER", "APPROVER_1", "APPROVER_2", "APPROVER_3", "APPROVER_4"
];

// หน้านี้เป็น "ดูอย่างเดียว" — แสดงรายการบทบาทในระบบ ไม่อนุญาตให้เพิ่ม/แก้ไข/ลบ
// (บทบาทเป็นข้อมูลระดับระบบ การเปลี่ยนแปลงกระทบสิทธิ์ผู้ใช้ทั้งระบบ)
const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleApiError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
      Swal.fire("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่", "warning").then(
        () => (window.location.href = "/login")
      );
    } else {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get(apiEndpoints.getRoles);
      setRoles(res.data.roleList || res.data.data || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-brand-700">
              Admin View
            </span>
          </div>
          <div className="w-full flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการบทบาท (Role)
              </h1>
              <p className="text-sm text-slate-600">
                ดูรายการบทบาทและสิทธิ์ในระบบ
              </p>
            </div>
            <div className="text-xs text-slate-500">
              ทั้งหมด{" "}
              <span className="font-semibold text-brand-600">{roles.length}</span>{" "}
              บทบาท
            </div>
          </div>
        </div>

        {/* แจ้งว่าเป็นหน้าดูอย่างเดียว */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 text-slate-500">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                หน้านี้แสดงข้อมูลอย่างเดียว (อ่านอย่างเดียว)
              </h3>
              <p className="text-xs text-slate-500">
                บทบาทเป็นข้อมูลระดับระบบที่มีผลต่อสิทธิ์การเข้าถึงของผู้ใช้ทั้งหมด
                จึงไม่อนุญาตให้เพิ่ม แก้ไข หรือลบบทบาทจากหน้านี้
              </p>
            </div>
          </div>
        </div>

        <Panel className="p-5">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm text-slate-900 border-collapse bg-white">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ชื่อ Role
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] font-semibold">
                    คำอธิบาย
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold">
                    ประเภท
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold">
                    สร้างเมื่อ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-sm text-slate-500">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : roles.length > 0 ? (
                  roles.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-brand-50 transition-colors`}
                    >
                      <td className="px-4 py-2 text-slate-600">{r.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          {r.name}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {r.description || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {SYSTEM_ROLES.includes(r.name) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                            System
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            กำหนดเอง
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center text-slate-500">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-sm text-slate-500">
                      ไม่มีข้อมูลบทบาท
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default RoleManagement;
