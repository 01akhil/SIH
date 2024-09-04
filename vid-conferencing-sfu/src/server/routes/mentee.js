import express from 'express';
import { body, validationResult } from 'express-validator';
import Mentee from '../models/Mentee.js';
import User from '../models/User.js';
import authenticateToken from '../middleware/authMiddleware.js';
import path from 'path';

const router = express.Router();

router.post('/profile', authenticateToken, [
    body('education').optional().isString(),
    body('goals').optional().isString(),
    body('interests').optional().custom(value => {
        if (typeof value === 'string') {
            return value.split(',').length > 0;
        } else if (Array.isArray(value)) {
            return value.length > 0;
        }
        throw new Error('Interests must be a comma-separated list or an array with at least one item.');
    }),
    body('expertiseStatus').optional().isString(),
    body('experienceLevel').optional().isString(),
    body('skills').optional().custom(value => {
        if (typeof value === 'string') {
            return value.split(',').length > 0;
        } else if (Array.isArray(value)) {
            return value.length > 0;
        }
        throw new Error('Skills must be a comma-separated list or an array with at least one item.');
    }),
    body('skillDetails').optional().isString(),
    body('currentJob').optional().isString(),
    body('industry').optional().isString(),
    body('otherDetails').optional().isString()
], async (req, res) => {
    const {
        education,
        goals,
        interests,
        expertiseStatus,
        experienceLevel,
        skills,
        skillDetails,
        currentJob,
        industry,
        otherDetails
    } = req.body;

    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Find the mentee using the mentee ID stored in the user's mentee field
        const menteeId = req.query.menteeId || req.user.mentee;
        const mentee = await Mentee.findById(req.user.mentee);

        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }

        // Update mentee's profile with the new data
        mentee.education = education || mentee.education;
        mentee.goals = goals || mentee.goals;
        mentee.interests = typeof interests === 'string' ? interests.split(',') : interests || mentee.interests;
        mentee.expertiseStatus = expertiseStatus || mentee.expertiseStatus;
        mentee.experienceLevel = experienceLevel || mentee.experienceLevel;
        mentee.skills = typeof skills === 'string' ? skills.split(',') : skills || mentee.skills;
        mentee.skillDetails = skillDetails || mentee.skillDetails;
        mentee.currentJob = currentJob || mentee.currentJob;
        mentee.industry = industry || mentee.industry;
        mentee.otherDetails = otherDetails || mentee.otherDetails;

        // Save the updated mentee profile
        await mentee.save();
        console.log("Mentee profile updated");

        // Redirect to the mentee dashboard or profile page
        res.redirect(`/mentee/dashboard?menteeId=${menteeId}`);
    } catch (error) {
        console.error('Error in /mentee/profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/meeting-links/:menteeId', async (req, res) => {
    const { menteeId } = req.params;

    try {
        const mentee = await Mentee.findById(menteeId);
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }

        res.json({ meetingLinks: mentee.meetingLinks });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


export default router;
