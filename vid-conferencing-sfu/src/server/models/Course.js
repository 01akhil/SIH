import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true }, // Changed to Number
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }
});

export default mongoose.model('Course', CourseSchema);
