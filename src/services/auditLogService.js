import { API } from "../utils/api";

const AuditLogService = {
  // ดึงข้อมูล Audit Log ทั้งหมด (สำหรับ Admin)
  getAllLogs: async (params = {}) => {
    const { page = 1, limit = 50, userId, action, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (userId) queryParams.append('userId', userId.toString());
    if (action) queryParams.append('action', action);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    try {
      const response = await API.get(`/admin/audit-logs/all?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูล Audit Log ได้';
      throw new Error(errorMessage);
    }
  },

  // ดึงข้อมูล Audit Log ตาม userId
  getLogsByUserId: async (userId, params = {}) => {
    if (!userId) {
      throw new Error('ต้องระบุ userId');
    }

    const { page = 1, limit = 50, action, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (action) queryParams.append('action', action);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    try {
      const response = await API.get(`/admin/audit-logs/user/${userId}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูล Audit Log ของผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // ดึงข้อมูล Audit Log ตาม leaveRequestId
  getLogsByLeaveRequestId: async (leaveRequestId) => {
    if (!leaveRequestId) {
      throw new Error('ต้องระบุ leaveRequestId');
    }

    try {
      const response = await API.get(`/admin/audit-logs/leave-request/${leaveRequestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave request audit logs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูล Audit Log ของคำขอลาได้';
      throw new Error(errorMessage);
    }
  },

  // ดึงข้อมูลสถิติการกระทำ (สำหรับ Dashboard)
  getActionStats: async (params = {}) => {
    const { startDate, endDate } = params;
    
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const url = queryParams.toString() 
      ? `/admin/audit-logs/stats?${queryParams}`
      : '/admin/audit-logs/stats';

    try {
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching action stats:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลสถิติได้';
      throw new Error(errorMessage);
    }
  },

  // สร้าง Audit Log ใหม่ (สำหรับการทดสอบหรือการใช้งานพิเศษ)
  createAuditLog: async (logData) => {
    if (!logData || !logData.userId || !logData.action) {
      throw new Error('ต้องระบุ userId และ action');
    }

    try {
      const response = await API.post('/admin/audit-logs', logData);
      return response.data;
    } catch (error) {
      console.error('Error creating audit log:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถสร้าง Audit Log ได้';
      throw new Error(errorMessage);
    }
  },

  // บันทึกการกระทำของผู้ใช้ (สำหรับระบบอัตโนมัติ)
  logUserAction: async (actionData) => {
    if (!actionData || !actionData.userId || !actionData.action) {
      throw new Error('ต้องระบุ userId และ action');
    }

    try {
      const response = await API.post('/admin/audit-logs/log-action', actionData);
      return response.data;
    } catch (error) {
      console.error('Error logging user action:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถบันทึกการกระทำได้';
      throw new Error(errorMessage);
    }
  },
};

export default AuditLogService;
