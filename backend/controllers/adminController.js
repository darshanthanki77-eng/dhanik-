const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').lean();

        // Add counts for referrals to each user object
        const usersWithCounts = users.map(user => ({
            ...user,
            referrals: {
                ...user.referrals,
                l1Count: user.referrals?.level1?.length || 0,
                l2Count: user.referrals?.level2?.length || 0,
                l3Count: user.referrals?.level3?.length || 0,
                l1Income: user.income?.level1 || 0,
                l2Income: user.income?.level2 || 0,
                l3Income: user.income?.level3 || 0
            }
        }));

        res.json(usersWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user status (Enable/Disable/Ban)
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = req.body.status || user.status;
        await user.save();
        res.json({ message: 'User status updated', status: user.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all transactions (Admin)
// @route   GET /api/admin/transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({})
            .populate('user', 'name email referralId')
            .populate('fromUser', 'name email referralId')
            .sort({ createdAt: -1 })
            .lean();

        // Map txHash to transactionId for frontend compatibility
        const mapped = transactions.map(tx => ({
            ...tx,
            transactionId: tx.transactionId || tx.txHash
        }));

        console.log(`✅ Admin fetched ${mapped.length} transactions`);
        res.json(mapped);
    } catch (error) {
        console.error('getAllTransactions error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update transaction status (Approve/Reject)
// @route   PUT /api/admin/transactions/:id
const updateTransactionStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // If approving a token purchase that was pending
        if (status === 'completed' && transaction.status === 'pending') {
            if (transaction.type === 'purchase') {
                const user = await User.findById(transaction.user);
                if (user) {
                    // Credit the tokens to user
                    user.wallet.dhanki += (transaction.tokens || 0);
                    // Also update total investment
                    user.totalInvestment += (transaction.amount || 0);
                    await user.save();
                }
            }
        }

        transaction.status = status;
        await transaction.save();

        res.json({ success: true, message: `Transaction ${status}`, transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Platform Stats
// @route   GET /api/admin/stats
const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});

        // Sum of all completed purchases (Revenue)
        const totalRevenue = await Transaction.aggregate([
            { $match: { type: 'purchase', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Sum of all DHANKI tokens sold
        const totalTokens = await Transaction.aggregate([
            { $match: { type: 'purchase', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$tokens' } } }
        ]);

        res.json({
            totalUsers,
            revenue: totalRevenue[0]?.total || 0,
            tokenSold: totalTokens[0]?.total || 0,
            activeNodes: Math.floor(totalUsers * 0.8) // Simulated active proportion
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Admin Settings
// @route   GET /api/admin/settings
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({}); // Create default if doesn't exist
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Admin Settings
// @route   PUT /api/admin/settings
const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings(req.body);
        } else {
            settings.dhankiPrice = req.body.dhankiPrice ?? settings.dhankiPrice;
            settings.networkFee = req.body.networkFee ?? settings.networkFee;
            settings.minWithdrawal = req.body.minWithdrawal ?? settings.minWithdrawal;
            settings.maintenanceMode = req.body.maintenanceMode ?? settings.maintenanceMode;
            settings.updatedAt = Date.now();
        }
        await settings.save();
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user wallet balance (Admin manual adjustment)
// @route   PUT /api/admin/users/:id/wallet
const updateUserWallet = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { dhanki } = req.body;
        if (dhanki !== undefined) {
            user.wallet.dhanki = parseFloat(dhanki);
        }
        await user.save();
        res.json({ message: 'Wallet updated', wallet: user.wallet });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Full user data edit by Admin
// @route   PUT /api/admin/users/:id/edit
const updateUserData = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, phone, walletAddress, status, dhanki, balance, staked, totalInvestment } = req.body;

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (walletAddress !== undefined) user.walletAddress = walletAddress;
        if (status !== undefined) user.status = status;
        if (dhanki !== undefined) user.wallet.dhanki = parseFloat(dhanki);
        if (balance !== undefined) user.wallet.balance = parseFloat(balance);
        if (staked !== undefined) user.wallet.staked = parseFloat(staked);
        if (totalInvestment !== undefined) user.totalInvestment = parseFloat(totalInvestment);

        await user.save();
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    updateUserWallet,
    updateUserData,
    getAllTransactions,
    updateTransactionStatus,
    getPlatformStats,
    getSettings,
    updateSettings
};
