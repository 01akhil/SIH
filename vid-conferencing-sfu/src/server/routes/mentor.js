
import express from 'express';
import Mentor from '../models/Mentor.js';  
import Mentee from '../models/Mentee.js';  
import Blog from '../models/Blog.js';
import Course from "../models/Course.js";

import path from 'path';
import authenticateToken from '../middleware/authMiddleware.js';  
import { body, validationResult } from 'express-validator';

const router = express.Router();

//<--------------------------------------------post request for profile--------------------------------------------->
router.post('/profile', authenticateToken, [
    body('name').notEmpty().withMessage('Name is required'),
    body('currentJob').notEmpty().withMessage('Current job title is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('yearsOfExperience').isNumeric().withMessage('Years of experience must be a number'),
    body('industry').notEmpty().withMessage('Industry is required'),
    body('expertise').notEmpty().withMessage('Expertise is required'),
    body('previousExperience').notEmpty().withMessage('Previous experience is required'),
    body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
    body('certifications').optional(),
    body('skillDetails').optional(),
    body('otherDetails').optional()
], async (req, res) => {
    const {
        name,
        currentJob,
        company,
        yearsOfExperience,
        industry,
        expertise,
        previousExperience,
        certifications,
        skills,
        skillDetails,
        otherDetails
    } = req.body;

    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        
        const mentor = await Mentor.findById(req.user.mentor);
        const mentorId = req.query.mentorId || req.user.mentor;

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }


        mentor.name = name || mentor.name;
        mentor.currentJob = currentJob || mentor.currentJob;
        mentor.company = company || mentor.company;
        mentor.yearsOfExperience = yearsOfExperience || mentor.yearsOfExperience;
        mentor.industry = industry || mentor.industry;
        mentor.expertise = expertise || mentor.expertise;
        mentor.previousExperience = previousExperience || mentor.previousExperience;
        mentor.certifications = certifications || mentor.certifications;
        mentor.skills = skills || mentor.skills;
        mentor.skillDetails = skillDetails || mentor.skillDetails;
        mentor.otherDetails = otherDetails || mentor.otherDetails;

        await mentor.save();
        console.log("Mentor profile updated");

      
        res.redirect(`/mentor/dashboard?mentorId=${mentorId}`);
    } catch (error) {
        console.error('Error in /mentor/profile:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

//<--------------------------------------------get request for search--------------------------------------------->
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        const mentors = await Mentor.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { expertise: new RegExp(query, 'i') },
                { location: new RegExp(query, 'i') }
            ]
        });
        res.json(mentors);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

//<----------------------------------CONNECT MENTEE WITH MENTOR-------------------------------------------->
router.post('/make-mentor', authenticateToken, async (req, res) => {
    const { menteeId, mentorId } = req.body;
    try {
        const mentee = await Mentee.findById(menteeId);
        const mentor = await Mentor.findById(mentorId);

        if (!mentee || !mentor) {
            return res.status(404).json({ message: 'Mentee or Mentor not found' });
        }

        mentee.mentors = mentorId;
        await mentee.save();

        mentor.mentees.push(menteeId);
        await mentor.save();

        res.status(200).json({ success: true, message: 'Mentor assigned successfully' });

    } catch (error) {
        console.error('Error assigning mentor:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//<-----------------------------------------GENEREATE LINK FOR NORMAL MENTORSHIP SESSION------------------------------------>

router.post('/generate-link', authenticateToken, async (req, res) => {
    const { date, time, mentorId } = req.body;
    
    if (!date || !time || !mentorId) {
        return res.status(400).json({ message: 'Date, time, and mentorId are required' });
    }

    try {
        // Find the mentor by ID
        const mentor = await Mentor.findById(mentorId).populate('mentees'); // Populate mentees to get full objects
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Generate the meeting link
        const link = `${req.headers.origin}/mentor/room/${mentorId}/${date}/${time}`;
        const meetingDate = new Date(`${date}T${time}`);

        // Add the link to the mentor's meetingLinks array
        mentor.meetingLinks.push({ link, date: meetingDate });
        await mentor.save();

        // Add the link to each mentee's meetingLinks array with the mentorId, ensuring no duplicates
        const mentees = mentor.mentees;
        for (const mentee of mentees) {
            const existingLink = mentee.meetingLinks.find(
                (mLink) => mLink.link === link && mLink.date.getTime() === meetingDate.getTime()
            );
            
            if (!existingLink) {
                mentee.meetingLinks.push({ link, date: meetingDate, mentorId: mentorId });
                await mentee.save();
            }
        }

        res.status(200).json({ message: 'Meeting link saved successfully for mentor and mentees', link });
    } catch (error) {
        console.error('Error generating link:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//<-------------------------------------------------------------------------------------------------------

router.post('/submit-blog/:mentorId', authenticateToken, async (req, res) => {
    const { title, content, author,category } = req.body;
    const { mentorId } = req.params;
    
    try {
        // Find the mentor by ID
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }
        
        // Create a new blog entry
        const blog = new Blog({
            title,
            content,
            author,
            mentorId,
            category,
        });
        
        // Save the blog first
        await blog.save();
        
        // Add the blog ID to the mentor's list of blogs
        mentor.blogs.push(blog._id); // Use blog._id here
        await mentor.save();
        
        res.status(200).json({ message: 'Blog submitted successfully' });
    } catch (error) {
        console.error('Error submitting blog:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/availability', authenticateToken, async (req, res) => {
    const { date, slots, mentorId } = req.body;

    if (!date || !slots || !mentorId) {
        return res.status(400).json({ message: 'Date, slots, and mentorId are required' });
    }

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Normalize the date to avoid time zone issues
        const normalizedDate = new Date(date).toDateString();

        // Find or create availability entry for the given date
        let availability = mentor.availability.find(a => new Date(a.slots[0]?.date).toDateString() === normalizedDate);

        if (availability) {
            // Update existing slots or add new ones
            slots.forEach(newSlot => {
                const existingSlotIndex = availability.slots.findIndex(slot =>
                    slot.startTime === newSlot.startTime && slot.endTime === newSlot.endTime
                );

                if (existingSlotIndex > -1) {
                    // Update the existing slot
                    availability.slots[existingSlotIndex] = { ...availability.slots[existingSlotIndex], ...newSlot };
                } else {
                    // Add new slot if it doesn't exist
                    availability.slots.push(newSlot);
                }
            });
        } else {
            // Add new availability entry for the date
            mentor.availability.push({ slots: slots.map(slot => ({ ...slot, date: new Date(date) })) });
        }

        await mentor.save();
        res.status(200).json({ message: 'Availability saved successfully' });
    } catch (error) {
        console.error('Error saving availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



router.get('/availability/:mentorId', authenticateToken, async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Return the meeting links
        res.status(200).json({ meetingLinks: mentor.meetingLinks || [] });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//<-----------------------------------------------------------mentordetails----------------------------------------------->

router.get('/detail/:mentorId', async (req, res) => {
    const { mentorId } = req.params;

    console.log('Fetching details for mentorId:', mentorId);

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            console.log('Mentor not found:', mentorId);
            return res.status(404).json({ message: 'Mentor not found' });
        }

        console.log('Mentor details:', mentor);
        res.json(mentor); 
    } catch (error) {
        console.error('Error fetching mentor details:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/paidMentorships/:mentorId/:menteeId', async (req, res) => {
    const { mentorId, menteeId } = req.params;

    console.log("Received request for paid mentorships for mentorId:", mentorId, "and menteeId:", menteeId);

    try {
        const mentor = await Mentor.findById(mentorId);

        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        const filteredPaidMentorships = mentor.paidMentorships.filter(pm => pm.menteeId.toString() === menteeId);

        if (filteredPaidMentorships.length === 0) {
            return res.status(404).json({ message: "No paid mentorships found for this mentor and mentee" });
        }

        res.json({
            paidMentorships: filteredPaidMentorships
        });
    } catch (error) {
        console.error('Error fetching paid mentorships:', error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.get('/paid-mentorship-sessions/:mentorId', async (req, res) => {
    try {
        const mentorId = req.params.mentorId;

        // Fetch mentor details including paid mentorship sessions
        const mentor = await Mentor.findById(mentorId).populate('paidMentorships.menteeId', 'name');

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        res.status(200).json({ sessions: mentor.paidMentorships });
    } catch (error) {
        console.error('Error fetching paid mentorship sessions:', error);
        res.status(500).json({ message: 'Error fetching paid mentorship sessions' });
    }
});


router.post('/submit-course-form/:mentorId', authenticateToken, async (req, res) => {
    const { title, amount } = req.body;
    const { mentorId } = req.params;
    
    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }
        
        const course = new Course({ // Ensure correct model name
            title,
            amount,
            mentorId
        });
        
        await course.save();
        
        mentor.courses.push(course._id); 
        await mentor.save();
        
        res.status(200).json({ message: 'Course submitted successfully' }); // Updated message
    } catch (error) {
        console.error('Error submitting course:', error); // Updated error log
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;


