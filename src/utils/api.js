// api.js
// const BASE_URL = "https://backend-faculty-of-engineering-leave.onrender.com/";
import axios from "axios";
const BASE_URL = "http://localhost:8000";

export const apiEndpoints = {
  // auth
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  getMe: `${BASE_URL}/auth/me`,
  userLanding: `${BASE_URL}/auth/landing`,
  userUpdate: `${BASE_URL}/auth/user/:id`,
  updateUserRole: `${BASE_URL}/:id/role`,

  // leave request
  leaveRequest: `${BASE_URL}/leave-requests`,
  leaveRequestMe: `${BASE_URL}/leave-requests/me`,
  leaveRequestLanding: `${BASE_URL}/leave-requests/landing`,
  leaveBalance: `${BASE_URL}/leave-balances`,

  // new dropdown endpoints for register form
  positions: `${BASE_URL}/positions`,        
  departments: `${BASE_URL}/departments`,     
  organizations: `${BASE_URL}/organizations`,
  personalTypes: `${BASE_URL}/personal-types`,
};
