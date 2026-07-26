/* eslint-disable react/prop-types */
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FiFile, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { saveAs } from "file-saver";
import { useGoBack } from "../utils/useGoBack";

export default function ExcelUploadPanel({
  title,
  description,
  uploadUrl,
  templatePath,
  templateName = "Template.xlsx",
  exampleTemplateName = "Template_Example.xlsx",
  tokenKey = "accessToken",
  onSuccess,
}) {
  const goBack = useGoBack("/admin/manage-user");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกไฟล์ Excel", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token = localStorage.getItem(tokenKey);

      const res = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(res.data);
      onSuccess?.(res.data);

      const created = res.data?.createdCount || 0;
      const failed = res.data?.failedCount || 0;
      const warned = (res.data?.warnings || []).length;
      if (failed > 0) {
        Swal.fire({
          icon: created > 0 ? "warning" : "error",
          title: "อัปโหลดเสร็จสิ้น",
          html: `เพิ่มสำเร็จ <b>${created}</b> · ล้มเหลว <b>${failed}</b>${
            warned ? ` · คำเตือน <b>${warned}</b>` : ""
          }<br/><span style="font-size:0.85rem;color:#64748b">ดูรายละเอียดข้อผิดพลาดด้านล่าง</span>`,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          html: `เพิ่มผู้ใช้ <b>${created}</b> รายการ${
            warned ? ` · มีคำเตือน <b>${warned}</b> รายการ (ดูด้านล่าง)` : ""
          }`,
        });
      }
    } catch (err) {
      Swal.fire(
        "ผิดพลาด",
        err.response?.data?.message || "ไม่สามารถอัปโหลดได้",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed rounded-2xl p-6 bg-slate-50">
        <p className="text-center text-slate-700 mb-3">
          เลือกไฟล์ Excel (.xlsx หรือ .xls)
        </p>

        <div className="text-center">
          <label
            htmlFor="excelUpload"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-50 border border-brand-200 cursor-pointer"
          >
            <FiFile />
            เลือกไฟล์ Excel
          </label>

          <input
            id="excelUpload"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              if (!f) return;

              const ext = f.name.split(".").pop().toLowerCase();
              if (!["xlsx", "xls"].includes(ext)) {
                setFile(null);
                setResult(null);
                setFileError("กรุณาเลือกไฟล์ .xlsx หรือ .xls เท่านั้น");
                e.target.value = null;
              } else {
                setFile(f);
                setResult(null);
                setFileError("");
              }
            }}
          />

          {file && (
            <p className="mt-3 text-sm text-emerald-700">
              <FiFile className="inline mr-1" />
              {file.name}
            </p>
          )}

          {fileError && (
            <p className="mt-2 text-sm text-rose-600">{fileError}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => saveAs(templatePath, exampleTemplateName)}
            className="px-4 py-2 rounded-xl bg-amber-100 border text-sm"
          >
            โหลดตัวอย่าง
          </button>
          <button
            onClick={() => saveAs(templatePath, templateName)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm"
          >
            โหลดเทมเพลต
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBack}
            className="px-5 py-2 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition text-sm shadow-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || fileError}
            className={`px-5 py-2 rounded-xl text-white text-sm ${
              uploading || fileError
                ? "bg-brand-300"
                : "bg-brand-600 hover:bg-brand-500"
            }`}
          >
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="border-t pt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <ResultCard
              label="เพิ่มสำเร็จ"
              value={result.createdCount}
              icon={<FiCheckCircle />}
              color="emerald"
            />
            <ResultCard
              label="ล้มเหลว"
              value={result.failedCount}
              icon={<FiXCircle />}
              color="rose"
            />
          </div>

          {/* รายการที่ล้มเหลว — บอกว่าแถวไหน/คนไหน ผิดเพราะอะไร */}
          {Array.isArray(result.failedUsers) && result.failedUsers.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-rose-200 bg-rose-50">
                <FiXCircle className="text-rose-600" />
                <span className="text-sm font-semibold text-rose-700">
                  ข้อผิดพลาดที่ต้องแก้ไข ({result.failedUsers.length} รายการ)
                </span>
              </div>
              <ul className="max-h-72 overflow-y-auto divide-y divide-rose-100">
                {result.failedUsers.map((f, i) => (
                  <li key={i} className="px-4 py-2.5 text-sm">
                    <span className="font-medium text-rose-800">
                      {f?.email || `แถวที่ ${i + 1}`}
                    </span>
                    <span className="text-rose-700">
                      {" — "}
                      {f?.reason || f?.message || "ไม่ทราบสาเหตุ"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* คำเตือน — ไม่ทำให้ล้มเหลว แต่ควรตรวจ (เช่น คอลัมน์ balance ไม่ใช่ตัวเลข) */}
          {Array.isArray(result.warnings) && result.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-200 bg-amber-50">
                <FiFile className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  คำเตือน — นำเข้าสำเร็จแต่ควรตรวจสอบ ({result.warnings.length} รายการ)
                </span>
              </div>
              <ul className="max-h-56 overflow-y-auto divide-y divide-amber-100">
                {result.warnings.map((w, i) => (
                  <li key={i} className="px-4 py-2.5 text-sm text-amber-800">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.failedCount === 0 &&
            !(result.warnings && result.warnings.length) && (
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <FiCheckCircle /> นำเข้าครบทุกรายการ ไม่มีข้อผิดพลาด
              </p>
            )}
        </div>
      )}
    </div>
  );
}

const RESULT_CARD_STYLES = {
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
  rose: "bg-rose-50 border-rose-200 text-rose-600",
};

function ResultCard({ label, value, icon, color }) {
  const cls = RESULT_CARD_STYLES[color] || RESULT_CARD_STYLES.emerald;
  return (
    <div className={`border rounded-xl p-4 flex justify-between ${cls}`}>
      <div>
        <p className="text-xs">{label}</p>
        <p className="text-xl font-semibold">
          {Number(value || 0).toLocaleString()} รายการ
        </p>
      </div>
      <div className="text-xl">{icon}</div>
    </div>
  );
}
