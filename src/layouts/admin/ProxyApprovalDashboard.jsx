import React, { useState, useEffect } from 'react';
import { API, apiEndpoints } from '../../utils/api';
import { FaUserShield, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ProxyApprovalDashboard = () => {
  const [activeProxies, setActiveProxies] = useState([]);
  const [myProxies, setMyProxies] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProxyData();
  }, []);

  const loadProxyData = async () => {
    try {
      setLoading(true);
      
      // Load all active proxy approvals
      const allProxiesResponse = await API.get(apiEndpoints.proxyApproval);
      const allProxies = allProxiesResponse.data.data || [];
      
      // Load stats
      const statsResponse = await API.get(apiEndpoints.proxyApprovalStats);
      setStats(statsResponse.data.data || {
        total: allProxies.length,
        active: allProxies.filter(p => p.status === 'ACTIVE').length,
        expired: allProxies.filter(p => p.status === 'EXPIRED').length,
        cancelled: allProxies.filter(p => p.status === 'CANCELLED').length,
      });
      
      // Filter active proxies
      setActiveProxies(allProxies.filter(proxy => proxy.status === 'ACTIVE'));
      
    } catch (error) {
      console.error('Error loading proxy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'ACTIVE' ? 'ใช้งานอยู่' : status === 'EXPIRED' ? 'หมดอายุ' : 'ถูกยกเลิก'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ภาพรวมการมอบอำนาจ</h1>
        <p className="text-gray-600">ตรวจสอบสถานะการมอบอำนาจในระบบ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUserShield className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">ใช้งานอยู่</p>
              <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <FaCalendarAlt className="text-gray-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">หมดอายุ</p>
              <p className="text-2xl font-bold text-gray-800">{stats.expired}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <FaTimesCircle className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">ถูกยกเลิก</p>
              <p className="text-2xl font-bold text-gray-800">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Proxy Approvals */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-800">การมอบอำนาจที่ใช้งานอยู่</h2>
        </div>
        
        {activeProxies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            ไม่มีการมอบอำนาจที่ใช้งานอยู่ในขณะนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้อนุมัติต้นฉบับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้อนุมัติแทน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ระดับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeProxies.map((proxy) => (
                  <tr key={proxy.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {proxy.originalApprover?.firstName} {proxy.originalApprover?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{proxy.originalApprover?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {proxy.proxyApprover?.firstName} {proxy.proxyApprover?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{proxy.proxyApprover?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proxy.approverLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proxy.isDaily ? (
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          {formatDate(proxy.dailyDate)}
                        </div>
                      ) : (
                        <div>
                          <div>{formatDate(proxy.startDate)}</div>
                          <div className="text-gray-500">ถึง {formatDate(proxy.endDate)}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(proxy.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">การดำเนินการด่วน</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/admin/proxy-approval'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FaUserShield />
            จัดการการมอบอำนาจ
          </button>
          
          <button
            onClick={loadProxyData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <FaCalendarAlt />
            รีเฟรชข้อมูล
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <FaCheckCircle />
            กลับแดชบอร์ด
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProxyApprovalDashboard;
