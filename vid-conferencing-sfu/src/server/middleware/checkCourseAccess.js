import Mentee from '../models/Mentee.js';
import CourseAccess from '../models/Access.js';

const checkCourseAccess = async (req, res, next) => {
    const { courseId, menteeId } = req.params; 
    
    if (!courseId || !menteeId) {
        return res.status(400).json({ message: 'Course ID and Mentee ID are required' });
    }

    try {
        const access = await CourseAccess.findOne({ menteeId, courseId });
     
        if (access) {
            req.hasAccess = true;
        } else {
            req.hasAccess = false;
        }

        next();
    } catch (error) {
        console.error('Error checking course access:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default checkCourseAccess;
