import { Router } from 'express';
import * as contactUsController from '../controllers/contactus.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Contact Us
 *   description: Contact form queries management
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit a new contact query
 *     tags: [Contact Us]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - queryType
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               queryType:
 *                 $ref: '#/components/schemas/ContactQueryType'
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Query submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     queryType:
 *                       $ref: '#/components/schemas/ContactQueryType'
 *                     status:
 *                       $ref: '#/components/schemas/ContactQueryStatus'
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/', contactUsController.createContactQuery);

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: Get all contact queries (Admin only)
 *     tags: [Contact Us]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/ContactQueryStatus'
 *         description: Filter by status
 *       - in: query
 *         name: queryType
 *         schema:
 *           $ref: '#/components/schemas/ContactQueryType'
 *         description: Filter by query type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of contact queries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContactUsQuery'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalQueries:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       500:
 *         description: Internal server error
 */
router.get('/', contactUsController.getAllContactQueries);

// ... continue with similar annotations for other routes ...

export default router;