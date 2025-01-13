// api.js
// const BASE_URL = "https://backend-faculty-of-engineering-leave.onrender.com/";

const BASE_URL = "http://localhost:8000";

export const apiEndpoints = {
  login: `${BASE_URL}/auth/login`,
  //register: `${BASE_URL}/auth/register`,
  getUser: `${BASE_URL}/auth/me`,
  //รอแก้ไข
  leaveRequest: `${BASE_URL}/leave`,
};
