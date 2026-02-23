const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    dhankiPrice: { type: Number, default: 0.015 },
    networkFee: { type: Number, default: 2.00 },
    minWithdrawal: { type: Number, default: 10 },
    maintenanceMode: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
