export default function getApiUrl(endpoint) {
    const BASE_URL = 'http://13.228.225.19:8000';
    return `${BASE_URL}/${endpoint}`;
}