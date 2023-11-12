const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log(token);
    jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).json({ error: 'Please authenticate' });
      }
      console.log(decoded);
      const user = await User.findOne({ username: decoded.id });
      if (!user) {
        return res.status(401).json({ error: 'Please authenticate' });
      }

      req.user = user;

      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authMiddleware;