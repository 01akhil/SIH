

import express from 'express';
import path from 'path';
import User from '../models/User.js';
import Mentee from '../models/Mentee.js';
import Mentor from '../models/Mentor.js';
import authenticateToken from '../middleware/authMiddleware.js';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = path.resolve() 

// Mentee Signup
router.post('/mentee/signup', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req, res) => {
    const { username, email, password, education, goals, interests, expertiseStatus, experienceLevel, skills, skillDetails, currentJob, industry, otherDetails } = req.body;

    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create a new Mentee
        const mentee = new Mentee({ education, goals, interests, expertiseStatus, experienceLevel, skills, skillDetails, currentJob, industry, otherDetails });
        console.log("saving at mongo")
        await mentee.save();

        // Create a new User
        const user = new User({
            username,
            email,
            password,
            role: 'mentee',
            mentee: mentee._id
        });

        // Hash the password
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();

        // Generate token
        const token = user.generateToken();
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/mentee/profile?menteeId=${user.mentee}');
    } catch (error) {
        console.error('Error in /mentee/signup:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Mentee Login
router.post('/mentee/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const { email, password } = req.body;

    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email, role: 'mentee' }).populate('mentee');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = user.generateToken();
        res.cookie('token', token, { httpOnly: true });
        // res.redirect('/mentee/dashboard');
        res.redirect(`/mentee/dashboard?menteeId=${user.mentee._id}`);
    } catch (error) {
        console.error('Error in /mentee/login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


//<--------------------------------------------------------- Mentor Signup---------------------------------------------->
router.post('/mentor/signup', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req, res) => {
    const { username, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const mentor = new Mentor({});
        await mentor.save();

        const user = new User({
            username,
            email,
            password,
            role: 'mentor',
            mentor: mentor._id
        });

        user.password = await bcrypt.hash(user.password, 10);
        await user.save();

        const token = user.generateToken();
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/mentor/profile');
    } catch (error) {
        console.error('Error in /mentor/signup:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

//<------------------------------------------------------- Mentor Login---------------------------------------------------->
router.post('/mentor/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email, role: 'mentor' }).populate('mentor');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = user.generateToken();
        res.cookie('token', token, { httpOnly: true });

        res.redirect(`/mentor/dashboard?mentorId=${user.mentor._id}`);
    } catch (error) {
        console.error('Error in /mentor/login:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

//<----------------------------------------------------------------------------------------------------------->

export default router;