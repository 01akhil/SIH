import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    console.log('Token:', token);

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401); 
    }

    try {
        console.log('Verifying token...');
        console.log('JWT_SECRET:', '1879e72616538a65f9ab8c688f50716ae60e729f81d547e68898a7e2363a70468e8be411b2b63e659d0ab13d54b1be925073be02954382fdf1dd1fa919fa406e');

        const decoded = jwt.verify(token, '1879e72616538a65f9ab8c688f50716ae60e729f81d547e68898a7e2363a70468e8be411b2b63e659d0ab13d54b1be925073be02954382fdf1dd1fa919fa406e');
        console.log('Decoded token:', decoded);

        req.user = await User.findById(decoded.id).populate('mentor').populate('mentee');
        if (!req.user) {
            console.log('User not found for ID:', decoded.id);
            return res.sendStatus(403); 
        }

        console.log('User authenticated:', req.user);
        next(); 
    } catch (err) {
        console.error('Token verification error:', err);
        res.sendStatus(403); 
    }
};

export default authenticateToken;
