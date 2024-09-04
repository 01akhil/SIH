import mongoose from 'mongoose';
import 'dotenv/config'; 

const connectDB = async () => {
    try {
        const uri = 'mongodb+srv://mentor-connect:RE5n3Kc1gD3VbDtb@mentor-connect.m2ci9ll.mongodb.net/?retryWrites=true&w=majority';
        if (!uri) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); 
    }
};

export default connectDB;
