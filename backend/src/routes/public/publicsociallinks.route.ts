
import express from 'express';
import { getPublicSocialLinks, getPublicSocialLinkById } from '../../controllers/public/publicsociallink.controller';

const router = express.Router();

router.get('/', getPublicSocialLinks);
router.get('/:id', getPublicSocialLinkById);

export default router;
