import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { th } from "date-fns/locale";
import { apiEndpoints } from "../../utils/api";

function LeaveRequestModalAdmin({ isOpen, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentIssuedDate, setDocumentIssuedDate] = useState(null);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setImages(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("startDate", dayjs(startDate).format("YYYY-MM-DD"));
    formData.append("endDate", dayjs(endDate).format("YYYY-MM-DD"));
    formData.append("reason", reason);
    formData.append("contact", contact);
    formData.append("documentNumber", documentNumber);
    formData.append("documentIssuedDate", dayjs(documentIssuedDate).format("YYYY-MM-DD"));
    if (images) formData.append("images", images);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`${apiEndpoints.adminLeaveRequests}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      Swal.fire("สำเร็จ", "เพิ่มคำขอลาสำเร็จแล้ว", "success");
      onSuccess();
      onClose();
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", err.response?.data?.message || "ไม่สามารถบันทึกได้", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <style>{`
        [data-force-light] { color-scheme: light; }
        [data-force-light] input,
        [data-force-light] select,
        [data-force-light] textarea,
        [data-force-light] .react-datepicker__input-container input {
          -webkit-appearance: none !important;
          appearance: none !important;
          background-color: #ffffff !important;
          color: #111827 !important;
        }
        [data-force-light] input:-webkit-autofill,
        [data-force-light] textarea:-webkit-autofill,
        [data-force-light] select:-webkit-autofill {
          -webkit-text-fill-color: #111827 !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: inset 0 0 0 1000px #ffffff !important;
        }
      `}</style>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative" data-force-light>
        <button onClick={onClose} className="absolute top-3 right-3">
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">บันทึกคำขอการลา (Admin)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-900">วันที่เริ่มลา</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="yyyy-MM-dd"
              locale={th}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-900">วันที่สิ้นสุด</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="yyyy-MM-dd"
              locale={th}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-900">เหตุผล</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="ระบุเหตุผล"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-900">ช่องทางติดต่อ</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="เช่น เบอร์โทร หรืออีเมล"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-900">เลขที่เอกสาร</label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="เช่น ตจ.ลป03/63"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-900">วันที่ออกเอกสาร</label>
            <DatePicker
              selected={documentIssuedDate}
              onChange={setDocumentIssuedDate}
              dateFormat="yyyy-MM-dd"
              locale={th}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-900">แนบรูปภาพ</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveRequestModalAdmin;
