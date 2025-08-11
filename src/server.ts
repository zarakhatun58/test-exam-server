import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    // ✅ Base test route
  
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
