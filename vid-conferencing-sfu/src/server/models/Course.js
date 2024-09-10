import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: false},
    description: { type: String, required: false},
    amount: { type: Number, required: false }, 
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },

    avatar: {
        url: { type: String, required: false },   
        public_id: { type: String, required: false } 
    },

    lectures:[{
        thumbnail: {
            url: { type: String, required: false },
            public_id: { type: String, required: false }
        },
        
        video:{
            title: { type: String, required: false },
             description: { type: String, required: false },
             url: { type: String, required: false },
             public_id:{
                type:String,
                required:false,
             }
        }
    }],

    category: { type: String, required: false},

    createdAt: { type: Date, default: Date.now },
   
});

export default mongoose.model('Course', CourseSchema);
