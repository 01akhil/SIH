import mongoose from 'mongoose';

const courseAccessSchema = new mongoose.Schema({
    menteeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentee',
        required: false
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: false
    },
    dateOfAccess: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('CourseAccess', courseAccessSchema);
