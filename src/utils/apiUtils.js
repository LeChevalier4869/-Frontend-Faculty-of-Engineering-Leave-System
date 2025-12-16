export default function getApiUrl(endpoint) {
    // const BASE_URL = 'https://backend-faculty-of-engineering-leave.onrender.com';
    const BASE_URL = 'http://localhost:8000';
    return `${BASE_URL}/${endpoint}`;
}
