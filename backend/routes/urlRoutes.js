import express from 'express';
import { createShortUrl, redirectToOriginalUrl, getUrlStats } from '../controllers/urlController.js';

const urlRouter = express.Router();

urlRouter.post('/shorturls', createShortUrl);

urlRouter.get('/:shortcode', redirectToOriginalUrl);

urlRouter.get('/shorturls/:shortcode', getUrlStats);

export default urlRouter;
