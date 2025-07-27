const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = 'https://hallo-4na8.vercel.app/';

// Middleware
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials:true
}));
app.use(express.json());

// MongoDB Connection (placeholder - will be configured with real credentials)
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Patient Profile Schema
const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: Number,
  familyMembers: [{
    name: String,
    relationship: String,
    photo: String
  }],
  personalMemories: [String],
  importantDates: [{
    date: String,
    description: String,
    type: { type: String, enum: ['birthday', 'anniversary', 'other'] }
  }],
  preferences: {
    favoriteColor: String,
    favoriteFood: String,
    hobbies: [String]
  },
  updatedAt: { type: Date, default: Date.now }
});

// Medication Schema
const medicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  time: { type: String, required: true }, // HH:MM format
  dosage: String,
  notes: String,
  lastRemindedAt: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Memory Prompt Schema
const memoryPromptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['identity', 'family', 'memory', 'routine'], required: true },
  content: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'occasional'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Conversation Log Schema (for AI interactions)
const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientInput: String,
  aiResponse: String,
  timestamp: { type: Date, default: Date.now },
  sentiment: String, // positive, neutral, negative
  context: String // medication, memory, general
});

// Models
const User = mongoose.model('User', userSchema);
const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);
const Medication = mongoose.model('Medication', medicationSchema);
const MemoryPrompt = mongoose.model('MemoryPrompt', memoryPromptSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Patient Profile Routes
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user.userId });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profileData = { ...req.body, userId: req.user.userId, updatedAt: new Date() };
    
    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user.userId },
      profileData,
      { upsert: true, new: true }
    );
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Error saving profile' });
  }
});

// Medication Routes
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medications = await Medication.find({ 
      userId: req.user.userId, 
      isActive: true 
    }).sort({ time: 1 });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching medications' });
  }
});

app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const medication = new Medication({
      ...req.body,
      userId: req.user.userId
    });
    await medication.save();
    res.status(201).json(medication);
  } catch (error) {
    res.status(500).json({ error: 'Error creating medication' });
  }
});

app.put('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json(medication);
  } catch (error) {
    res.status(500).json({ error: 'Error updating medication' });
  }
});

app.delete('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isActive: false },
      { new: true }
    );
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting medication' });
  }
});

// Memory Prompt Routes
app.get('/api/memory-prompts', authenticateToken, async (req, res) => {
  try {
    const prompts = await MemoryPrompt.find({ userId: req.user.userId });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching memory prompts' });
  }
});

app.post('/api/memory-prompts', authenticateToken, async (req, res) => {
  try {
    const prompt = new MemoryPrompt({
      ...req.body,
      userId: req.user.userId
    });
    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ error: 'Error creating memory prompt' });
  }
});

app.delete('/api/memory-prompts/:id', authenticateToken, async (req, res) => {
  try {
    const prompt = await MemoryPrompt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Memory prompt not found' });
    }
    
    res.json({ message: 'Memory prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting memory prompt' });
  }
});

// AI Conversation Route
app.post('/api/conversation', authenticateToken, async (req, res) => {
  try {
    const { message, context = 'general' } = req.body;
    
    // Get user's profile and medications for context
    const profile = await PatientProfile.findOne({ userId: req.user.userId });
    const medications = await Medication.find({ 
      userId: req.user.userId, 
      isActive: true 
    });
    
    // This will be replaced with actual Gemini AI call
    const aiResponse = `I understand you said: "${message}". As your AI companion, I'm here to help you with your daily needs and provide comfort.`;
    
    // Log the conversation
    const conversation = new Conversation({
      userId: req.user.userId,
      patientInput: message,
      aiResponse,
      context,
      sentiment: 'neutral' // This would be analyzed by AI
    });
    await conversation.save();
    
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: 'Error processing conversation' });
  }
});

// Analytics Route (for caregivers)
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    const medicationCount = await Medication.countDocuments({ 
      userId: req.user.userId, 
      isActive: true 
    });
    
    const memoryPromptCount = await MemoryPrompt.countDocuments({ 
      userId: req.user.userId 
    });
    
    res.json({
      recentConversations: conversations,
      medicationCount,
      memoryPromptCount,
      totalInteractions: conversations.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});