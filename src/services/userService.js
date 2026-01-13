import { API } from "../utils/api";

const UserService = {
  // Get all users (Admin)
  getAllUsers: async (params = {}) => {
    const { page = 1, limit = 10, search, departmentId, role } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) queryParams.append('search', search);
    if (departmentId) queryParams.append('departmentId', departmentId);
    if (role) queryParams.append('role', role);

    try {
      const response = await API.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID ผู้ใช้');
    }

    try {
      const response = await API.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // Create user (Admin)
  createUser: async (userData) => {
    if (!userData || !userData.email || !userData.password) {
      throw new Error('ต้องระบุอีเมลและรหัสผ่าน');
    }

    try {
      const response = await API.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถสร้างผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // Update user (Admin)
  updateUser: async (id, userData) => {
    if (!id) {
      throw new Error('ต้องระบุ ID ผู้ใช้');
    }

    try {
      const response = await API.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปเดตผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // Delete user (Admin)
  deleteUser: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID ผู้ใช้');
    }

    try {
      const response = await API.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถลบผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // Get user profile
  getUserProfile: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID ผู้ใช้');
    }

    try {
      const response = await API.get(`/admin/users/${id}/profile`);
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลโปรไฟล์ผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // Upload users from Excel
  uploadUsersFromExcel: async (file) => {
    if (!file) {
      throw new Error('ต้องเลือกไฟล์ Excel');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/admin/users/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload Excel error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปโหลดไฟล์ Excel ได้';
      throw new Error(errorMessage);
    }
  },
};

export default UserService;
