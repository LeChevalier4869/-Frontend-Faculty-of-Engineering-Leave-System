import { API, apiEndpoints } from '../utils/api';

const AuditLogService = {
  // ดึงข้อมูล Audit Log ทั้งหมด (สำหรับ Admin)
  getAllAuditLogs: async (options = {}) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        userId, 
        action, 
        startDate, 
        endDate 
      } = options;
      
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await API.get(`${apiEndpoints.auditLogs}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get all audit logs error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูล Audit Log ได้';
      throw new Error(errorMessage);
    }
  },

  // ดึงข้อมูล Audit Log ทั้งหมด (ไม่มี pagination)
  getAllAuditLogsAll: async (options = {}) => {
    try {
      const { 
        userId, 
        action, 
        startDate, 
        endDate 
      } = options;
      
      const params = new URLSearchParams();
      
      if (userId) params.append('userId', userId);
      if (action) params.append('action', action);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await API.get(`${apiEndpoints.auditLogsAll}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get all audit logs (all) error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูล Audit Log ทั้งหมดได้';
      throw new Error(errorMessage);
    }
  },

  // ดึงข้อมูลสถิติการกระทำ
  getActionStats: async () => {
    try {
      const response = await API.get(apiEndpoints.auditLogsStats);
      return response.data;
    } catch (error) {
      console.error('Get action stats error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลสถิติได้';
      throw new Error(errorMessage);
    }
  },

  // ดึงข้อมูล Audit Log ตาม userId
  getAuditLogsByUserId: async (userId, options = {}) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        action, 
        startDate, 
        endDate 
      } = options;
      
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (action) params.append('action', action);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await API.get(`${apiEndpoints.auditLogsByUser(userId)}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get audit logs by user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูล Audit Log ตามผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // ดึงข้อมูล Audit Log ตาม leaveRequestId
  getAuditLogsByLeaveRequestId: async (leaveRequestId) => {
    try {
      const response = await API.get(apiEndpoints.auditLogsByLeaveRequest(leaveRequestId));
      return response.data;
    } catch (error) {
      console.error('Get audit logs by leave request error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูล Audit Log ตามคำขอลาได้';
      throw new Error(errorMessage);
    }
  },

  // สร้าง Audit Log ใหม่ (สำหรับการทดสอบ)
  createAuditLog: async (logData) => {
    try {
      const response = await API.post(apiEndpoints.auditLogsCreate, logData);
      return response.data;
    } catch (error) {
      console.error('Create audit log error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถสร้าง Audit Log ได้';
      throw new Error(errorMessage);
    }
  },

  // บันทึกการกระทำของผู้ใช้
  logUserAction: async (actionData) => {
    try {
      const response = await API.post(apiEndpoints.auditLogsLogAction, actionData);
      return response.data;
    } catch (error) {
      console.error('Log user action error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถบันทึกการกระทำได้';
      throw new Error(errorMessage);
    }
  },
};

export default AuditLogService;
