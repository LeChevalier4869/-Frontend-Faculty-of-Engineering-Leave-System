import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaCalendarAlt, FaUser, FaClock, FaClipboardList } from "react-icons/fa";
import AuditLogService from "../../services/auditLogService";

const AuditLogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    startDate: "",
    endDate: "",
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ดึงข้อมูล Audit Logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      
      // ถ้ามีคำค้นหา ให้ค้นหาใน action field
      if (searchTerm) {
        params.action = searchTerm;
      }

      const response = await AuditLogService.getAllLogs(params);
      setLogs(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      // แสดงข้อความ error แบบ user-friendly
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล Audit Log กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลสถิติ
  const fetchStats = async () => {
    try {
      const response = await AuditLogService.getActionStats();
      setStats(response.data || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [pagination.page, pagination.limit]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAuditLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      userId: "",
      action: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionColor = (action) => {
    const colors = {
      "เข้าสู่ระบบ": "text-green-600",
      "ออกจากระบบ": "text-red-600",
      "สร้างผู้ใช้งาน": "text-blue-600",
      "อัปเดตข้อมูลผู้ใช้งาน": "text-yellow-600",
      "ลบผู้ใช้งาน": "text-red-600",
      "สร้างคำขอลา": "text-green-600",
      "อัปเดตสถานะคำขอลา": "text-purple-600",
      "ยกเลิกคำขอลา": "text-orange-600",
      "สร้างการมอบอำนาจ": "text-indigo-600",
      "อัปเดตการมอบอำนาจ": "text-yellow-600",
      "ยกเลิกการมอบอำนาจ": "text-red-600",
    };
    return colors[action] || "text-gray-600";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการ Audit Log</h1>
        <p className="text-gray-600">ตรวจสอบและติดตามการกระทำของผู้ใช้งานในระบบ</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.slice(0, 8).map((stat, index) => (
          <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 truncate">{stat.action}</p>
                <p className="text-2xl font-bold text-blue-600">{stat.count}</p>
              </div>
              <FaClipboardList className="text-blue-500 text-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาการกระทำ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaFilter />
            {showFilters ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ค้นหา
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            รีเซ็ต
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผู้ใช้
              </label>
              <input
                type="number"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="รหัสผู้ใช้"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Audit Logs Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่และเวลา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ใช้งาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การกระทำ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รายละเอียด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  คำขอลา
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูล Audit Log
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-400" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {log.user?.prefixName} {log.user?.firstName} {log.user?.lastName}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {log.user?.email}
                          </div>
                          {log.user?.department && (
                            <div className="text-gray-500 text-xs">
                              {log.user.department.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={log.details}>
                        {log.details || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.leaveRequest ? (
                        <div className="flex items-center">
                          <FaClipboardList className="mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {log.leaveRequest.leaveType?.name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {formatDateTime(log.leaveRequest.startDate)} - {formatDateTime(log.leaveRequest.endDate)}
                            </div>
                            <div className="text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                log.leaveRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                log.leaveRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {log.leaveRequest.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            แสดง {((pagination.page - 1) * pagination.limit) + 1} ถึง{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} จากทั้งหมด {pagination.total} รายการ
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            
            <span className="px-3 py-1 text-sm text-gray-700">
              หน้า {pagination.page} จาก {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogManagement;
