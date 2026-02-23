const Transaction = require('../models/Transaction');

// @desc    Submit support ticket/message
// @route   POST /api/support/contact
const contactSupport = async (req, res) => {
    const { subject, message } = req.body;

    try {
        // In a real app, this would save to a SupportTicket model or send an email
        console.log(`Support Message from ${req.user.email}:`, { subject, message });

        res.status(201).json({
            message: 'Your message has been received. Our team will contact you soon.',
            ticketId: 'TKT-' + Math.floor(100000 + Math.random() * 900000)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system FAQs
// @route   GET /api/support/faqs
const getFaqs = async (req, res) => {
    const faqs = [
        { q: "How do I purchase Dhanki tokens?", a: "Go to the 'Buy Token' section, select your payment method (INR or USDT), enter the amount, and follow the payment instructions." },
        { q: "What is the referral commission structure?", a: "We offer a 3-level commission structure: Level 1 (5%), Level 2 (2%), and Level 3 (1%)." },
        { q: "How long does it take to credit tokens?", a: "Tokens are usually credited instantly after the transaction is verified by our team, typically within 15-30 minutes." },
        { q: "Can I withdraw my referral earnings?", a: "Yes, referral earnings are credited to your main wallet and can be withdrawn according to our withdrawal policy." }
    ];
    res.json(faqs);
};

module.exports = { contactSupport, getFaqs };
