"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import your route files
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const assessmentRoutes_1 = __importDefault(require("./routes/assessmentRoutes"));
const adminQuestionRoutes_1 = __importDefault(require("./routes/adminQuestionRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS setup
app.use((0, cors_1.default)({
    origin: 'https://test-exam-client.onrender.com',
    credentials: true
}));
// Parse JSON
app.use(express_1.default.json());
// ✅ Root route for testing
app.get('/', (req, res) => {
    res.send('✅ School assessment server running');
});
// API routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/assessment', assessmentRoutes_1.default);
app.use('/api/admin', adminQuestionRoutes_1.default);
// MongoDB connection + server start
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
    .catch(err => {
    console.error('MongoDB connection error:', err);
    // Still start server so root route works even if DB fails
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB not connected)`));
});
