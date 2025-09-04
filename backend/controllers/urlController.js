import createHttpError from 'http-errors';
import Url from '../models/Url.js';
import geoip from 'geoip-lite';
import Log from '../../logging-middleware/middleware.js';

const logMessage = (message) => {
  const msg = typeof message === 'string' ? message : JSON.stringify(message);
  return msg.length > 48 ? msg.substring(0, 48) : msg;
};

export const createShortUrl = async (req, res, next) => {
  try {
    const { url, validity, shortcode } = req.body;

    if (!url) {
      const error = new createHttpError(400, 'URL is required');
      await Log('backend', 'error', 'utils', logMessage('URL is required'));
      return next(error);
    }
    
    try {
      new URL(url);
    } catch (err) {
      const error = new createHttpError(400, 'Invalid URL format');
      await Log('backend', 'error', 'utils', logMessage(`Invalid URL: ${url}`));
      return next(error);
    }

    const expiryMinutes = validity || 30;
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

    if (shortcode) {
      if (!/^[a-zA-Z0-9_]+$/.test(shortcode)) {
        const error = new createHttpError(400, 'Shortcode can only contain alphanumeric characters and underscores');
        await Log('backend', 'error', 'utils', logMessage(`Invalid shortcode: ${shortcode}`));
        return next(error);
      }
      
      try {
        const existingUrl = await Url.findOne({ shortCode: shortcode });
        if (existingUrl) {
          const error = new createHttpError(409, 'Shortcode already in use');
          await Log('backend', 'warn', 'utils', logMessage(`Shortcode in use: ${shortcode}`));
          return next(error);
        }
      } catch (err) {
        await Log('backend', 'error', 'utils', logMessage(`DB error: ${err.message}`));
        return next(createHttpError(500, 'Internal server error'));
      }
    }

    const newUrl = new Url({
      originalUrl: url,
      shortCode: shortcode,
      expiry: expiryDate
    });

    try {
      await newUrl.save();
      await Log('backend', 'info', 'utils', 
        logMessage(`New URL: ${newUrl.shortCode}`)
      );

      res.status(201).json({
        shortLink: `${req.protocol}://${req.get('host')}/${newUrl.shortCode}`,
        expiry: newUrl.expiry.toISOString()
      });
    } catch (error) {
      if (error.code === 11000) {
        await Log('backend', 'error', 'utils', logMessage(`Dup shortcode: ${shortcode}`));
        return next(createHttpError(409, 'Shortcode already in use'));
      }
      await Log('backend', 'error', 'utils', logMessage(`Save error: ${error.message}`));
      next(error);
    }
  } catch (error) {
    await Log('backend', 'error', 'utils', logMessage(`Create URL error: ${error.message}`));
    next(error);
  }
};

export const redirectToOriginalUrl = async (req, res, next) => {
  const { shortcode } = req.params;
  
  try {
    const url = await Url.findOne({ shortCode: shortcode });
    
    if (!url) {
      await Log('backend', 'warn', 'utils', logMessage(`URL not found: ${shortcode}`));
      return next(createHttpError(404, 'Short URL not found'));
    }

    if (new Date() > url.expiry) {
      await Log('backend', 'warn', 'utils', logMessage(`Expired URL: ${shortcode}`));
      return next(createHttpError(410, 'This URL has expired'));
    }
    
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    const referrer = req.get('Referer') || 'Direct';
    const userAgent = req.get('User-Agent');
    
    url.clicks.push({
      referrer,
      geo: geo ? geo.country : 'Unknown',
      ip,
      userAgent
    });

    try {
      await url.save();
      await Log('backend', 'info', 'utils', 
        logMessage(`Redirect: ${shortcode} -> ${url.originalUrl}`)
      );
      res.redirect(302, url.originalUrl);
    } catch (error) {
      await Log('backend', 'error', 'utils', 
        logMessage(`Click save error: ${error.message}`)
      );
      res.redirect(302, url.originalUrl);
    }
  } catch (error) {
    await Log('backend', 'error', 'utils', 
      logMessage(`Redirect error: ${error.message}`)
    );
    next(error);
  }
};

export const getUrlStats = async (req, res, next) => {
  const { shortcode } = req.params;
  
  try {
    const url = await Url.findOne({ shortCode: shortcode });
    
    if (!url) {
      await Log('backend', 'warn', 'utils', logMessage(`Stats for invalid: ${shortcode}`));
      return next(createHttpError(404, 'Short URL not found'));
    }

    const stats = {
      totalClicks: url.clicks.length,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt.toISOString(),
      expiry: url.expiry.toISOString(),
      clicks: url.clicks.map(click => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer,
        geo: click.geo,
        userAgent: click.userAgent
      }))
    };

    await Log('backend', 'info', 'utils', 
      logMessage(`Stats: ${shortcode} (${stats.totalClicks} clicks)`)
    );
    
    res.json(stats);
  } catch (error) {
    await Log('backend', 'error', 'utils', 
      logMessage(`Stats error: ${error.message}`)
    );
    next(error);
  }
};
