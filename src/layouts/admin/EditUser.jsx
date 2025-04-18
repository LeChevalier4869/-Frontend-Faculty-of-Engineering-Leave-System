import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    prefixName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiEndpoints.userLanding}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
      setFormData({
        prefixName: res.data.data.prefixName,
        firstName: res.data.data.firstName,
        lastName: res.data.data.lastName,
        email: res.data.data.email,
        phone: res.data.data.phone,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("ไม่พบผู้ใช้งาน", "", "error").then(() => navigate("/manageuser"));
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${apiEndpoints.userLanding}/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("อัปเดตสำเร็จ", "ข้อมูลผู้ใช้งานได้รับการอัปเดตแล้ว", "success").then(() =>
        navigate("/manageuser")
      );
    } catch (err) {
      console.error(err);
      Swal.fire("อัปเดตล้มเหลว", err.response?.data?.message || "ไม่สามารถอัปเดตได้", "error");
    }
  };

  if (!user) return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit">
      <div className="max-w-2xl mx-auto bg-gray-50 shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          แก้ไขผู้ใช้งาน: {user.prefixName} {user.firstName} {user.lastName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ["คำนำหน้า", "prefixName"],
            ["ชื่อ", "firstName"],
            ["นามสกุล", "lastName"],
            ["อีเมล", "email"],
            ["เบอร์โทร", "phone"],
          ].map(([label, name]) => (
            <div key={name}>
              <label className="block text-gray-700 mb-1 text-sm">{label}</label>
              <input
                type="text"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => navigate("/manageuser")}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded text-gray-800"
            >
              ย้อนกลับ
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEdit;
