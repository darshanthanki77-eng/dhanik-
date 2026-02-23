const express = require('express');
const { contactSupport, getFaqs } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/contact', protect, contactSupport);
router.get('/faqs', getFaqs);

module.exports = router;
