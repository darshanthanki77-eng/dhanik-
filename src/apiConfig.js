const API_BASE_URL = import.meta.env.MODE === 'production'
    ? '' // In production, same domain /api/...
    : 'http://localhost:5001';

export default API_BASE_URL;
