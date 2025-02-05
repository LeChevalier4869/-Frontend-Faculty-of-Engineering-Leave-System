// api.js
// const BASE_URL = "https://backend-faculty-of-engineering-leave.onrender.com/";

const BASE_URL = "http://localhost:8000";

export const apiEndpoints = {
  //auth
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  getMe: `${BASE_URL}/auth/me`,
  userLanding: `${BASE_URL}/auth/landing`,
  updateUserRole: `${BASE_URL}/:id/role`,

  //leave request
  leaveRequest: `${BASE_URL}/leave-requests`,
  leaveRequestMe: `${BASE_URL}/leave-requests/me`,
  leaveRequestLanding: `${BASE_URL}/leave-requests/landing`,
  leaveBalance: `${BASE_URL}/leave-balances`,
};
