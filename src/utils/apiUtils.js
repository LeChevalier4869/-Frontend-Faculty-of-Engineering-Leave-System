import { BASE_URL } from "./api";

export default function getApiUrl(endpoint) {
    return `${BASE_URL}/${endpoint}`;
}
