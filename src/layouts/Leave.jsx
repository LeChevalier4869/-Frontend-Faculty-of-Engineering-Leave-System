import React, { useState, useEffect } from "react";
import axios from "axios"; // เพิ่มการ import axios
import { apiEndpoints } from "../utils/api"; // ที่อยู่ API
import { Link, useNavigate } from "react-router-dom";

function Leave() {
  const [leaveData, setLeaveData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        let token = localStorage.getItem("token");
        const res = await axios.get(apiEndpoints.leaveRequestMe, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveData(res.data.data);
        console.log(res.data.data); // กำหนดข้อมูลใน leaveData
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data");
        console.log(err.response?.data?.message || "Error fetching data");
      }
    };

    fetchLeaveRequests(); // เรียกฟังก์ชันเมื่อ component ถูก mount
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center">ประวัติการลา</h1>
      <div className="flex justify-end mb-4">
        <Link
          to="/leave/add2"
          className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + เพิ่มคำขอลา
        </Link>
      </div>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {leaveData.length > 0 ? (
        leaveData.map((e, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 mb-6 border-l-4 border-indigo-600 hover:shadow-xl transition duration-300 ease-in-out"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">
                    ประเภทการลา:
                  </span>{" "}
                  {e.leaveType.name}
                </p>
              </div>
              <div className="flex flex-col text-right">
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">
                    วันที่เริ่ม:
                  </span>{" "}
                  {new Date(e.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">
                    วันที่สิ้นสุด:
                  </span>{" "}
                  {new Date(e.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">สถานะ:</span>{" "}
                  {e.status}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-indigo-600">
                    วันที่สร้าง:
                  </span>{" "}
                  {new Date(e.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <hr className="my-4 border-t-2 border-gray-200" />
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">ไม่มีข้อมูลการลา</p>
      )}
    </div>
  );
}

export default Leave;
