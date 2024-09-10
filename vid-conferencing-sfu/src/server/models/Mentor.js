import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const mentorSchema = new mongoose.Schema({
    name: { type: String, required: false },
    currentJob: { type: String, required: false },
    company: { type: String, required: false },
    yearsOfExperience: { type: Number, required: false },
    industry: { type: String, required: false },
    expertise: { type: String, required: false },
    previousExperience: { type: String, required: false },
    certifications: { type: String, required: false },
    skills: { type: [String], required: false },
    skillDetails: { type: String, required: false },
    otherDetails: { type: String, required: false },

    education: { type: String, required: false },
    goals: { type: String, required: false },
    interests: { type: String, required: false },
    expertiseStatus: { type: String, required: false },
    experienceLevel: { type: String, required: false },
    bio: { type: String, required: false },

    profileImage: { type: String,required:false } ,

    mentees: [{ type: Schema.Types.ObjectId, ref: 'Mentee' }],
    meetingLinks: [
        {
            link: { type: String, required: true },
            date: { type: Date, required: true }
        }
    ],

    availability: [
        {
            slots: [
                {
                    date: { type: Date, required: false },
                    startTime: { type: String, required: false },
                    endTime: { type: String, required: false },
                    booked: { type: Boolean, required: false, default: false },
                    bookedBy: { type: Schema.Types.ObjectId, ref: 'Mentee', required: false },
                    meetingLink: { type: String, required: false }
                }
            ]
        }
    ],

  
    paidMentorships: [
        {
            menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentee' },
            date: { type: Date, required: false },
            time: String,
            link: String,
        }
    ],

    blogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],

    courses:[{type:Schema.Types.ObjectId, ref: 'Course'}]

});

export default mongoose.model('Mentor', mentorSchema);


