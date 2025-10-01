import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import { apiEndpoints } from "../../utils/api";
import getApiUrl from "../../utils/apiUtils";
import Swal from "sweetalert2";
import { XMarkIcon } from "@heroicons/react/24/outline";

const holidays = ["2025-04-25", "2025-05-01"];

function LeaveRequestModal({ isOpen, onClose, onSuccess }) {
  const [leaveTypes, setLeaveTypes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(apiEndpoints.availableLeaveType);
        setLeaveTypes(response.data.data);
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    }

    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    contact: "",
    isEmergency: "0",
    images: null,
  });
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const inputStyle =
    "w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

  useEffect(() => {
    if (!isOpen) return;
    const fetchLeaveBalances = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await axios.get(getApiUrl("leave-balances/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ทดสอบ response
        // console.log("Leave Balances:", res.data.data);
        if (Array.isArray(res.data.data)) {
          setLeaveBalances(res.data.data);
        }
        resetForm();
      } catch (error) {
        console.error("Error fetching leave balances:", error);
      }
    };
    fetchLeaveBalances();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "leaveTypeId") {
      const selected = leaveBalances.find(
        (b) => String(b.leaveTypeId) === value
      );
      setSelectedLeaveBalance(selected || null);
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.files[0] || null }));
  };

  const calculateWorkingDays = (start, end) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    if (
      !startDate.isValid() ||
      !endDate.isValid() ||
      startDate.isAfter(endDate)
    )
      return 0;

    let workingDays = 0;
    let d = startDate.clone();
    while (d.isSameOrBefore(endDate, "day")) {
      const isWeekend = d.day() === 0 || d.day() === 6;
      const isHoliday = holidays.includes(d.format("YYYY-MM-DD"));
      if (!isWeekend && !isHoliday) workingDays++;
      d = d.add(1, "day");
    }
    return workingDays;
  };

  const workingDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    return calculateWorkingDays(formData.startDate, formData.endDate);
  }, [formData.startDate, formData.endDate]);

  const resetForm = () => {
    setFormData({
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
      contact: "",
      isEmergency: "0",
      images: null,
    });
    setSelectedLeaveBalance(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบก่อน",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("leaveTypeId", formData.leaveTypeId);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("reason", formData.reason);
      formDataToSend.append("contact", formData.contact);
      formDataToSend.append("isEmergency", formData.isEmergency === "1");
      if (formData.leaveTypeId === "1" && formData.images) {
        formDataToSend.append("images", formData.images);
      }

      await axios.post(getApiUrl("leave-requests/"), formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "บันทึกคำขอลาสำเร็จ",
        confirmButtonColor: "#3b82f6",
      });
      onSuccess();
      resetForm();
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dayHighlight = (date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return "!text-red-500";
    }
    return "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl relative font-kanit text-black overflow-y-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">ยื่นคำร้องการลา</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* แสดงสิทธิการลาเหลือ */}
          {selectedLeaveBalance && (
            <div className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg mb-2 text-sm">
              คุณมีสิทธิลาประเภทนี้เหลือ:{" "}
              <span className="font-bold">
                {selectedLeaveBalance.remainingDays} วัน
              </span>
            </div>
          )}

          {/* ประเภทการลา */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ประเภทการลา
            </label>
            <div className="relative">
              <select
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">เลือกประเภทการลา</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                </svg>
              </div>
            </div>
          </div>

          {/* วันที่เริ่มต้น */}
          <div>
            <label className="block text-sm font-medium mb-1">
              วันที่เริ่มต้น
            </label>
            <DatePicker
              selected={
                formData.startDate ? new Date(formData.startDate) : null
              }
              onChange={(date) => {
                const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                setFormData((prev) => ({ ...prev, startDate: formatted }));
              }}
              dateFormat="dd/MM/yyyy"
              locale={th}
              placeholderText="เลือกวันที่เริ่มต้น (วัน/เดือน/ปี)"
              className={`${inputStyle}`}
              wrapperClassName="w-full"
              calendarClassName="!rounded-xl !border-2 !border-rose-300 p-2"
              dayClassName={dayHighlight}
            />
          </div>

          {/* วันที่สิ้นสุด */}
          <div>
            <label className="block text-sm font-medium mb-1">
              วันที่สิ้นสุด
            </label>
            <DatePicker
              selected={formData.endDate ? new Date(formData.endDate) : null}
              onChange={(date) => {
                const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
                setFormData((prev) => ({ ...prev, endDate: formatted }));
              }}
              dateFormat="dd/MM/yyyy"
              locale={th}
              placeholderText="เลือกวันที่สิ้นสุด (วัน/เดือน/ปี)"
              className={`${inputStyle}`}
              wrapperClassName="w-full"
              calendarClassName="!rounded-xl p-2"
              dayClassName={dayHighlight}
            />
          </div>

          {/* จำนวนวันลา */}
          {formData.startDate && formData.endDate && (
            <div className="text-sm text-gray-600">
              จำนวนวันลา:{" "}
              <span className="font-bold text-black">{workingDays} วัน</span>
            </div>
          )}

          {/* เหตุผลการลา */}
          <div>
            <label className="block text-sm font-medium mb-1">
              เหตุผลการลา
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="2"
              // required
              className={inputStyle}
            />
          </div>

          {/* ติดต่อ */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ช่องทางติดต่อติดต่อ
            </label>
            <textarea
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              rows="2"
              // required
              className={inputStyle}
            />
          </div>

          {/* แนบไฟล์ใบรับรองแพทย์ */}
          {formData.leaveTypeId === "1" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                แนบไฟล์ใบรับรองแพทย์
              </label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className={inputStyle}
              />
            </div>
          )}

          {/* ปุ่มบันทึก */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 text-black hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveRequestModal;
