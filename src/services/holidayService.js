import { API } from "../utils/api";

const HolidayService = {
  // Get all holidays
  getAllHolidays: async (params = {}) => {
    const { page = 1, limit = 10, year, search } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (year) queryParams.append('year', year);
    if (search) queryParams.append('search', search);

    try {
      const response = await API.get(`/admin/holidays?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Get holidays error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลวันหยุดได้';
      throw new Error(errorMessage);
    }
  },

  // Get holiday by ID
  getHolidayById: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID วันหยุด');
    }

    try {
      const response = await API.get(`/admin/holidays/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get holiday error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถดึงข้อมูลวันหยุดได้';
      throw new Error(errorMessage);
    }
  },

  // Create holiday
  createHoliday: async (holidayData) => {
    if (!holidayData || !holidayData.date || !holidayData.name) {
      throw new Error('ต้องระบุวันที่และชื่อวันหยุด');
    }

    try {
      const response = await API.post('/admin/holidays', holidayData);
      return response.data;
    } catch (error) {
      console.error('Create holiday error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถสร้างวันหยุดได้';
      throw new Error(errorMessage);
    }
  },

  // Update holiday
  updateHoliday: async (id, holidayData) => {
    if (!id) {
      throw new Error('ต้องระบุ ID วันหยุด');
    }

    try {
      const response = await API.put(`/admin/holidays/${id}`, holidayData);
      return response.data;
    } catch (error) {
      console.error('Update holiday error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถอัปเดตวันหยุดได้';
      throw new Error(errorMessage);
    }
  },

  // Delete holiday
  deleteHoliday: async (id) => {
    if (!id) {
      throw new Error('ต้องระบุ ID วันหยุด');
    }

    try {
      const response = await API.delete(`/admin/holidays/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete holiday error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'ไม่สามารถลบวันหยุดได้';
      throw new Error(errorMessage);
    }
  },

  // Upload holidays from Excel
  uploadHolidaysFromExcel: async (file) => {
    if (!file) {
      throw new Error('ต้องเลือกไฟล์ Excel');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.post('/admin/holidays/upload-excel', formData, {
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

export default HolidayService;
