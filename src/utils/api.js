// api.js
const BASE_URL = "http://localhost:8000";

export const apiEndpoints = {
  login: `${BASE_URL}/auth/login`,
  //register: `${BASE_URL}/auth/register`,
  getUser: `${BASE_URL}/auth/me`,
};
