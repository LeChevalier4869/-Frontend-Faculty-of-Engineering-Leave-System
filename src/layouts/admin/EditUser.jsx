import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { apiEndpoints } from "../../utils/api";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    prefixName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(apiEndpoints.userLanding, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = res.data.user || [];
      const u = users.find((u) => u.id === parseInt(id, 10));
      if (!u) throw new Error("User not found");

      setUser(u);
      setFormData({
        prefixName: u.prefixName || "",
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || "",
        phone: u.phone || "",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("ไม่พบผู้ใช้งาน", "", "error").then(() =>
        navigate("/manageuser")
      );
    } finally {
      setLoading(false);
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

      Swal.fire(
        "อัปเดตสำเร็จ",
        "ข้อมูลผู้ใช้งานได้รับการอัปเดตแล้ว",
        "success"
      ).then(() => navigate("/manageuser"));
    } catch (err) {
      console.error(err);
      Swal.fire(
        "อัปเดตล้มเหลว",
        err.response?.data?.message || "ไม่สามารถอัปเดตได้",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black text-lg">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 font-kanit">
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-black mb-6 text-center">
          แก้ไขผู้ใช้งาน
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["คำนำหน้า", "prefixName", "text"],
              ["ชื่อจริง", "firstName", "text"],
              ["นามสกุล", "lastName", "text"],
              ["อีเมล", "email", "email"],
              ["เบอร์โทรศัพท์", "phone", "text"],
            ].map(([label, name, type]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-black mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/manage-user")}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-black"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
            >
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
