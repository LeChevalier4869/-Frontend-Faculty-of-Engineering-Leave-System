import { API } from '../utils/api';

const PositionNumberService = {
  // อัปเดตเลขที่ตำแหน่งของผู้ใช้
  updateUserPositionNumber: async (userId, positionNumber) => {
    try {
      const response = await API.put(`/admin/users/${userId}/position-number`, {
        positionNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error updating position number:', error);
      throw error;
    }
  },

  // ดึงประวัติเลขที่ตำแหน่งของผู้ใช้
  getUserPositionHistory: async (userId) => {
    try {
      const response = await API.get(`/admin/users/${userId}/position-number/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position history:', error);
      throw error;
    }
  },

  // ดึงเลขที่ตำแหน่งปัจจุบันของผู้ใช้
  getCurrentPositionNumber: async (userId) => {
    try {
      const response = await API.get(`/admin/users/${userId}/position-number/current`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current position number:', error);
      throw error;
    }
  },

  // ค้นหาผู้ใช้ตามเลขที่ตำแหน่ง
  getPositionNumberByNumber: async (positionNumber) => {
    try {
      const response = await API.get(`/admin/position-numbers/${positionNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error searching by position number:', error);
      throw error;
    }
  },

  // ดึงข้อมูลผู้ใช้พร้อมเลขที่ตำแหน่ง (สำหรับแสดงในตาราง)
  getUsersWithPositionNumbers: async (options = {}) => {
    try {
      const { page = 1, limit = 50, search } = options;
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (search) params.append('search', search);

      // ใช้ endpoint ที่มีอยู่จริงจาก backend (ตอนนี้ backend ส่ง positionNumbers มาแล้ว)
      const response = await API.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users with position numbers:', error);
      throw error;
    }
  }
};

export default PositionNumberService;
