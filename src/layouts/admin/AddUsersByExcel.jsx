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
  saveAs("/Add_Users_Template.xlsx", "Add_Users_Template.xlsx");
};

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
    <div className="min-h-screen bg-white text-black px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          เพิ่มผู้ใช้จากไฟล์ Excel
        </h2>

        <div className="space-y-6">
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
            <p className="text-gray-700 mb-3">
              เลือกไฟล์ Excel (.xlsx หรือ .xls)
            </p>
            <div className="text-center">
              <label
                htmlFor="excelUpload"
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2 rounded-lg border border-blue-300 cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition font-medium"
              >
                <FiFile className="text-blue-600 text-lg" />
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
                <p className="mt-3 text-sm text-green-700 flex justify-center items-center gap-2">
                  <FiFile className="text-green-600" />
                  {file.name} (พร้อมอัปโหลด)
                </p>
              )}

              {fileError && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {fileError}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {/* ปุ่มฝั่งซ้าย */}
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadTemplateExample}
                className="px-5 py-2 rounded-lg font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition"
              >
                โหลดเทมเพลต
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="px-5 py-2 rounded-lg font-medium text-white bg-green-500 hover:bg-green-600 transition"
              >
                โหลดเทมเพลต
              </button>
            </div>

            {/* ปุ่มฝั่งขวา */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => navigate("/admin/manage-user")}
                className="px-5 py-2 rounded-lg font-medium text-white bg-gray-400 hover:bg-gray-500 transition disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleUpload}
                disabled={uploading || !!fileError}
                className="px-5 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50"
              >
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
              </button>
            </div>
          </div>

          {/* Upload Result */}
          {result && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">ผลการอัปโหลด</h3>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                {/* การ์ดสรุปผล */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                    <div>
                      <p className="text-xs text-green-600 font-medium">
                        เพิ่มสำเร็จ
                      </p>
                      <p className="text-lg font-semibold text-green-700">
                        {result.createdCount.toLocaleString()} รายการ
                      </p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <FiCheckCircle className="text-green-600 text-xl" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm hover:shadow-md transition">
                    <div>
                      <p className="text-xs text-red-600 font-medium">
                        ล้มเหลว
                      </p>
                      <p className="text-lg font-semibold text-red-700">
                        {result.failedCount.toLocaleString()} รายการ
                      </p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-full">
                      <FiXCircle className="text-red-600 text-xl" />
                    </div>
                  </div>
                </div>

                {/* ตารางเพิ่มสำเร็จ */}
                {result.createdUsers?.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <h4 className="font-medium mb-2 text-green-700">
                      รายชื่อที่เพิ่มแล้ว:
                    </h4>
                    <table className="min-w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-2 text-center w-12">
                            ลำดับ
                          </th>
                          <th className="border px-3 py-2 text-left">ชื่อ</th>
                          <th className="border px-3 py-2 text-left">อีเมล</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.createdUsers.map((u, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="border px-3 py-2 text-center">
                              {i + 1}
                            </td>
                            <td className="border px-3 py-2">
                              {u.prefixName} {u.firstName} {u.lastName}
                            </td>
                            <td className="border px-3 py-2">{u.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ตารางล้มเหลว */}
                {result.failedUsers?.length > 0 && (
                  <div className="overflow-x-auto mt-5">
                    <h4 className="font-medium mb-2 text-red-700">
                      รายการที่ล้มเหลว:
                    </h4>
                    <table className="min-w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-2 text-center w-12">
                            ลำดับ
                          </th>
                          <th className="border px-3 py-2 text-left">อีเมล</th>
                          <th className="border px-3 py-2 text-left">สาเหตุ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.failedUsers.map((u, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="border px-3 py-2 text-center">
                              {i + 1}
                            </td>
                            <td className="border px-3 py-2">
                              {u.email || `Row ${i + 2}`}
                            </td>
                            <td className="border px-3 py-2 text-red-600">
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
      </div>
    </div>
  );
}
