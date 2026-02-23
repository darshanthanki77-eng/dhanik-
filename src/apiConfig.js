const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '' // In production, same domain /api/...
    : 'http://localhost:5001';

export default API_BASE_URL;
