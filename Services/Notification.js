const User = require('../Models/User');

const setNotification = async (userId, type, message) => {
    try {
        const user = await User.findById(userId);
        user.notifications.push({ type, message });
        await user.save();
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = setNotification;