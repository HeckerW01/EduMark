/**
 * Academic Work Routes
 * Handles document submission with annotations
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const AcademicWork = require('../models/AcademicWork');
const LearningTask = require('../models/LearningTask');
const UserProfile = require('../models/UserProfile');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(process.env.UPLOAD_DIR || 'uploads', 'academic-work');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF documents are allowed'));
        }
    }
});

/**
 * Submit academic work
 * POST /api/academic-work
 */
router.post('/', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        const { learningTaskId, annotations } = req.body;
        
        if (!learningTaskId || !annotations) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if learning task exists and is active
        const learningTask = await LearningTask.findByPk(learningTaskId);
        if (!learningTask) {
            return res.status(404).json({ error: 'Learning task not found' });
        }
        
        if (learningTask.status !== 'active') {
            return res.status(400).json({ error: 'Learning task is not active' });
        }
        
        // Check if submission deadline has passed
        if (learningTask.dueDate && new Date() > new Date(learningTask.dueDate)) {
            return res.status(400).json({ error: 'Submission deadline has passed' });
        }
        
        // Check if learner has already submitted
        const existingWork = await AcademicWork.findOne({
            where: {
                learningTaskId,
                learnerId: req.user.id
            }
        });
        
        if (existingWork && existingWork.status === 'completed') {
            return res.status(400).json({ error: 'You have already submitted this work' });
        }
        
        // Create or update academic work
        const workData = {
            learningTaskId,
            learnerId: req.user.id,
            status: 'completed',
            submittedAt: new Date(),
            annotations: JSON.parse(annotations),
            originalDocumentUrl: req.file.path,
            metadata: {
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            }
        };
        
        let academicWork;
        if (existingWork) {
            academicWork = await existingWork.update(workData);
        } else {
            academicWork = await AcademicWork.create(workData);
        }
        
        logger.info(`Academic work submitted: ${academicWork.id}`);
        
        res.status(201).json({
            message: 'Work submitted successfully',
            work: {
                id: academicWork.id,
                status: academicWork.status,
                submittedAt: academicWork.submittedAt
            }
        });
        
    } catch (error) {
        logger.error('Submission error:', error);
        res.status(500).json({ error: 'Failed to submit work' });
    }
});

/**
 * Get academic work details
 * GET /api/academic-work/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const academicWork = await AcademicWork.findByPk(req.params.id, {
            include: [
                {
                    model: LearningTask,
                    as: 'learningTask',
                    include: [
                        {
                            model: UserProfile,
                            as: 'facilitator',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                },
                {
                    model: UserProfile,
                    as: 'learner',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        
        if (!academicWork) {
            return res.status(404).json({ error: 'Academic work not found' });
        }
        
        // Check if user has permission to view
        if (req.user.role !== 'admin' && 
            req.user.id !== academicWork.learnerId && 
            req.user.id !== academicWork.learningTask.facilitatorId) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        res.json(academicWork);
        
    } catch (error) {
        logger.error('Error fetching academic work:', error);
        res.status(500).json({ error: 'Failed to fetch academic work' });
    }
});

/**
 * Review academic work
 * PUT /api/academic-work/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const academicWork = await AcademicWork.findByPk(req.params.id, {
            include: [
                {
                    model: LearningTask,
                    as: 'learningTask'
                }
            ]
        });
        
        if (!academicWork) {
            return res.status(404).json({ error: 'Academic work not found' });
        }
        
        // Check if user is the facilitator who created the learning task
        if (req.user.id !== academicWork.learningTask.facilitatorId) {
            return res.status(403).json({ error: 'Only the learning task facilitator can review submissions' });
        }
        
        const { grade, feedback } = req.body;
        
        if (grade !== undefined && (grade < 0 || grade > 100)) {
            return res.status(400).json({ error: 'Grade must be between 0 and 100' });
        }
        
        await academicWork.update({
            grade,
            feedback,
            status: 'reviewed',
            reviewedAt: new Date()
        });
        
        logger.info(`Academic work reviewed: ${academicWork.id}`);
        
        res.json({
            message: 'Work reviewed successfully',
            work: {
                id: academicWork.id,
                status: academicWork.status,
                grade: academicWork.grade,
                reviewedAt: academicWork.reviewedAt
            }
        });
        
    } catch (error) {
        logger.error('Error reviewing academic work:', error);
        res.status(500).json({ error: 'Failed to review work' });
    }
});

/**
 * Get all submissions for a learning task
 * GET /api/academic-work/task/:learningTaskId
 */
router.get('/task/:learningTaskId', authenticateToken, async (req, res) => {
    try {
        const submissions = await AcademicWork.findAll({
            where: {
                learningTaskId: req.params.learningTaskId
            },
            include: [
                {
                    model: UserProfile,
                    as: 'learner',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['submittedAt', 'DESC']]
        });
        
        res.json(submissions);
        
    } catch (error) {
        logger.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

module.exports = router; 