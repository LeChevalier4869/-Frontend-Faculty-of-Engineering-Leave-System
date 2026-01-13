import { API } from "../utils/api";

const LeaveRequestService = {
  // Get all leave requests (Admin)
  getAllLeaveRequests: async (params = {}) => {
    const { page = 1, limit = 10, status, userId, departmentId, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) queryParams.append('status', status);
    if (userId) queryParams.append('userId', userId);
    if (departmentId) queryParams.append('departmentId', departmentId);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    try {
      const response = await API.get(`/admin/leave-requests?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get leave requests error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลคำขอลาได้';
      throw new Error(errorMessage);
    }
  },

  // Get leave request by ID
  getLeaveRequestById: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID คำขอลา');
    }

    try {
      const response = await API.get(`/admin/leave-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get leave request error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลคำขอลาได้';
      throw new Error(errorMessage);
    }
  },

  // Create leave request
  createLeaveRequest: async (requestData) => {
    if (!requestData || !requestData.leaveTypeId || !requestData.startDate || !requestData.endDate) {
      throw new Error('ต้องระบุประเภทการลาและวันที่');
    }

    try {
      const response = await API.post('/leave-requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Create leave request error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถสร้างคำขอลาได้';
      throw new Error(errorMessage);
    }
  },

  // Add leave request (Admin)
  addLeaveRequest: async (requestData) => {
    if (!requestData || !requestData.userId || !requestData.leaveTypeId) {
      throw new Error('ต้องระบุผู้ใช้และประเภทการลา');
    }

    try {
      const response = await API.post('/admin/add-leave-request', requestData);
      return response.data;
    } catch (error) {
      console.error('Add leave request error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถเพิ่มคำขอลาได้';
      throw new Error(errorMessage);
    }
  },

  // Update leave request status
  updateLeaveRequestStatus: async (id, status, comment) => {
    if (!id || !status) {
      throw new Error('ต้องระบุ ID คำขอลาและสถานะ');
    }

    try {
      const response = await API.patch(`/admin/leave-requests/${id}/status`, { status, comment });
      return response.data;
    } catch (error) {
      console.error('Update status error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปเดตสถานะคำขอลาได้';
      throw new Error(errorMessage);
    }
  },

  // Get leave balance
  getLeaveBalance: async (userId, leaveTypeId) => {
    if (!userId) {
      throw new Error('ต้องระบุ ID ผู้ใช้');
    }

    const queryParams = leaveTypeId ? `?leaveTypeId=${leaveTypeId}` : '';

    try {
      const response = await API.get(`/leave-balance/${userId}${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get leave balance error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลวันลาคงเหลือได้';
      throw new Error(errorMessage);
    }
  },

  // Get leave types
  getLeaveTypes: async () => {
    try {
      const response = await API.get('/leave-types');
      return response.data;
    } catch (error) {
      console.error('Get leave types error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลประเภทการลาได้';
      throw new Error(errorMessage);
    }
  },

  // Get leave report
  getLeaveReport: async (params = {}) => {
    const { startDate, endDate, departmentId, leaveTypeId } = params;
    
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (departmentId) queryParams.append('departmentId', departmentId);
    if (leaveTypeId) queryParams.append('leaveTypeId', leaveTypeId);

    try {
      const response = await API.get(`/admin/leave-report?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get leave report error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลรายงานการลาได้';
      throw new Error(errorMessage);
    }
  },
};

export default LeaveRequestService;
