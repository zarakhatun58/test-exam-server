// src/routes/assessmentRoutes.ts
import express from 'express';
import {
  getQuestionsForStep,
  startAssessment,
  getCurrentSession,
  submitAnswer,
  submitAssessment,
  canTakeAssessment,
  getAllAssessmentResults,
  getMyAssessmentResults,
} from '../controllers/assessmentController';
import { verifyAdmin, verifyToken } from '../middlewares/authMiddleware'; // your JWT middleware

const router = express.Router();

// public: questions for step (may be protected if you want)
// router.get('/questions/:step', verifyToken, getQuestionsForStep);
router.get('/questions/:step', getQuestionsForStep);

router.get('/current', verifyToken, getCurrentSession);
router.post('/start', verifyToken, startAssessment);
router.post('/answer', verifyToken, submitAnswer);
router.post('/submit', verifyToken, submitAssessment);
router.get('/can-take', verifyToken, canTakeAssessment);
// Admin dashboard – all assessments
router.get('/all', verifyToken, verifyAdmin, getAllAssessmentResults);

// User dashboard – their own history
router.get('/my', verifyToken, getMyAssessmentResults);

export default router;
