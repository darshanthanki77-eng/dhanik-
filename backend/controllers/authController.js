const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, referralCode } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Create unique referral ID for new user (DHK + 4 random numbers)
        let newReferralId;
        let isUnique = false;
        while (!isUnique) {
            newReferralId = 'DHK' + Math.floor(1000 + Math.random() * 9000);
            const existingUser = await User.findOne({ referralId: newReferralId });
            if (!existingUser) isUnique = true;
        }

        const user = await User.create({
            name,
            email,
            password,
            referredBy: referralCode || null,
            referralId: newReferralId
        });

        // Referral logic: Link user to sponsors in the tree
        if (referralCode) {
            const cleanReferralCode = referralCode.trim();
            const sponsorL1 = await User.findOne({ referralId: cleanReferralCode });
            if (sponsorL1) {
                // Check if user already in level1 to prevent duplicates
                if (!sponsorL1.referrals.level1.includes(user._id)) {
                    sponsorL1.referrals.level1.push(user._id);
                    await sponsorL1.save();
                }

                // Sponsor level 2
                if (sponsorL1.referredBy) {
                    const cleanRefL2 = sponsorL1.referredBy.trim();
                    const sponsorL2 = await User.findOne({ referralId: cleanRefL2 });
                    if (sponsorL2) {
                        if (!sponsorL2.referrals.level2.includes(user._id)) {
                            sponsorL2.referrals.level2.push(user._id);
                            await sponsorL2.save();
                        }

                        // Sponsor level 3
                        if (sponsorL2.referredBy) {
                            const cleanRefL3 = sponsorL2.referredBy.trim();
                            const sponsorL3 = await User.findOne({ referralId: cleanRefL3 });
                            if (sponsorL3) {
                                if (!sponsorL3.referrals.level3.includes(user._id)) {
                                    sponsorL3.referrals.level3.push(user._id);
                                    await sponsorL3.save();
                                }
                            }
                        }
                    }
                }
            }
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                referralId: user.referralId,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
                message: 'Registration successful'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                referralId: user.referralId,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
