import axios from "axios";
const BASE_URL = "http://localhost:8000";

export const apiEndpoints = {
  // auth
  login:           `${BASE_URL}/auth/login`,            // POST
  register:        `${BASE_URL}/auth/register`,         // POST
  getMe:           `${BASE_URL}/auth/me`,               // GET
  userLanding:     `${BASE_URL}/auth/landing`,          // GET
  updateUserRole:  `${BASE_URL}/auth/update-role`,      // POST /auth/update-role/:id
  updateUser:      `${BASE_URL}/users`,                 // PUT  /users

  // admin
  createUserByAdmin:    `${BASE_URL}/admin/users`, 
  getUserByIdAdmin:     (id) => `${BASE_URL}/admin/users/${id}`,
  updateUserByIdAdmin:  (id) => `${BASE_URL}/admin/users/${id}`,
  deleteUserByAdmin:    (id) => `${BASE_URL}/admin/users/${id}`,

  // admin manage department
  departmentsAdmin:       `${BASE_URL}/admin/departments`,       
  departmentByIdAdmin:    (id) => `${BASE_URL}/admin/departments/${id}`,

  // leave request
  leaveRequest:        `${BASE_URL}/leave-requests`,     // CRUD
  leaveRequestMe:      `${BASE_URL}/leave-requests/me`,  // GET
  leaveRequestLanding: `${BASE_URL}/leave-requests/landing`,
  leaveBalance:        `${BASE_URL}/leave-balances`,

  // dropdown data
  departments:     `${BASE_URL}/auth/departments`,
  organizations:   `${BASE_URL}/auth/organizations`,
  personnelTypes:  `${BASE_URL}/auth/personnel-types`,

  //admin dropdown data
  lookupDepartments:      `${BASE_URL}/api/lookups/departments`,
  lookupOrganizations:    `${BASE_URL}/api/lookups/organizations`,
  lookupPersonnelTypes:   `${BASE_URL}/api/lookups/personnel-types`,
  lookupEmploymentTypes:  `${BASE_URL}/api/lookups/employment-types`,
};
