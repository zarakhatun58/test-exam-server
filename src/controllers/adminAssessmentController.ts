import { Request, Response } from 'express';
import AssessmentSession from '../models/AssessmentSession';
import AssessmentResult from '../models/AssessmentResult';
import SchoolUser from '../models/SchoolUser';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';


// GET /api/admin/assessments?userId=...&step=1&page=1&limit=20
export const getAssessmentHistory = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId, search } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Match filter
    const match: any = {};
    if (userId) {
      match.userId = new mongoose.Types.ObjectId(userId as string);
    }
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate as string);
      if (endDate) match.createdAt.$lte = new Date(endDate as string);
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'assessmentsessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'session'
        }
      },
      { $unwind: '$session' },
      {
        $lookup: {
          from: 'schoolusers',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
    ];

    // Search by name/email
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search as string, $options: 'i' } },
            { 'user.email': { $regex: search as string, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $project: {
          _id: 1,
          userId: 1,
          'user.name': 1,
          'user.email': 1,
          step: 1,
          score: 1,
          percentage: 1,
          levelAchieved: 1,
          certification: 1,
          canProceed: 1,
          timeSpent: 1,
          createdAt: 1,
          'session.questions': 1,
          'session.answers': 1,
          'session.startTime': 1,
          'session.status': 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const results = await AssessmentResult.aggregate(pipeline);

    // Total count for pagination
    const totalPipeline = pipeline.filter(
      (stage) => !('$skip' in stage) && !('$limit' in stage) && !('$sort' in stage)
    );
    totalPipeline.push({ $count: 'total' });
    const totalCountAgg = await AssessmentResult.aggregate(totalPipeline);
    const totalCount = totalCountAgg.length > 0 ? totalCountAgg[0].total : 0;

    res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAssessmentHistory:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * Generate a simple PDF certificate for an assessment
 * GET /api/admin/assessments/:id/certificate
 */
export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await AssessmentResult.findById(id).populate('userId');
    if (!result) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const user = result.userId as any;

    const fileName = `certificate-${id}.pdf`;
    const filePath = path.join(__dirname, `../../tmp/${fileName}`);
    fs.mkdirSync(path.join(__dirname, '../../tmp'), { recursive: true });

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Winner badge image from assets
    const badgePath = path.join(__dirname, '../../assets/bfb3e535-623d-4c03-b890-a39e89b78ce2.jpg');
    if (fs.existsSync(badgePath)) {
      doc.image(badgePath, doc.page.width / 2 - 50, 30, { width: 100 }).moveDown(4);
    }

    // Title
    doc
      .fontSize(30)
      .fillColor('#0d6efd')
      .text('Certificate of Achievement', { align: 'center' })
      .moveDown(2);

    // Subtitle
    doc
      .fontSize(16)
      .fillColor('#000')
      .text('This certifies that', { align: 'center' })
      .moveDown();

    // Name
    doc
      .fontSize(24)
      .fillColor('#333')
      .text(user.name, { align: 'center', underline: true })
      .moveDown();

    // Details
    doc
      .fontSize(14)
      .text(`Has successfully completed the assessment`, { align: 'center' })
      .text(`Level Achieved: ${result.levelAchieved}`, { align: 'center' })
      .text(`Score: ${result.score} / 100`, { align: 'center' })
      .text(`Date: ${result.createdAt.toDateString()}`, { align: 'center' })
      .moveDown(4);

    // Border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(5)
      .strokeColor('#FFD700')
      .stroke();

    // Signature line
    doc
      .moveTo(100, doc.y)
      .lineTo(250, doc.y)
      .stroke()
      .text('Authorized Signature', 100, doc.y + 5);

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) console.error(err);
        fs.unlinkSync(filePath); // cleanup
      });
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
