const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;
