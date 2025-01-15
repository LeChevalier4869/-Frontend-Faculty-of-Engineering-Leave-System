// api.js
const BASE_URL = "http://localhost:8000";

export const apiEndpoints = {
  login: `${BASE_URL}/auth/login`,
  //register: `${BASE_URL}/auth/register`,
  getUser: `${BASE_URL}/auth/me`,
  getUserLanding: `${BASE_URL}/user/landing`,
  //รอแก้ไข
  leaveRequest: `${BASE_URL}/leave`,
  leaveRequestMe: `${BASE_URL}/leave-requests/me`,
};
