import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API, apiEndpoints } from "../../utils/api";
import { FaUsersCog, FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";

const Panel = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await API.get(apiEndpoints.getRoles);
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูล Role ได้",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter roles based on search
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูล",
        text: "กรุณากรอกชื่อ Role",
      });
      return;
    }

    try {
      const response = await API.post(apiEndpoints.createRole, {
        name: formData.name.trim()
      });

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "สร้าง Role ใหม่เรียบร้อยแล้ว",
      });

      setShowAddModal(false);
      setFormData({ name: "" });
      fetchRoles();
    } catch (error) {
      console.error("Error creating role:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถสร้าง Role ได้",
      });
    }
  };

  // Handle update role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูล",
        text: "กรุณากรอกชื่อ Role",
      });
      return;
    }

    try {
      const response = await API.put(apiEndpoints.updateRole(editingRole.id), {
        name: formData.name.trim()
      });

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "อัพเดต Role เรียบร้อยแล้ว",
      });

      setShowEditModal(false);
      setEditingRole(null);
      setFormData({ name: "" });
      fetchRoles();
    } catch (error) {
      console.error("Error updating role:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถอัพเดต Role ได้",
      });
    }
  };

  // Handle delete role
  const handleDeleteRole = async (role) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      text: `คุณต้องการลบ Role "${role.name}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(apiEndpoints.deleteRole(role.id));

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "ลบ Role เรียบร้อยแล้ว",
      });

      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถลบ Role ได้",
      });
    }
  };

  // Open edit modal
  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name });
    setShowEditModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingRole(null);
    setFormData({ name: "" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsersCog className="text-blue-600" />
            จัดการ Role
          </h1>
          <p className="text-gray-600 mt-1">จัดการสิทธิ์การเข้าถึงและบทบาทในระบบ</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          เพิ่ม Role ใหม่
        </button>
      </div>

      {/* Search Bar */}
      <Panel className="p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา Role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Panel>

      {/* Roles Table */}
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สร้างเมื่อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? "ไม่พบ Role ที่ค้นหา" : "ไม่มีข้อมูล Role"}
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.createdAt
                        ? new Date(role.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="แก้ไข"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="ลบ"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">เพิ่ม Role ใหม่</h2>
            <form onSubmit={handleCreateRole}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ Role
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น MANAGER, HR, SUPER_ADMIN"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  เพิ่ม Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">แก้ไข Role</h2>
            <form onSubmit={handleUpdateRole}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ Role
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น MANAGER, HR, SUPER_ADMIN"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  อัพเดต Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
