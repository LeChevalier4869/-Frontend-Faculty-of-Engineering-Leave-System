import { useState, useEffect } from "react";
import Swal from "sweetalert2";
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

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [editIsSystem, setEditIsSystem] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400";
  const buttonClass =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium text-white shadow-sm transition px-4 py-2";


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

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditId(null);
    setEditIsSystem(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      return Swal.fire("Error", "กรุณาระบุชื่อ Role", "error");
    }
    try {
      await API.post(apiEndpoints.createRole, {
        name: name.trim(),
        description: description.trim() || null,
      });
      Swal.fire("บันทึกสำเร็จ!", "", "success");
      resetForm();
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEdit = (id) => {
    const r = roles.find((t) => t.id === id);
    if (!r) return;
    setName(r.name);
    setDescription(r.description || "");
    setEditId(r.id);
    setEditIsSystem(SYSTEM_ROLES.includes(r.name));
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      return Swal.fire("Error", "กรุณาระบุชื่อ Role", "error");
    }
    try {
      await API.put(apiEndpoints.updateRole(editId), {
        name: name.trim(),
        description: description.trim() || null,
      });
      Swal.fire("อัปเดตสำเร็จ!", "", "success");
      resetForm();
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การลบนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      await API.delete(apiEndpoints.deleteRole(id));
      Swal.fire("ลบสำเร็จ!", "", "success");
      loadData();
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 md:px-8 font-kanit text-slate-900 rounded-2xl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 text-center mb-2 md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div className="w-full flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                จัดการบทบาท (Role)
              </h1>
              <p className="text-sm text-slate-600">
                จัดการสิทธิ์การเข้าถึงและบทบาทในระบบ
              </p>
            </div>
            <div className="text-xs text-slate-500">
              ทั้งหมด{" "}
              <span className="font-semibold text-sky-600">
                {roles.length}
              </span>{" "}
              บทบาท
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800 mb-1">โปรดระมัดระวังในการแก้ไข</h3>
              <p className="text-xs text-amber-700">
                การเปลี่ยนแปลง Role อาจส่งผลกระทบต่อสิทธิ์การเข้าถึงของผู้ใช้ทั้งระบบ
                กรุณาตรวจสอบให้แน่ใจก่อนทำการเปลี่ยนแปลง
              </p>
            </div>
          </div>
        </div>

        <Panel className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-1 flex flex-col gap-1 relative">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                ชื่อ Role
              </label>
              <input
                type="text"
                placeholder="เช่น MANAGER, HR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={editIsSystem}
                className={`${inputClass} ${editIsSystem ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
              />
              {editIsSystem && (
                <p className="absolute -bottom-4 left-0 text-[10px] text-amber-600 whitespace-nowrap">
                  System Role — ไม่สามารถเปลี่ยนชื่อได้
                </p>
              )}
            </div>
            <div className="lg:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                คำอธิบาย
              </label>
              <input
                type="text"
                placeholder="อธิบายบทบาทของ Role นี้"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="lg:col-span-1 flex gap-2 lg:justify-end">
              {editId ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className={`${buttonClass} bg-amber-500 hover:bg-amber-400`}
                  >
                    อัปเดต
                  </button>
                  <button
                    onClick={resetForm}
                    className={`${buttonClass} bg-slate-400 hover:bg-slate-300`}
                  >
                    ยกเลิก
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAdd}
                  className={`${buttonClass} w-full lg:w-auto bg-sky-600 hover:bg-sky-500`}
                >
                  เพิ่ม Role
                </button>
              )}
            </div>
          </div>
        </Panel>

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
                    สร้างเมื่อ
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : roles.length > 0 ? (
                  roles.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-sky-50 transition-colors`}
                    >
                      <td className="px-4 py-2 text-slate-600">{r.id}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            {r.name}
                          </span>
                          {SYSTEM_ROLES.includes(r.name) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                              System
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {r.description || <span className="text-slate-400">-</span>}
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
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(r.id)}
                            className="overflow-hidden whitespace-nowrap inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-white"
                          >
                            {SYSTEM_ROLES.includes(r.name) ? "แก้คำอธิบาย" : "แก้ไข"}
                          </button>
                          {!SYSTEM_ROLES.includes(r.name) && (
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium bg-rose-500 hover:bg-rose-400 text-white"
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-sm text-slate-500"
                    >
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
}

export default RoleManagement;