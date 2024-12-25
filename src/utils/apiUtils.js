export default function getApiUrl(endpoint) {
    const BASE_URL = 'http://localhost:8000';
    return `${BASE_URL}/${endpoint}`;
}