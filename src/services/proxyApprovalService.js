import { API } from "../utils/api";

const ProxyApprovalService = {
  // Get all proxy approvals
  getAllProxyApprovals: async (params = {}) => {
    const { page = 1, limit = 10, status, approverId, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      // ถ้า status เป็น string ที่มีหลายค่า (คั่นด้วย ,)
      if (status.includes(',')) {
        // แยกค่าและ append แต่ละค่า
        status.split(',').forEach(s => {
          if (s.trim()) queryParams.append('status', s.trim());
        });
      } else {
        // ถ้าเป็นค่าเดียว
        queryParams.append('status', status);
      }
    }
    if (approverId) queryParams.append('approverId', approverId);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    try {
      const response = await API.get(`/proxy-approval?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get proxy approvals error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลการมอบอำนาจได้';
      throw new Error(errorMessage);
    }
  },

  // Get proxy approval by ID
  getProxyApprovalById: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID การมอบอำนาจ');
    }

    try {
      const response = await API.get(`/proxy-approval/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get proxy approval error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลการมอบอำนาจได้';
      throw new Error(errorMessage);
    }
  },

  // Create proxy approval
  createProxyApproval: async (proxyData) => {
    if (!proxyData || !proxyData.approverId || !proxyData.level || !proxyData.startDate || !proxyData.endDate) {
      throw new Error('ต้องระบุผู้รับมอบอำนาจ ระดับ และวันที่');
    }

    try {
      const response = await API.post('/proxy-approval', proxyData);
      return response.data;
    } catch (error) {
      console.error('Create proxy approval error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถสร้างการมอบอำนาจได้';
      throw new Error(errorMessage);
    }
  },

  // Update proxy approval
  updateProxyApproval: async (id, proxyData) => {
    if (!id) {
      throw new Error('ต้องระบุ ID การมอบอำนาจ');
    }

    try {
      const response = await API.put(`/proxy-approval/${id}`, proxyData);
      return response.data;
    } catch (error) {
      console.error('Update proxy approval error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปเดตการมอบอำนาจได้';
      throw new Error(errorMessage);
    }
  },

  // Cancel proxy approval
  cancelProxyApproval: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID การมอบอำนาจ');
    }

    try {
      const response = await API.patch(`/proxy-approval/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel proxy approval error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถยกเลิกการมอบอำนาจได้';
      throw new Error(errorMessage);
    }
  },

  // Expire proxy approval
  expireProxyApproval: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID การมอบอำนาจ');
    }

    try {
      const response = await API.patch('/proxy-approval/expire', { id });
      return response.data;
    } catch (error) {
      console.error('Expire proxy approval error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถหมดอายุการมอบอำนาจได้';
      throw new Error(errorMessage);
    }
  },

  // Get potential approvers for level
  getPotentialApprovers: async (level) => {
    if (!level) {
      throw new Error('ต้องระบุระดับ');
    }

    try {
      const response = await API.get(`/proxy-approval/potential-approvers/${level}`);
      return response.data;
    } catch (error) {
      console.error('Get potential approvers error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลผู้อนุมัติที่เป็นไปได้ได้';
      throw new Error(errorMessage);
    }
  },

  // Get proxy approval stats
  getProxyApprovalStats: async () => {
    try {
      const response = await API.get('/proxy-approval/stats');
      return response.data;
    } catch (error) {
      console.error('Get proxy stats error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลสถิติการมอบอำนาจได้';
      throw new Error(errorMessage);
    }
  },

  // Get proxy approvals for dashboard
  getProxyApprovalsForDashboard: async () => {
    try {
      const response = await API.get('/proxy-approval/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard proxy approvals error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลการมอบอำนาจสำหรับ dashboard ได้';
      throw new Error(errorMessage);
    }
  },
};

export default ProxyApprovalService;
