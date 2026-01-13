import { API } from "../utils/api";

const LeaveTypeService = {
  // Get all leave types
  getAllLeaveTypes: async (params = {}) => {
    const { page = 1, limit = 10, search } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) queryParams.append('search', search);

    try {
      const response = await API.get(`/admin/leave-types?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get leave types error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลประเภทการลาได้';
      throw new Error(errorMessage);
    }
  },

  // Get leave type by ID
  getLeaveTypeById: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID ประเภทการลา');
    }

    try {
      const response = await API.get(`/admin/leave-types/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get leave type error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลประเภทการลาได้';
      throw new Error(errorMessage);
    }
  },

  // Create leave type
  createLeaveType: async (leaveTypeData) => {
    if (!leaveTypeData || !leaveTypeData.name) {
      throw new Error('ต้องระบุชื่อประเภทการลา');
    }

    try {
      const response = await API.post('/admin/leave-types', leaveTypeData);
      return response.data;
    } catch (error) {
      console.error('Create leave type error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถสร้างประเภทการลาได้';
      throw new Error(errorMessage);
    }
  },

  // Update leave type
  updateLeaveType: async (id, leaveTypeData) => {
    if (!id) {
      throw new Error('ต้องระบุ ID ประเภทการลา');
    }

    try {
      const response = await API.put(`/admin/leave-types/${id}`, leaveTypeData);
      return response.data;
    } catch (error) {
      console.error('Update leave type error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปเดตประเภทการลาได้';
      throw new Error(errorMessage);
    }
  },

  // Delete leave type
  deleteLeaveType: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID ประเภทการลา');
    }

    try {
      const response = await API.delete(`/admin/leave-types/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete leave type error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถลบประเภทการลาได้';
      throw new Error(errorMessage);
    }
  },
};

export default LeaveTypeService;
