import React, { useState } from "react";
import Swal from "sweetalert2";

function DepartmentManage() {
  const [departments, setDepartments] = useState([
    { id: 1, name: "วิศวกรรมคอมพิวเตอร์" },
    { id: 2, name: "วิศวกรรมไฟฟ้า" },
    { id: 3, name: "วิศวกรรมโยธา" },
  ]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setDepartments([
      ...departments,
      { id: departments.length + 1, name: newName },
    ]);
    setNewName("");
  };

  const handleEdit = (id) => {
    const dept = departments.find((d) => d.id === id);
    setNewName(dept.name);
    setEditId(id);
  };

  const handleUpdate = () => {
    if (!newName.trim()) return;
    setDepartments((prev) =>
      prev.map((d) => (d.id === editId ? { ...d, name: newName } : d))
    );
    setNewName("");
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การลบนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });

    if (confirm.isConfirmed) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      Swal.fire("ลบสำเร็จ!", "ข้อมูลแผนกถูกลบแล้ว", "success");
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10 font-kanit text-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">จัดการแผนก</h1>

        {/* ฟอร์มเพิ่ม/อัปเดต */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            placeholder="กรอกชื่อแผนก"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
          {editId ? (
            <button
              onClick={handleUpdate}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg transition-all"
            >
              อัปเดต
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-all"
            >
              เพิ่ม
            </button>
          )}
        </div>

        {/* ตารางแสดงข้อมูล */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 font-semibold text-black">#</th>
                <th className="px-4 py-3 font-semibold text-black">ชื่อแผนก</th>
                <th className="px-4 py-3 font-semibold text-center text-black">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-black">{dept.id}</td>
                  <td className="px-4 py-2 text-black">{dept.name}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(dept.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    ยังไม่มีข้อมูลแผนก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DepartmentManage;
