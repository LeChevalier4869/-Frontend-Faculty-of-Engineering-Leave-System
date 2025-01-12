export default function getApiUrl(endpoint) {
    const BASE_URL = 'https://backend-faculty-of-engineering-leave.onrender.com/';
    return `${BASE_URL}/${endpoint}`;
}