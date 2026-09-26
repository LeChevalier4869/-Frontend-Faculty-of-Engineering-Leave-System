import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "../../utils/useGoBack";
import getApiUrl from "../../utils/apiUtils";
import axios from "axios";
import Swal, { notifySuccess, notifyError, confirmAction } from "../../utils/alert";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { apiEndpoints } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { filterLeaveTypesBySex } from "../../utils/leavePolicy";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

function AddLeave2() {
  const navigate = useNavigate();
  const goBack = useGoBack("/leave");
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ใบลาของฉันที่ยังมีผล (รออนุมัติ/อนุมัติแล้ว) ใช้ตรวจวันลาซ้อนทับ
  const [myActiveRequests, setMyActiveRequests] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(apiEndpoints.availableLeaveType);
        // ทดสอบ response
        // console.log("Leave Types:", response.data.data);
        setLeaveTypes(filterLeaveTypesBySex(response.data.data, user?.sex));
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    }

    fetchData();
  }, [user?.sex]);

  // ดึงใบลาของฉันที่ยังมีผล เพื่อใช้เตือนกรณีวันลาซ้อนทับ
  useEffect(() => {
    async function fetchMyActiveRequests() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await axios.get(apiEndpoints.leaveRequestMe, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        // นับเฉพาะใบที่ยังมีผลจองวันอยู่ (ใบที่ถูกปฏิเสธ/ยกเลิกไปแล้ว วันจะว่างคืน)
        setMyActiveRequests(
          list.filter((r) => r.status === "PENDING" || r.status === "APPROVED"),
        );
      } catch (error) {
        console.error("Error fetching my leave requests:", error);
        setMyActiveRequests([]);
      }
    }

    fetchMyActiveRequests();
  }, []);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    contact: "",
    isEmergency: "0",
    images: null,
    additionalDetails: "",
  });

  const inputStyle =
    "w-full bg-white text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.files[0] }));
  };

  // ตรวจหาใบลาที่ยื่นไว้ก่อนหน้าและมีช่วงวันซ้อนทับกับที่กำลังเลือก
  // (สองช่วงซ้อนทับกันเมื่อ start ≤ อีกฝั่ง.end และ อีกฝั่ง.start ≤ end)
  const overlappingRequests = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return [];
    const start = dayjs(formData.startDate);
    const end = dayjs(formData.endDate);
    if (!start.isValid() || !end.isValid() || end.isBefore(start, "day"))
      return [];

    return myActiveRequests.filter((r) => {
      const rStart = dayjs(r.startDate);
      const rEnd = dayjs(r.endDate);
      if (!rStart.isValid() || !rEnd.isValid()) return false;
      return (
        start.isSameOrBefore(rEnd, "day") && rStart.isSameOrBefore(end, "day")
      );
    });
  }, [formData.startDate, formData.endDate, myActiveRequests]);

  const statusLabel = (status) =>
    status === "APPROVED" ? "อนุมัติแล้ว" : "รออนุมัติ";

  const formatOverlapRange = (r) => {
    const s = dayjs(r.startDate).format("DD/MM/YYYY");
    const e = dayjs(r.endDate).format("DD/MM/YYYY");
    return s === e ? s : `${s} - ${e}`;
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

    // เตือนกรณีช่วงวันที่ซ้อนทับกับใบลาที่ยื่นไว้ก่อนหน้า — ให้ยืนยันก่อนบันทึก
    if (overlappingRequests.length > 0) {
      const list = overlappingRequests
        .map(
          (r) =>
            `<li>${r.leaveType?.name || "การลา"} วันที่ ${formatOverlapRange(
              r,
            )} (${statusLabel(r.status)})</li>`,
        )
        .join("");
      const confirmed = await confirmAction({
        title: "ยืนยันการยื่นลาที่มีวันซ้อนทับ?",
        html: `
          <div style="text-align:left">
            <p>ช่วงวันที่ที่คุณเลือกซ้อนทับกับใบลาที่ยื่นไว้ก่อนหน้า ดังนี้</p>
            <ul style="margin:8px 0 8px 20px;list-style:disc">${list}</ul>
            <p>การยื่นซ้อนทับอาจทำให้เกิดการลาซ้ำซ้อนในวันเดียวกัน คุณแน่ใจหรือไม่ที่จะยื่นใบลานี้?</p>
          </div>`,
        confirmText: "ยืนยันยื่นลา",
        cancelText: "ยกเลิก",
        icon: "warning",
      });
      if (!confirmed) return;
    }

    setIsSubmitting(true);
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

      notifySuccess("บันทึกคำขอลาสำเร็จ", "ระบบได้บันทึกข้อมูลของคุณแล้ว").then(
        () => navigate("/leave")
      );
    } catch (err) {
      console.error("❌ Submit Error:", err.response || err.message || err);
      notifyError(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit text-black">
      <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          แบบฟอร์มคำร้องขอการลา
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label
              htmlFor="startDate"
              className="block text-sm font-medium mb-1"
            >
              วันที่เริ่มต้น
            </label>
            <div className="relative w-full">
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-12 cursor-pointer`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>

          {/* วันที่สิ้นสุด */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              วันที่สิ้นสุด
            </label>
            <div className="relative w-full">
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate || ""}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-12 cursor-pointer`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>

          {/* แจ้งเตือนเมื่อช่วงวันที่เลือกซ้อนทับกับใบลาที่ยื่นไว้ก่อนหน้า */}
          {overlappingRequests.length > 0 && (
            <div className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-800 border border-orange-200">
              <div className="font-medium">
                ⚠️ ช่วงวันที่ที่เลือกซ้อนทับกับใบลาที่ยื่นไว้ก่อนหน้า
              </div>
              <ul className="mt-1 ml-5 list-disc space-y-0.5 text-xs text-orange-700">
                {overlappingRequests.map((r) => (
                  <li key={r.id}>
                    {r.leaveType?.name || "การลา"} วันที่ {formatOverlapRange(r)}{" "}
                    ({statusLabel(r.status)})
                  </li>
                ))}
              </ul>
              <div className="mt-1 text-xs text-orange-600">
                หากยืนยันการยื่นซ้อนทับ ระบบจะให้ยืนยันอีกครั้งก่อนบันทึก
              </div>
            </div>
          )}

          {/* เหตุผลการลา */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-1">
              เหตุผลการลา
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="2"
              // required ไม่บังคับให้กรอก
              className={inputStyle}
            />
          </div>

          {/* ช่องทางติดต่อ */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium mb-1">
              ช่องทางติดต่อ
            </label>
            <textarea
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              rows="2"
              className={inputStyle}
            />
          </div>

          {/* แนบไฟล์ */}
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

          {/* การลาเร่งด่วน 
          {/*
          <div>
            <label className="block text-sm font-medium mb-1">การลาเร่งด่วน</label>
            <div className="relative">
              <select
                name="isEmergency"
                value={formData.isEmergency}
                onChange={handleChange}
                required
                className={`${inputStyle} appearance-none pr-10 cursor-pointer`}
              >
                <option value="0">ไม่เร่งด่วน</option>
                <option value="1">เร่งด่วน</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                </svg>
              </div>
            </div>
          </div>
          */}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2 rounded-lg bg-gray-200 text-black hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && (
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              )}
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLeave2;
