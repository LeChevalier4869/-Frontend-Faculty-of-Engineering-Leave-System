import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";
import { FiFile, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { saveAs } from "file-saver";

const handleDownloadTemplate = () => {
  saveAs("/Add_Users_Template.xlsx", "Add_Users_Template.xlsx");
};

const handleDownloadTemplateExample = () => {
  // ถ้ามีไฟล์ตัวอย่างอีกไฟล์ให้เปลี่ยน path ตรงนี้
  saveAs("/Add_Users_Template.xlsx", "Add_Users_Template_Example.xlsx");
};

const Panel = ({ className = "", children }) => (
  <div
    className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default function AddUsersByExcel() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกไฟล์ Excel ก่อนอัปโหลด", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(apiEndpoints.uploadUserExcel, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(res.data);
      Swal.fire("สำเร็จ", "อัปโหลดข้อมูลผู้ใช้เรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || "ไม่สามารถอัปโหลดได้",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 px-4 py-8 md:px-8 font-kanit">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-sky-700">
              Admin View
            </span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              เพิ่มผู้ใช้จากไฟล์ Excel
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              อัปโหลดไฟล์ Excel เพื่อเพิ่มผู้ใช้งานหลายคนในครั้งเดียว
            </p>
          </div>
        </div>

        <Panel className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-7 bg-slate-50/60">
              <p className="text-slate-700 mb-3 text-center">
                เลือกไฟล์ Excel (.xlsx หรือ .xls) เพื่ออัปโหลดรายชื่อผู้ใช้งาน
              </p>
              <div className="text-center">
                <label
                  htmlFor="excelUpload"
                  className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-5 py-2 rounded-xl border border-sky-200 cursor-pointer hover:bg-sky-100 hover:border-sky-300 transition font-medium shadow-sm"
                >
                  <FiFile className="text-sky-600 text-lg" />
                  <span>เลือกไฟล์ Excel</span>
                </label>

                <input
                  id="excelUpload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (!selectedFile) return;

                    const validExtensions = ["xlsx", "xls"];
                    const fileExtension = selectedFile.name
                      .split(".")
                      .pop()
                      .toLowerCase();

                    if (!validExtensions.includes(fileExtension)) {
                      setFile(null);
                      setResult(null);
                      setFileError(
                        "ไฟล์ไม่ถูกต้อง! กรุณาเลือก .xlsx หรือ .xls เท่านั้น"
                      );
                      e.target.value = null;
                    } else {
                      setFile(selectedFile);
                      setResult(null);
                      setFileError("");
                    }
                  }}
                  className="hidden"
                />

                {file && (
                  <p className="mt-3 text-sm text-emerald-700 flex justify-center items-center gap-2">
                    <FiFile className="text-emerald-600" />
                    {file.name} <span className="text-xs">(พร้อมอัปโหลด)</span>
                  </p>
                )}

                {fileError && (
                  <p className="mt-2 text-sm text-rose-600 font-medium">
                    {fileError}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Left buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDownloadTemplateExample}
                  type="button"
                  className="px-5 py-2 rounded-xl font-medium text-slate-800 bg-amber-100 border border-amber-200 hover:bg-amber-200 transition text-sm shadow-sm"
                >
                  โหลดตัวอย่างเทมเพลต
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  type="button"
                  className="px-5 py-2 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition text-sm shadow-sm"
                >
                  โหลดเทมเพลตจริง
                </button>
              </div>

              {/* Right buttons */}
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/admin/manage-user")}
                  className="px-5 py-2 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition text-sm shadow-sm"
                >
                  ยกเลิก
                </button>

                <button
                  onClick={handleUpload}
                  disabled={uploading || !!fileError}
                  className={`px-5 py-2 rounded-xl font-medium text-sm text-white shadow-sm transition ${
                    uploading || fileError
                      ? "bg-sky-300 cursor-not-allowed"
                      : "bg-sky-600 hover:bg-sky-500"
                  }`}
                >
                  {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                </button>
              </div>
            </div>

            {/* Upload Result */}
            {result && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">
                  ผลการอัปโหลด
                </h3>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-sm hover:shadow-md transition">
                      <div>
                        <p className="text-xs text-emerald-600 font-medium uppercase tracking-[0.12em]">
                          เพิ่มสำเร็จ
                        </p>
                        <p className="text-xl font-semibold text-emerald-700">
                          {result.createdCount.toLocaleString()} รายการ
                        </p>
                      </div>
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <FiCheckCircle className="text-emerald-600 text-xl" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl p-3 shadow-sm hover:shadow-md transition">
                      <div>
                        <p className="text-xs text-rose-600 font-medium uppercase tracking-[0.12em]">
                          ล้มเหลว
                        </p>
                        <p className="text-xl font-semibold text-rose-700">
                          {result.failedCount.toLocaleString()} รายการ
                        </p>
                      </div>
                      <div className="bg-rose-100 p-2 rounded-full">
                        <FiXCircle className="text-rose-600 text-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Created table */}
                  {result.createdUsers?.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <h4 className="font-medium mb-2 text-emerald-700">
                        รายชื่อที่เพิ่มแล้ว
                      </h4>
                      <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="border border-slate-200 px-3 py-2 text-center w-12">
                              ลำดับ
                            </th>
                            <th className="border border-slate-200 px-3 py-2 text-left">
                              ชื่อ
                            </th>
                            <th className="border border-slate-200 px-3 py-2 text-left">
                              อีเมล
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.createdUsers.map((u, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="border border-slate-200 px-3 py-2 text-center">
                                {i + 1}
                              </td>
                              <td className="border border-slate-200 px-3 py-2">
                                {u.prefixName} {u.firstName} {u.lastName}
                              </td>
                              <td className="border border-slate-200 px-3 py-2">
                                {u.email}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Failed table */}
                  {result.failedUsers?.length > 0 && (
                    <div className="overflow-x-auto mt-5">
                      <h4 className="font-medium mb-2 text-rose-700">
                        รายการที่ล้มเหลว
                      </h4>
                      <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="border border-slate-200 px-3 py-2 text-center w-12">
                              ลำดับ
                            </th>
                            <th className="border border-slate-200 px-3 py-2 text-left">
                              อีเมล
                            </th>
                            <th className="border border-slate-200 px-3 py-2 text-left">
                              สาเหตุ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.failedUsers.map((u, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="border border-slate-200 px-3 py-2 text-center">
                                {i + 1}
                              </td>
                              <td className="border border-slate-200 px-3 py-2">
                                {u.email || `Row ${i + 2}`}
                              </td>
                              <td className="border border-slate-200 px-3 py-2 text-rose-600">
                                {u.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
