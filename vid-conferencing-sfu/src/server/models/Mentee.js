import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const menteeSchema = new mongoose.Schema({
    education: { type: String, required: false },
    goals: { type: String, required: false },
    interests: { type: [String], required: false },
    expertiseStatus: { type: String, required: false },
    experienceLevel: { type: String, required: false },
    skills: { type: [String], required: false },
    skillDetails: { type: String, required: false },
    currentJob: { type: String, required: false },
    industry: { type: String, required: false },
    otherDetails: { type: String, required: false },

    mentors: [{ type: Schema.Types.ObjectId, ref: 'Mentor' }],

    meetingLinks: [
        {
            link: { type: String, required: true },
            date: { type: Date, required: true },
            mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true } 
        }
    ],

    paidMentorships: [
        {
            mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
            date: { type: Date, required: false },
            time: String,
            link: String,
        }
    ],

});

export default mongoose.model('Mentee', menteeSchema);
