require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (only once to avoid multiple connections)
if (!global.mongooseConnection) {
    global.mongooseConnection = mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((error) => console.error('Failed to connect to MongoDB:', error.message));
}

// Define a User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Register Route (POST)
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { username, email, password } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            // Create new user
            const newUser = new User({ username, email, password });
            await newUser.save();

            return res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Server error' });
        }
    } 
    // ✅ Now supporting GET requests
    else if (req.method === 'GET') {
        return res.status(200).json({ message: 'GET request received. Use POST to register a user.' });
    } 
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
};


