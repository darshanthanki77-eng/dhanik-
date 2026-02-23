const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://dhanik.vercel.app'
    : 'http://localhost:5001';

export default API_BASE_URL;
