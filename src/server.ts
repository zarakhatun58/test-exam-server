import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import your route files
import authRoutes from './routes/authRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import adminQuestionRoutes from './routes/adminQuestionRoutes';
import adminAssessmentRoutes from './routes/adminAssessmentRoutes';

dotenv.config();

const app = express();

// CORS setup
app.use(cors({
  origin: 'https://test-exam-client.onrender.com',
  credentials: true
}));

// Parse JSON
app.use(express.json());

// ✅ Root route for testing
app.get('/', (req, res) => {
  res.send('✅ School assessment server running');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/admin', adminQuestionRoutes);
app.use('/api/admin/all', adminAssessmentRoutes);
// MongoDB connection + server start
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Still start server so root route works even if DB fails
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB not connected)`));
  });
