import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { apiEndpoints } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import useLeaveRequest from "../../hooks/useLeaveRequest";
import { Plus, ChevronDown, PlusCircle } from "lucide-react";

dayjs.extend(isBetween);
const PAGE_SIZE = 10;

export default function AddOtherRequest() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [leaveTypesMap, setLeaveTypesMap] = useState({});

    //filter
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterLeaveType, setFilterLeaveType] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    const statusLabels = {
        APPROVED: "อนุมัติแล้ว",
        PENDING: "รอดำเนินการ",
        REJECTED: "ถูกปฏิเสธ",
        CANCELLED: "ยกเลิกแล้ว",
    };

    return (
        <div className="px-6 py-10 bg-white min-h-screen text-black font-kanit">
            <div className="max-w-7xl mx-auto border border-red-500">
                {  /* Header Section */}
                <div className="border border-blue-300 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-center">บันทึกคำขอการลาลงระบบ</h1>
                    <button
                        onClick={() => {}}
                        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition duration-300"
                    >
                        <PlusCircle className="mr-2" /> บันทึกคำขอการลา
                    </button>
                </div>

                { /* Filter Section */}
                <div className="border border-blue-500 flex flex-wrap items-center gap-4 mb-6">
                    {/* Date_Range */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm">จาก</label>
                        <input 
                            type="date"
                            value={null}
                            onchange={(e) => {}}
                            className="bg-white text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <label className="text-sm">ถึง</label>
                        <input 
                            type="date"
                            value={null}
                            onchange={(e) => {}}
                            className="bg-white text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Status */}
                    <div className="relative w-48"> 
                        <select
                            value={null}
                            onChange={(e) => {}}
                            className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">สถานะทั้งหมด</option>
                            {/* map object */}

                        </select>
                        <div className="pointer-events-none absolute insert-y-0 right-0 flex items-center px-2">
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>

                    {/* Leave-Type */}
                    <div className="relative w-48">
                        <select
                            value={null}
                            onchange={(e) => {}}
                            className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">ประเภทการลาทั้งหมด</option>
                            {/* map option */}

                        </select>
                        <div className="pointer-events-none absolute insert-y-0 right-0 flex items-center px-2">
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>

                    {/* Sort_Order */ }
                    <div className="relative w-48">
                        <select
                            value={null}
                            onChange={(e) => {}}
                            className="w-full bg-white text-base px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="desc">เรียงจากใหม่ไปเก่า</option>
                            <option value="asc">เรียงจากเก่าไปใหม่</option>
                        </select>
                        <div className="pointer-events-none absolute insert-y-0 right-0 flex items-center px-2">
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>

                    {/* Clear_Filters */}
                    <button
                        onClick={() => {}}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    >
                        ล้าง
                    </button>
                </div>

                {/* Legend */}
                <div className="flex gap-6 items-center text-sm mb-6">
                    {/* map object */}

                </div>

                {/* table */}
                <div className="rounded-lg shadow border border-gray-300 overflow-hidden">
                    <table className="table-fixed w-full bg-white text-sm text-black">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800">
                                {[
                                    "วันที่ยื่น",
                                    "ประเภทการลา",
                                    "วันที่เริ่มต้น",
                                    "วันที่สิ้นสุด",
                                    "สถานะ",
                                ].map((h, i) => (
                                    <th key={i} className="px-4 py-3 text-left">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* leave data */}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
     
            </div>

                {/* Floating_Button */}
                <button
                    onClick={() => {}}
                    className="fixed bottom-8 right-8 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition"
                >
                    <Plus className="w-6 h-6" />
                </button>

                {/* LeaveRequestModal */}
        </div>
    );
};
