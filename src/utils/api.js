import axios from "axios";
// export const BASE_URL = "http://localhost:8000";

export const API = axios.create({
  // baseURL:"https://backend-faculty-of-engineering-leave.onrender.com",
  baseURL: "http://localhost:8000",
});

// Token interceptor (optional)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const BASE_URL =
  // "https://backend-faculty-of-engineering-leave.onrender.com";
  "http://localhost:8000";

export const apiEndpoints = {
  // auth
  login: `${BASE_URL}/auth/login`, // POST
  // loginByUsername: `${BASE_URL}/auth/login/username`, // POST
  register: `${BASE_URL}/auth/register`, // POST
  getMe: `${BASE_URL}/auth/me`, // GET
  userLanding: `${BASE_URL}/auth/landing`, // GET
  getVerifier: `${BASE_URL}/auth/verifier`, // GET
  getApproversForLevel: (level, date) => `${BASE_URL}/auth/approvers-for-level/${level}?date=${date}`, // GET
  getApproversForLevelProxy: (level, date) => `${BASE_URL}/auth/approvers-for-level/${level}?date=${date}`, // GET (alias for proxy checking)
  updateUserRole: `${BASE_URL}/auth/update-role`,
  forgotPassword: `${BASE_URL}/auth/forgot-password`,
  resetPassword: `${BASE_URL}/auth/reset-password`,
  changePassword: `${BASE_URL}/auth/change-password`,
  updateUser: (id) => `${BASE_URL}/auth/users/${id}`,
  // admin
  createUserByAdmin: `${BASE_URL}/admin/users`,
  getUserByIdAdmin: (id) => `${BASE_URL}/admin/users/${id}`,
  updateUserByIdAdmin: (id) => `${BASE_URL}/admin/users/${id}`,
  deleteUserByAdmin: (id) => `${BASE_URL}/admin/users/${id}`,
  userInfoById: (id) => `${BASE_URL}/auth/user-info/${id}`,
  getHoliday : `${BASE_URL}/admin/holiday`, // GET
  adminLeaveRequests : `${BASE_URL}/admin/leave-requests`, //POST

  //API
  getContact : `${BASE_URL}/api/contact`, // GET
  updateAdminContact: (key) => `${BASE_URL}/api/contact/${key}`, //PUT
  getDriveLink : `${BASE_URL}/api/dowload-template`, //GET
  updateDriveLink : `${BASE_URL}/api/drive-link`, //PUT
  exportReport : `${BASE_URL}/api/export-report`, //POST
  uploadUserExcel : `${BASE_URL}/excel/upload-users`, //POST
  downloadReport: `${BASE_URL}/api/download-report`, //POST

  getAllApprover : `${BASE_URL}/api/user/all-approver`, //GET

  // admin manage department
  departmentsAdmin: `${BASE_URL}/admin/departments`,
  departmentByIdAdmin: (id) => `${BASE_URL}/admin/departments/${id}`,

  // admin manage organization
  organizationCreate: `${BASE_URL}/admin/organizations`,
  organizationUpdate: (id) => `${BASE_URL}/admin/organizations/${id}`,

  // leave balance
  getLeaveBalanceForMe: `${BASE_URL}/leave-balances/me`, // GET

  // leave type
  availableLeaveType: `${BASE_URL}/leave-types/available`,
  getAllLeaveTypes: `${BASE_URL}/leave-types`,

  // leave request
  leaveRequest: `${BASE_URL}/leave-requests`, // CRUD
  leaveRequestMe: `${BASE_URL}/leave-requests/me`, // GET
  leaveRequestApprovedMe: `${BASE_URL}/leave-requests/my-requests/approved`, // GET
  getLeaveById: (id) => `${BASE_URL}/leave-requests/getLeaveRequest/${id}`,
  getLeaveByUserId: (id) => `${BASE_URL}/leave-requests/user/${id}`,
  getLastLeaveBefore: (userId) => `${BASE_URL}/leave-requests/last/type/${userId}`,
  leaveRequestForFirstApprover: `${BASE_URL}/leave-requests/for-approver1`, // GET
  leaveRequestForVerifier: `${BASE_URL}/leave-requests/for-verifier`, // GET
  leaveRequestForSecondApprover: `${BASE_URL}/leave-requests/for-approver2`, // GET
  leaveRequestForThirdApprover: `${BASE_URL}/leave-requests/for-approver3`, // GET
  leaveRequestForFouthApprover: `${BASE_URL}/leave-requests/for-approver4`, // GET
  leaveRequestLanding: `${BASE_URL}/leave-requests/landing`,
  leaveBalance: `${BASE_URL}/leave-balances`,

  //----------------- Approve Leave Requests ------------------//

  ApproveleaveRequestsByFirstApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/approve-by-approver1`,

  ApproveleaveRequestsByVerifier: (id) =>
    `${BASE_URL}/leave-requests/${id}/approve-by-verifier`,

  ApproveleaveRequestsBySecondApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/approve-by-approver2`,

  ApproveleaveRequestsByThirdApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/approve-by-approver3`,

  ApproveleaveRequestsByFouthApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/approve-by-approver4`,

  //----------------- Reject Leave Requests ------------------//
  RejectleaveRequestsByFirstApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/reject-by-approver1`,

  RejectleaveRequestsByVerifier: (id) =>
    `${BASE_URL}/leave-requests/${id}/reject-by-verifier`,

  RejectleaveRequestsBySecondApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/reject-by-approver2`,

  RejectleaveRequestsByThirdApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/reject-by-approver3`,

  RejectleaveRequestsByFouthApprover: (id) =>
    `${BASE_URL}/leave-requests/${id}/reject-by-approver4`,

  // dropdown data
  departments: `${BASE_URL}/auth/departments`,
  organizations: `${BASE_URL}/auth/organizations`,
  personnelTypes: `${BASE_URL}/auth/personnel-types`,

  //admin dropdown data
  lookupDepartments: `${BASE_URL}/api/lookups/departments`,
  lookupOrganizations: `${BASE_URL}/api/lookups/organizations`,
  lookupPersonnelTypes: `${BASE_URL}/api/lookups/personnel-types`,
  lookupEmploymentTypes: `${BASE_URL}/api/lookups/employment-types`,

  // signature
  signatureUpload: (userId) => `${BASE_URL}/signature/${userId}`, // POST 
  signatureGetAll: `${BASE_URL}/signature`, // GET
  signatureGetById: (id) => `${BASE_URL}/signature/get/${id}`, // GET
  signatureUpdate: (userId) => `${BASE_URL}/signature/update/${userId}`, // PUT
  signatureDelete: (userId) => `${BASE_URL}/signature/delete/${userId}`, // DELETE
  signatureGetIsMine: `${BASE_URL}/signature/me`, // GET
  signatureGetByUserId: (userId) => `${BASE_URL}/signature/user/${userId}`, // GET

  //PDF
  generatePdf: `${BASE_URL}/api/download-report`, // POST

  // Proxy Approval
  proxyApproval: `${BASE_URL}/proxy-approval`, // CRUD
  proxyApprovalById: (id) => `${BASE_URL}/proxy-approval/${id}`, // GET/PUT
  proxyApprovalByOriginal: (userId) => `${BASE_URL}/proxy-approval/original/${userId}`, // GET
  proxyApprovalByProxy: (userId) => `${BASE_URL}/proxy-approval/proxy/${userId}`, // GET
  proxyApprovalActive: (userId, level) => `${BASE_URL}/proxy-approval/active/${userId}/${level}`, // GET
  proxyApprovalCheckPermission: (userId, level) => `${BASE_URL}/proxy-approval/check-permission/${userId}/${level}`, // GET
  proxyApprovalPotentialApprovers: (level) => `${BASE_URL}/proxy-approval/potential-approvers/${level}`, // GET
  proxyApprovalCancel: (id) => `${BASE_URL}/proxy-approval/${id}/cancel`, // PATCH
  proxyApprovalExpire: `${BASE_URL}/proxy-approval/expire`, // PATCH
  proxyApprovalStats: `${BASE_URL}/proxy-approval/stats`, // GET
};
