import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    author:{type:String,required:true},

    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },

});

export default mongoose.model('Blog', BlogSchema);
