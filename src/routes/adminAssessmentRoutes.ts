import express from 'express';
import { generateCertificate, getAssessmentHistory } from '../controllers/adminAssessmentController';
import { verifyAdmin, verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/assessments/history', getAssessmentHistory);
router.get('/assessments/:id/certificate', generateCertificate);

export default router;
