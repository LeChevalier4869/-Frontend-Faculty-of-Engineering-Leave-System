import axios from "axios";
// export const BASE_URL = "http://localhost:8000";
export const BASE_URL = "https://backend-faculty-of-engineering-leave.onrender.com";

export const apiEndpoints = {
  // auth
  login: `${BASE_URL}/auth/login`, // POST
  register: `${BASE_URL}/auth/register`, // POST
  getMe: `${BASE_URL}/auth/me`, // GET
  userLanding: `${BASE_URL}/auth/landing`, // GET
  updateUserRole: `${BASE_URL}/auth/update-role`, 
  updateUser: (id) => `${BASE_URL}/auth/users/${id}`,
  // admin
  createUserByAdmin: `${BASE_URL}/admin/users`,
  getUserByIdAdmin: (id) => `${BASE_URL}/admin/users/${id}`,
  updateUserByIdAdmin: (id) => `${BASE_URL}/admin/users/${id}`,
  deleteUserByAdmin: (id) => `${BASE_URL}/admin/users/${id}`,
  userInfoById: (id) => `${BASE_URL}/auth/user-info/${id}`,
  
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

  // leave request
  leaveRequest: `${BASE_URL}/leave-requests`, // CRUD
  leaveRequestMe: `${BASE_URL}/leave-requests/me`, // GET
  leaveRequestForFirstApprover: `${BASE_URL}/leave-requests/for-approver1`, // GET
  leaveRequestForVerifier: `${BASE_URL}/leave-requests/for-verifier`, // GET
  leaveRequestForReceiver: `${BASE_URL}/leave-requests/for-receiver`, // GET
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

  ApproveleaveRequestsByReceiver: (id) =>
    `${BASE_URL}/leave-requests/${id}/approve-by-receiver`,

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
  
  RejectleaveRequestsByReceiver: (id) =>
    `${BASE_URL}/leave-requests/${id}/reject-by-receiver`,

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
};
