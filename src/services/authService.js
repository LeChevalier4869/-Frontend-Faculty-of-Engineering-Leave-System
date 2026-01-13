import { API } from "../utils/api";

const AuthService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'เข้าสู่ระบบไม่สำเร็จ';
      throw new Error(errorMessage);
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'สมัครสมาชิกไม่สำเร็จ';
      throw new Error(errorMessage);
    }
  },

  // Get current user info
  getMe: async () => {
    try {
      const response = await API.get('/auth/me');
      // Backend sends user data in response.data
      return response.data;
    } catch (error) {
      console.error('Get me error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },

  // User landing page
  getUserLanding: async () => {
    try {
      const response = await API.get('/auth/landing');
      return response.data;
    } catch (error) {
      console.error('User landing error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลหน้าแรกได้';
      throw new Error(errorMessage);
    }
  },

  // Get verifier
  getVerifier: async () => {
    try {
      const response = await API.get('/auth/verifier');
      return response.data;
    } catch (error) {
      console.error('Get verifier error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลผู้ตรวจสอบได้';
      throw new Error(errorMessage);
    }
  },

  // Get approvers for level
  getApproversForLevel: async (level, date) => {
    try {
      const response = await API.get(`/auth/approvers-for-level/${level}?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Get approvers error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลผู้อนุมัติได้';
      throw new Error(errorMessage);
    }
  },

  // Update user role
  updateUserRole: async (roleData) => {
    try {
      const response = await API.put('/auth/update-role', roleData);
      return response.data;
    } catch (error) {
      console.error('Update role error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปเดตบทบาทได้';
      throw new Error(errorMessage);
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await API.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดำเนินการลืมรหัสผ่านได้';
      throw new Error(errorMessage);
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await API.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้';
      throw new Error(errorMessage);
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await API.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้';
      throw new Error(errorMessage);
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await API.put(`/auth/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้';
      throw new Error(errorMessage);
    }
  },
};

export default AuthService;
