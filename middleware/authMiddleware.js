import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Not authorized' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const requireVerified = (req, res, next) => {
    if (!req.user?.isVerified)
        return res.status(403).json({ message: 'Verify email first' });
    next();
};

export const requireRole = (role) => (req, res, next) => {
    if (req.user?.role !== role)
        return res.status(403).json({ message: 'Forbidden' });
    next();
};
