// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt'); // Make sure bcrypt is imported

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentee' },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' } // Ensure this line exists
});

userSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, '1879e72616538a65f9ab8c688f50716ae60e729f81d547e68898a7e2363a70468e8be411b2b63e659d0ab13d54b1be925073be02954382fdf1dd1fa919fa406e', { expiresIn: '1h' });
};

userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
