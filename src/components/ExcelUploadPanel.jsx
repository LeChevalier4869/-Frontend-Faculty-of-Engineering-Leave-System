import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FiFile, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

      Swal.fire("สำเร็จ", "อัปโหลดเรียบร้อย", "success");
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
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-50 border border-sky-200 cursor-pointer"
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
            onClick={() => navigate("/admin/manage-user")}
            className="px-5 py-2 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition text-sm shadow-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || fileError}
            className={`px-5 py-2 rounded-xl text-white text-sm ${
              uploading || fileError
                ? "bg-sky-300"
                : "bg-sky-600 hover:bg-sky-500"
            }`}
          >
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="border-t pt-6">
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
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
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value, icon, color }) {
  return (
    <div
      className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 flex justify-between`}
    >
      <div>
        <p className={`text-${color}-600 text-xs`}>{label}</p>
        <p className={`text-${color}-700 text-xl font-semibold`}>
          {value.toLocaleString()} รายการ
        </p>
      </div>
      <div className={`text-${color}-600 text-xl`}>{icon}</div>
    </div>
  );
}
