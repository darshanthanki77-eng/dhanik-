const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Personal Info
            user.name = req.body.name || user.name;
            user.walletAddress = req.body.walletAddress || user.walletAddress;

            // Password Update
            if (req.body.password && req.body.currentPassword) {
                const isMatch = await user.matchPassword(req.body.currentPassword);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Current password is incorrect' });
                }
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Return updated user data (matching storage format)
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                referralId: updatedUser.referralId,
                referredBy: updatedUser.referredBy,
                walletAddress: updatedUser.walletAddress,
                wallet: updatedUser.wallet,
                referrals: updatedUser.referrals,
                income: updatedUser.income,
                status: updatedUser.status,
                kycStatus: updatedUser.kycStatus,
                createdAt: updatedUser.createdAt
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile };
