// api.js
// const BASE_URL = "https://backend-faculty-of-engineering-leave.onrender.com/";

const BASE_URL = "http://localhost:8000";

export const apiEndpoints = {
  login: `${BASE_URL}/auth/login`,
  getUser: `${BASE_URL}/auth/me`,
  getUserLanding: `${BASE_URL}/auth/landing`,
  leaveRequest: `${BASE_URL}/leave`,
  leaveRequestMe: `${BASE_URL}/leave-requests/me`,
  leaveRequestLanding: `${BASE_URL}/leave-requests/landing`,
  leaveBalance: `${BASE_URL}/leave-balances`,
};
