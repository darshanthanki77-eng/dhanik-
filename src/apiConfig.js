const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '' // Same domain in production — API calls go to /api/... on the same Vercel deployment
    : 'http://localhost:5001';

export default API_BASE_URL;
