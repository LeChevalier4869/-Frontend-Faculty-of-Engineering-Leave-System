import { useState, useEffect } from "react";
import { API, apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import { X, FileText, Search, AlertCircle, CheckCircle } from "lucide-react";

function LeaveCancellationModal({ onClose, onSuccess }) {
  const [leaveRequestNumber, setLeaveRequestNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundRequest, setFoundRequest] = useState(null);
  const [paperFiles, setPaperFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const inputStyle =
    "w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

  const searchLeaveRequest = async () => {
    if (!leaveRequestNumber.trim()) {
      setError("กรุณาระบุเลขที่ใบลา");
      return;
    }

    setSearching(true);
    setError("");
    setFoundRequest(null);

    try {
      const response = await API.get(
        `${apiEndpoints.leaveRequest}/admin/search/${leaveRequestNumber.trim()}`
      );
      
      if (response.data) {
        setFoundRequest(response.data);
        setError("");
      } else {
        setError("ไม่พบคำขอลาที่อนุมัติแล้ว หรือเลขที่ใบลาไม่ถูกต้อง");
        setFoundRequest(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err?.response?.data?.message || 
        "ไม่พบคำขอลาที่อนุมัติแล้ว หรือเลขที่ใบลาไม่ถูกต้อง"
      );
      setFoundRequest(null);
    } finally {
      setSearching(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      Swal.fire({
        icon: "warning",
        title: "ไฟล์มากเกินไป",
        text: "สามารถแนบไฟล์ได้สูงสุด 3 ไฟล์",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    setPaperFiles(files);
  };

  const removeFile = (index) => {
    setPaperFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!foundRequest) {
      setError("กรุณาค้นหาคำขอลาก่อนดำเนินการ");
      return;
    }

    if (paperFiles.length === 0) {
      const result = await Swal.fire({
        icon: "question",
        title: "ยืนยันการยกเลิก",
        text: "คุณไม่ได้แนบไฟล์เอกสาร ต้องการดำเนินการต่อหรือไม่?",
        showCancelButton: true,
        confirmButtonText: "ดำเนินการ",
        cancelButtonText: "ยกเลิก",
      });
      
      if (!result.isConfirmed) {
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("leaveRequestNumber", leaveRequestNumber.trim());
      
      paperFiles.forEach((file) => {
        formData.append("paperFiles", file);
      });

      const response = await API.post(
        `${apiEndpoints.leaveRequest}/admin/cancel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "ดำเนินการสำเร็จ",
        text: response.data.message || "ยกเลิกคำขอลาเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Cancel error:", err);
      const errorMessage = err?.response?.data?.message || "เกิดข้อผิดพลาดในการยกเลิกคำขอลา";
      
      await Swal.fire({
        icon: "error",
        title: "ดำเนินการล้มเหลว",
        text: errorMessage,
        confirmButtonText: "ตกลง",
      });
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-[min(92vw,720px)] max-h-[90vh] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl font-kanit flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              Admin Action
            </span>
            <h2 className="text-lg font-semibold">ยกเลิกคำขอลา (Admin)</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 hover:bg-slate-100"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  เลขที่ใบลา <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leaveRequestNumber}
                    onChange={(e) => {
                      setLeaveRequestNumber(e.target.value);
                      setError("");
                      setFoundRequest(null);
                    }}
                    placeholder="พิมพ์เลขที่ใบลาเพื่อค้นหา"
                    className={`${inputStyle} flex-1`}
                    disabled={searching || submitting}
                  />
                  <button
                    type="button"
                    onClick={searchLeaveRequest}
                    disabled={searching || submitting || !leaveRequestNumber.trim()}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {searching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ค้นหา...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        ค้นหา
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-rose-700">{error}</span>
                </div>
              )}
            </div>

            {/* Found Request Details */}
            {foundRequest && (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-medium text-emerald-900">พบข้อมูลคำขอลา</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">ผู้ยื่นคำขอ:</span>
                      <div className="font-medium text-slate-900">
                        {foundRequest.user?.prefixName} {foundRequest.user?.firstName} {foundRequest.user?.lastName}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">แผนก:</span>
                      <div className="font-medium text-slate-900">
                        {foundRequest.user?.department?.name || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">ประเภทการลา:</span>
                      <div className="font-medium text-slate-900">
                        {foundRequest.leaveType?.name || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">จำนวนวันลา:</span>
                      <div className="font-medium text-slate-900">
                        {foundRequest.thisTimeDays || 0} วัน
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">วันที่ลา:</span>
                      <div className="font-medium text-slate-900">
                        {formatDate(foundRequest.startDate)} - {formatDate(foundRequest.endDate)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">อีเมล:</span>
                      <div className="font-medium text-slate-900 text-xs break-all">
                        {foundRequest.user?.email || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section */}
            {foundRequest && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    แนบไฟล์เอกสาร (Paper)
                    <span className="text-xs text-slate-500 ml-2">สูงสุด 3 ไฟล์</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                </div>

                {paperFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">ไฟล์ที่แนบ:</div>
                    {paperFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-700 truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={submitting}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Warning Message */}
            {foundRequest && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <div className="font-medium mb-1">คำเตือน:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>การยกเลิกคำขอลาจะคืนสิทธิ์การลาให้กับผู้ใช้ทันที</li>
                      <li>ระบบจะส่งอีเมลแจ้งเตือนให้ผู้ใช้โดยอัตโนมัติ</li>
                      <li>การดำเนินการนี้ไม่สามารถย้อนกลับได้</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || !foundRequest}
              className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  กำลังดำเนินการ...
                </>
              ) : (
                "ยกเลิกคำขอลา"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveCancellationModal;
