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

    return (
        <div className="p-6 bg-white min-h-screen text-black font-kanit">
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
                    <div>

                    </div>

                    {/* Status */}
                    <div>

                    </div>

                    {/* Leave-Type */}
                    <div>

                    </div>

                    {/* Sort_Order */ }
                    <div>

                    </div>

                    {/* Clear_Filters */}
                    <button
                        onClick={() => {}}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    >
                        ล้าง
                    </button>
                </div>
            </div>

        </div>
    );
};
